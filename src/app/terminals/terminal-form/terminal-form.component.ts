import { Component, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { City, CreateTerminalDto } from '../../shared/models/terminal.dto';
import { TerminalsService } from '../../services/terminals.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';

// Mismos límites que valida la API.
const NAME_MAX_LENGTH = 150;
const ADDRESS_MAX_LENGTH = 250;

@Component({
    selector: 'app-terminal-form',
    templateUrl: './terminal-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class TerminalFormComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly terminalsService = inject(TerminalsService);
    private readonly notification = inject(NotificationService);

    readonly cities = input.required<City[]>();

    readonly created = output();
    readonly cancelled = output<void>();

    readonly nameMaxLength = NAME_MAX_LENGTH;
    readonly addressMaxLength = ADDRESS_MAX_LENGTH;

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(NAME_MAX_LENGTH)]],
        cityId: [null as number | null, Validators.required],
        address: ['', Validators.maxLength(ADDRESS_MAX_LENGTH)],
    });

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { name, cityId, address } = this.form.getRawValue();
        // La API rechaza una dirección vacía; si no se escribe, no se envía.
        const data: CreateTerminalDto = { name: name.trim(), cityId: Number(cityId), ...(address.trim() && { address: address.trim() }) };

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.terminalsService.create(data).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Terminal ${data.name} creado.`);
                this.created.emit();
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }
}
