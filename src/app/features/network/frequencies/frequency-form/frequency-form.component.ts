import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CreateFrequencyDto, EWeekday, Frequency, FrequencyResponse, UpdateFrequencyDto, WEEKDAYS, WEEKDAY_SHORT_LABELS } from '../frequency.dto';
import { formatDepartureTime } from '../frequency-format';
import { FrequenciesService } from '../frequencies.service';
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
export class FrequencyFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly frequenciesService = inject(FrequenciesService);
    private readonly notification = inject(NotificationService);

    readonly route = input.required<FrequencyResponse['route']>();
    readonly frequency = input<FrequencyResponse | null>(null);

    readonly created = output<Frequency>();
    readonly updated = output<FrequencyResponse>();
    readonly cancelled = output<void>();

    readonly weekdays = WEEKDAYS;
    readonly weekdayLabels = WEEKDAY_SHORT_LABELS;
    readonly maxBasePrice = MAX_BASE_PRICE;
    readonly isEdit = computed(() => this.frequency() !== null);

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        departureTime: ['', [Validators.required, Validators.pattern(TIME_PATTERN)]],
        weekdays: this.formBuilder.nonNullable.control<EWeekday[]>([], atLeastOneDay),
        basePrice: ['', [Validators.required, Validators.pattern(PRICE_PATTERN), Validators.min(0.01), Validators.max(MAX_BASE_PRICE)]],
    });

    ngOnInit(): void {
        const frequency = this.frequency();
        if (frequency) {
            this.form.setValue({
                departureTime: formatDepartureTime(frequency.departureTime),
                weekdays: WEEKDAYS.filter(day => frequency.weekdays.includes(day)),
                basePrice: String(Number(frequency.basePrice)),
            });
        }
    }

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
        const frequency = this.frequency();

        if (frequency) {
            this.update(frequency, { departureTime, weekdays, basePrice: Number(basePrice) });
            return;
        }

        const data: CreateFrequencyDto = {
            routeId: this.route().id,
            departureTime,
            weekdays,
            basePrice: Number(basePrice),
        };

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.frequenciesService.create(data).subscribe({
            next: created => {
                this.isSubmitting.set(false);
                this.notification.success(`Frecuencia de las ${departureTime} creada.`);
                this.created.emit(created);
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private update(frequency: FrequencyResponse, values: Required<UpdateFrequencyDto>): void {
        const changes: UpdateFrequencyDto = {
            ...(values.departureTime !== formatDepartureTime(frequency.departureTime) && { departureTime: values.departureTime }),
            ...(values.weekdays.join() !== WEEKDAYS.filter(day => frequency.weekdays.includes(day)).join() && { weekdays: values.weekdays }),
            ...(values.basePrice !== Number(frequency.basePrice) && { basePrice: values.basePrice }),
        };

        if (Object.keys(changes).length === 0) {
            this.cancelled.emit();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.frequenciesService.update(frequency.id, changes).subscribe({
            next: updated => {
                this.isSubmitting.set(false);
                this.notification.success(`Frecuencia #${updated.id} actualizada.`);
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
