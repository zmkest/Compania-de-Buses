import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTerminalDto, TerminalDetail, UpdateTerminalDto } from '../terminal.dto';
import { City } from '../../cities/city.dto';
import { TerminalsService } from '../terminals.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

// Mismos límites que valida la API.
const NAME_MAX_LENGTH = 150;
const ADDRESS_MAX_LENGTH = 250;

@Component({
    selector: 'app-terminal-form',
    templateUrl: './terminal-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class TerminalFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly terminalsService = inject(TerminalsService);
    private readonly notification = inject(NotificationService);

    readonly cities = input.required<City[]>();
    // null: crear; con id: editar (los datos actuales se piden a GET /terminals/:id).
    readonly terminalId = input<number | null>(null);

    readonly created = output();
    readonly updated = output<TerminalDetail>();
    readonly cancelled = output<void>();

    readonly nameMaxLength = NAME_MAX_LENGTH;
    readonly addressMaxLength = ADDRESS_MAX_LENGTH;
    readonly isEdit = computed(() => this.terminalId() !== null);

    readonly terminal = signal<TerminalDetail | null>(null);
    readonly isLoading = signal(false);
    readonly loadError = signal<string | null>(null);
    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(NAME_MAX_LENGTH)]],
        cityId: [null as number | null, Validators.required],
        address: ['', Validators.maxLength(ADDRESS_MAX_LENGTH)],
    });

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        const id = this.terminalId();
        if (id === null) {
            return;
        }

        this.isLoading.set(true);
        this.loadError.set(null);
        this.form.disable();

        this.terminalsService.getById(id).subscribe({
            next: terminal => {
                this.terminal.set(terminal);
                this.form.reset({ name: terminal.name, cityId: terminal.cityId, address: terminal.address ?? '' });
                this.form.enable();
                this.isLoading.set(false);
            },
            error: (err: AppError) => {
                this.loadError.set(err.message);
                this.isLoading.set(false);
            },
        });
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { name, cityId, address } = this.form.getRawValue();
        const values = { name: name.trim(), cityId: Number(cityId), address: address.trim() };
        const terminal = this.terminal();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        if (terminal) {
            this.update(terminal, values);
            return;
        }

        // La API rechaza una dirección vacía; si no se escribe, no se envía.
        const data: CreateTerminalDto = { name: values.name, cityId: values.cityId, ...(values.address && { address: values.address }) };

        this.terminalsService.create(data).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Terminal ${data.name} creado.`);
                this.created.emit();
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private update(terminal: TerminalDetail, values: { name: string; cityId: number; address: string }): void {
        // Solo se envían los campos modificados; vaciar la dirección la borra (null).
        const changes: UpdateTerminalDto = {
            ...(values.name !== terminal.name && { name: values.name }),
            ...(values.cityId !== terminal.cityId && { cityId: values.cityId }),
            ...(values.address !== (terminal.address ?? '') && { address: values.address || null }),
        };

        if (Object.keys(changes).length === 0) {
            this.isSubmitting.set(false);
            this.cancelled.emit();
            return;
        }

        this.terminalsService.update(terminal.id, changes).subscribe({
            next: updated => {
                this.isSubmitting.set(false);
                this.notification.success(`Terminal ${updated.name} actualizado.`);
                this.updated.emit(updated);
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private onSubmitError(err: AppError): void {
        this.isSubmitting.set(false);
        this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
    }
}
