import { Component, ChangeDetectionStrategy, computed, inject, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Rotation } from '../rotation.dto';
import { RotationsService } from '../rotations.service';
import { BusesService } from '../../../fleet/buses/buses.service';
import { BUS_STATUS_LABELS, EBusStatus } from '../../../fleet/buses/bus.enum';
import { FrequenciesService } from '../../../network/frequencies/frequencies.service';
import { EWeekday, FrequencyResponse, WEEKDAYS, WEEKDAY_LABELS } from '../../../network/frequencies/frequency.dto';
import { formatDepartureTime } from '../../../network/frequencies/frequency-format';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

const MAX_NAME_LENGTH = 100;
const MAX_LEGS = 100;

function uniqueLegs(control: AbstractControl<{ weekday: string; frequencyId: string }[]>): ValidationErrors | null {
    const keys = control.value.filter(leg => leg.weekday && leg.frequencyId).map(leg => `${leg.frequencyId}:${leg.weekday}`);
    return new Set(keys).size === keys.length ? null : { duplicated: true };
}

@Component({
    selector: 'app-rotation-form',
    templateUrl: './rotation-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class RotationFormComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly rotationsService = inject(RotationsService);
    private readonly busesService = inject(BusesService);
    private readonly frequenciesService = inject(FrequenciesService);
    private readonly notification = inject(NotificationService);

    readonly created = output<Rotation>();
    readonly cancelled = output<void>();

    readonly maxNameLength = MAX_NAME_LENGTH;
    readonly maxLegs = MAX_LEGS;
    readonly weekdays = WEEKDAYS;
    readonly weekdayLabels = WEEKDAY_LABELS;
    readonly busStatusLabels = BUS_STATUS_LABELS;
    readonly formatDepartureTime = formatDepartureTime;

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(MAX_NAME_LENGTH)]],
        busId: [''],
        legs: this.formBuilder.nonNullable.array([this.createLeg()], [Validators.required, uniqueLegs]),
    });

    private readonly legsValue = toSignal(this.form.controls.legs.valueChanges, { initialValue: this.form.controls.legs.getRawValue() });

    readonly busesResource = rxResource({
        stream: () => this.busesService.getAllOptions(),
    });

    readonly frequenciesResource = rxResource({
        stream: () => this.frequenciesService.getActiveOptions(),
    });

    readonly buses = computed(() =>
        this.busesResource.hasValue() ? this.busesResource.value().filter(bus => bus.status !== EBusStatus.OUT_OF_SERVICE) : []
    );

    readonly frequenciesByWeekday = computed(() => {
        const frequencies = this.frequenciesResource.hasValue() ? this.frequenciesResource.value() : [];
        return Object.fromEntries(
            WEEKDAYS.map(weekday => [weekday, frequencies.filter(frequency => frequency.weekdays.includes(weekday))])
        ) as Record<EWeekday, FrequencyResponse[]>;
    });

    readonly legCount = computed(() => this.legsValue().length);

    frequenciesFor(weekday: string): FrequencyResponse[] {
        return this.frequenciesByWeekday()[weekday as EWeekday] ?? [];
    }

    get legs() {
        return this.form.controls.legs;
    }

    addLeg(): void {
        if (this.legs.length < MAX_LEGS) {
            this.legs.push(this.createLeg());
        }
    }

    removeLeg(index: number): void {
        if (this.legs.length > 1) {
            this.legs.removeAt(index);
        }
    }

    onWeekdayChange(index: number): void {
        const leg = this.legs.at(index).controls;
        const frequencyId = Number(leg.frequencyId.value);
        if (frequencyId && !this.frequenciesFor(leg.weekday.value).some(frequency => frequency.id === frequencyId)) {
            leg.frequencyId.setValue('');
        }
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { name, busId, legs } = this.form.getRawValue();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.rotationsService.create({
            name: name.trim(),
            ...(busId && { busId: Number(busId) }),
            legs: legs.map(leg => ({ frequencyId: Number(leg.frequencyId), weekday: leg.weekday as EWeekday })),
        }).subscribe({
            next: created => {
                this.isSubmitting.set(false);
                this.notification.success(`Rotación "${created.name}" creada.`);
                this.created.emit(created);
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    private createLeg() {
        return this.formBuilder.nonNullable.group({
            weekday: ['', Validators.required],
            frequencyId: ['', Validators.required],
        });
    }
}
