import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BUS_STATUS_LABELS, EBusStatus } from '../../shared/enums/bus.enum';
import { BusResponse, UpdateBusDto } from '../../shared/models/bus.dto';
import { BusesService } from '../../services/buses.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';
import { obtenerCamposModificados } from '../../shared/utils/form-util';

// Mismo formato que valida la API (IsPlate).
const PLATE_PATTERN = /^([A-Z]{3}-?\d{3,4}|[A-Z]{2}-?\d{3}[A-Z])$/;
const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 1;

@Component({
    selector: 'app-bus-form',
    templateUrl: './bus-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePipe]
})
export class BusFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly busesService = inject(BusesService);
    private readonly notification = inject(NotificationService);

    readonly bus = input<BusResponse | null>(null);

    readonly created = output();
    readonly updated = output<{ id: number; changes: UpdateBusDto }>();
    readonly cancelled = output<void>();

    // "En ruta" lo asigna el módulo de viajes, no se elige a mano.
    readonly statuses = Object.values(EBusStatus).filter(status => status !== EBusStatus.ON_ROUTE);
    readonly statusLabels = BUS_STATUS_LABELS;
    readonly minYear = MIN_YEAR;
    readonly maxYear = MAX_YEAR;
    readonly isEdit = computed(() => this.bus() !== null);

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        plate: ['', [Validators.required, Validators.pattern(PLATE_PATTERN)]],
        model: ['', [Validators.required, Validators.minLength(2)]],
        year: [MAX_YEAR - 1, [Validators.required, Validators.min(MIN_YEAR), Validators.max(MAX_YEAR)]],
        odometerKm: [0, [Validators.required, Validators.min(0)]],
    });

    ngOnInit(): void {
        const bus = this.bus();
        if (bus) {
            this.form.patchValue({
                plate: bus.plate,
                model: bus.model,
                year: bus.year,
                odometerKm: bus.odometerKm,
            });
            this.form.controls.plate.disable();
        }
    }

    normalizePlate(): void {
        const control = this.form.controls.plate;
        control.setValue(control.value.trim().toUpperCase());
    }

    submit(): void {
        this.normalizePlate();
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const bus = this.bus();
        const { plate, model, year, odometerKm } = this.form.getRawValue();
        const data = { plate, model: model.trim(), year: Number(year), odometerKm: Number(odometerKm) };

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        if (bus) {
            const busId = bus.id;
            const busUpdate = obtenerCamposModificados(bus, data);

            this.busesService.update(busId, busUpdate).subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.notification.success(`Bus ${plate} actualizado.`);
                    this.updated.emit({ id: busId, changes: data });
                },
                error: (err: AppError) => {
                    this.isSubmitting.set(false);
                    this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
                },
            });
            return;
        }

        this.busesService.create(data).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Bus ${plate} creado.`);
                this.created.emit();
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }
}
