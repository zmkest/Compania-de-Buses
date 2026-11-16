import { Component, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CreateFrequencyDto, EWeekday, Frequency, WEEKDAYS, WEEKDAY_SHORT_LABELS } from '../frequency.dto';
import { FrequenciesService } from '../frequencies.service';
import { RouteResponse } from '../../routes/route.dto';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

const MAX_BASE_PRICE = 99999999.99;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function atLeastOneDay(control: AbstractControl<EWeekday[]>): ValidationErrors | null {
    return control.value?.length ? null : { required: true };
}

@Component({
    selector: 'app-frequency-form',
    templateUrl: './frequency-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class FrequencyFormComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly frequenciesService = inject(FrequenciesService);
    private readonly notification = inject(NotificationService);

    readonly route = input.required<RouteResponse>();

    readonly created = output<Frequency>();
    readonly cancelled = output<void>();

    readonly weekdays = WEEKDAYS;
    readonly weekdayLabels = WEEKDAY_SHORT_LABELS;
    readonly maxBasePrice = MAX_BASE_PRICE;

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        departureTime: ['', [Validators.required, Validators.pattern(TIME_PATTERN)]],
        weekdays: this.formBuilder.nonNullable.control<EWeekday[]>([], atLeastOneDay),
        basePrice: ['', [Validators.required, Validators.pattern(PRICE_PATTERN), Validators.min(0.01), Validators.max(MAX_BASE_PRICE)]],
    });

    isSelected(day: EWeekday): boolean {
        return this.form.controls.weekdays.value.includes(day);
    }

    toggleDay(day: EWeekday): void {
        const control = this.form.controls.weekdays;
        const selected = control.value.includes(day) ? control.value.filter(item => item !== day) : [...control.value, day];
        control.setValue(WEEKDAYS.filter(item => selected.includes(item)));
        control.markAsTouched();
    }

    selectAllDays(): void {
        const control = this.form.controls.weekdays;
        control.setValue(control.value.length === WEEKDAYS.length ? [] : [...WEEKDAYS]);
        control.markAsTouched();
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { departureTime, weekdays, basePrice } = this.form.getRawValue();
        const data: CreateFrequencyDto = {
            routeId: this.route().id,
            departureTime,
            weekdays,
            basePrice: Number(basePrice),
        };

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.frequenciesService.create(data).subscribe({
            next: frequency => {
                this.isSubmitting.set(false);
                this.notification.success(`Frecuencia de las ${departureTime} creada.`);
                this.created.emit(frequency);
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }
}
