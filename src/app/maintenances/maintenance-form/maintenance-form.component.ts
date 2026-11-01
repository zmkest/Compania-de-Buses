import { Component, ChangeDetectionStrategy, OnInit, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EMaintenanceType, MAINTENANCE_TYPE_LABELS } from '../../shared/enums/bus.enum';
import { MaintenanceResponse, UpdateMaintenanceDto } from '../../shared/models/maintenance.dto';
import { MaintenancesService } from '../../services/maintenances.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';
import { obtenerCamposModificados } from '../../shared/utils/form-util';
import { toDateTimeLocal } from '../../shared/utils/date-util';

const MAX_TEXT_LENGTH = 255;
const COST_PATTERN = /^\d+(\.\d{1,2})?$/;

// Mismas reglas que la API (MaxDate) y, si ya terminó, no puede iniciar después del fin.
function startedAtValidator(finishedAt: Date | null) {
    return (control: AbstractControl<string>): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }
        const startedAt = new Date(control.value);
        if (startedAt > new Date()) {
            return { future: true };
        }
        return finishedAt && startedAt > new Date(finishedAt) ? { afterFinish: true } : null;
    };
}

@Component({
    selector: 'app-maintenance-form',
    templateUrl: './maintenance-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePipe]
})
export class MaintenanceFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly maintenancesService = inject(MaintenancesService);
    private readonly notification = inject(NotificationService);

    readonly maintenance = input.required<MaintenanceResponse>();

    readonly updated = output<{ id: number; changes: Partial<MaintenanceResponse> }>();
    readonly cancelled = output<void>();

    readonly types = Object.values(EMaintenanceType);
    readonly typeLabels = MAINTENANCE_TYPE_LABELS;
    readonly maxTextLength = MAX_TEXT_LENGTH;
    readonly maxStartedAt = toDateTimeLocal(new Date());

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        type: [EMaintenanceType.PREVENTIVE, Validators.required],
        startedAt: ['', Validators.required],
        description: ['', Validators.maxLength(MAX_TEXT_LENGTH)],
        cost: ['', Validators.pattern(COST_PATTERN)],
    });

    ngOnInit(): void {
        const maintenance = this.maintenance();
        this.form.patchValue(this.toFormValue(maintenance));
        this.form.controls.startedAt.addValidators(startedAtValidator(maintenance.finishedAt));
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const maintenance = this.maintenance();
        const changes = obtenerCamposModificados(this.toFormValue(maintenance), this.normalize(this.form.getRawValue()));

        const data: UpdateMaintenanceDto = { busId: maintenance.busId };
        if (changes.type) {
            data.type = changes.type;
        }
        if (changes.startedAt) {
            data.startedAt = new Date(changes.startedAt).toISOString();
        }
        if (changes.description !== undefined) {
            data.description = changes.description;
        }
        if (changes.cost) {
            data.cost = Number(changes.cost);
        }

        // Sin cambios (la API no permite vaciar el costo, así que borrarlo tampoco cuenta).
        if (Object.keys(data).length === 1) {
            this.cancelled.emit();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.maintenancesService.update(maintenance.id, data).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Mantenimiento #${maintenance.id} actualizado.`);
                this.updated.emit({ id: maintenance.id, changes: this.toResponseChanges(data) });
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    // Mismo formato que el formulario para comparar sin falsos cambios (Decimal en texto, segundos en la fecha).
    private toFormValue(maintenance: MaintenanceResponse) {
        return this.normalize({
            type: maintenance.type,
            startedAt: toDateTimeLocal(new Date(maintenance.startedAt)),
            description: maintenance.description ?? '',
            cost: maintenance.cost === null ? '' : String(Number(maintenance.cost)),
        });
    }

    private normalize(value: { type: EMaintenanceType; startedAt: string; description: string; cost: string }) {
        // <input type="number"> entrega number, o null si está vacío.
        const cost = String(value.cost ?? '').trim();
        return {
            ...value,
            description: value.description.trim(),
            cost: cost === '' ? '' : String(Number(cost)),
        };
    }

    private toResponseChanges({ busId, startedAt, ...rest }: UpdateMaintenanceDto): Partial<MaintenanceResponse> {
        return { ...rest, ...(startedAt ? { startedAt: new Date(startedAt) } : {}) };
    }
}
