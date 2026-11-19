import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { Rotation, RotationDetail, UpdateRotationDto, UpdatedRotation } from '../rotation.dto';
import { RotationsService } from '../rotations.service';
import { BusesService } from '../../../fleet/buses/buses.service';
import { BUS_STATUS_LABELS, EBusStatus } from '../../../fleet/buses/bus.enum';
import { FrequenciesService } from '../../../network/frequencies/frequencies.service';
import { EWeekday, WEEKDAYS, WEEKDAY_LABELS } from '../../../network/frequencies/frequency.dto';
import { formatDepartureTime } from '../../../network/frequencies/frequency-format';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

const MAX_NAME_LENGTH = 100;
const MAX_LEGS = 100;

interface LegValue {
    weekday: string;
    frequencyId: string;
}

interface FrequencyOption {
    id: number;
    departureTime: string;
    isActive: boolean;
    weekdays: EWeekday[];
    route: {
        origin: { city: { name: string } };
        destination: { city: { name: string } };
    };
}

const legKey = (leg: LegValue) => `${leg.frequencyId}:${leg.weekday}`;

const legsSignature = (legs: LegValue[]) => legs.map(legKey).sort().join('|');

function uniqueLegs(control: AbstractControl<LegValue[]>): ValidationErrors | null {
    const keys = control.value.filter(leg => leg.weekday && leg.frequencyId).map(legKey);
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

    readonly rotationId = input<number | null>(null);

    readonly created = output<Rotation>();
    readonly updated = output<UpdatedRotation>();
    readonly cancelled = output<void>();

    readonly maxNameLength = MAX_NAME_LENGTH;
    readonly maxLegs = MAX_LEGS;
    readonly weekdays = WEEKDAYS;
    readonly weekdayLabels = WEEKDAY_LABELS;
    readonly busStatusLabels = BUS_STATUS_LABELS;
    readonly formatDepartureTime = formatDepartureTime;
    readonly isEdit = computed(() => this.rotationId() !== null);

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(MAX_NAME_LENGTH)]],
        busId: [''],
        legs: this.formBuilder.nonNullable.array([this.createLeg()], [Validators.required, uniqueLegs]),
    });

    private readonly legsValue = toSignal(this.form.controls.legs.valueChanges, { initialValue: this.form.controls.legs.getRawValue() });

    readonly rotationResource = rxResource({
        params: () => this.rotationId() ?? undefined,
        stream: ({ params }) => this.rotationsService.getById(params).pipe(tap(rotation => this.fill(rotation))),
    });

    readonly busesResource = rxResource({
        params: () => this.isEdit() ? undefined : true,
        stream: () => this.busesService.getAllOptions(),
    });

    readonly frequenciesResource = rxResource({
        stream: () => this.frequenciesService.getActiveOptions(),
    });

    readonly rotation = computed(() => this.rotationResource.hasValue() ? this.rotationResource.value() : undefined);

    readonly buses = computed(() =>
        this.busesResource.hasValue() ? this.busesResource.value().filter(bus => bus.status !== EBusStatus.OUT_OF_SERVICE) : []
    );

    private readonly currentLegOptions = computed<FrequencyOption[]>(() =>
        (this.rotation()?.legs ?? []).map(leg => ({ ...leg.frequency, weekdays: [leg.weekday] }))
    );

    readonly frequenciesByWeekday = computed(() => {
        const active: FrequencyOption[] = this.frequenciesResource.hasValue() ? this.frequenciesResource.value() : [];
        const current = this.currentLegOptions();
        return Object.fromEntries(
            WEEKDAYS.map(weekday => {
                const options = active.filter(frequency => frequency.weekdays.includes(weekday));
                const missing = current.filter(frequency => frequency.weekdays.includes(weekday) && !options.some(option => option.id === frequency.id));
                return [weekday, [...options, ...missing].sort((a, b) => a.departureTime.localeCompare(b.departureTime))];
            })
        ) as Record<EWeekday, FrequencyOption[]>;
    });

    readonly legCount = computed(() => this.legsValue().length);

    readonly hasInactiveLegs = computed(() =>
        this.legsValue().some(leg =>
            this.frequenciesFor(leg.weekday ?? '').some(frequency => frequency.id === Number(leg.frequencyId) && !frequency.isActive)
        )
    );

    private originalName = '';
    private originalLegs = '';

    frequenciesFor(weekday: string): FrequencyOption[] {
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
        const legsDto = legs.map(leg => ({ frequencyId: Number(leg.frequencyId), weekday: leg.weekday as EWeekday }));
        const rotationId = this.rotationId();

        if (rotationId !== null) {
            const changes: UpdateRotationDto = {
                ...(name.trim() !== this.originalName && { name: name.trim() }),
                ...(legsSignature(legs) !== this.originalLegs && { legs: legsDto }),
            };
            if (Object.keys(changes).length === 0) {
                this.cancelled.emit();
                return;
            }
            this.update(rotationId, changes);
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.rotationsService.create({
            name: name.trim(),
            ...(busId && { busId: Number(busId) }),
            legs: legsDto,
        }).subscribe({
            next: created => {
                this.isSubmitting.set(false);
                this.notification.success(`Rotación "${created.name}" creada.`);
                this.created.emit(created);
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private update(id: number, changes: UpdateRotationDto): void {
        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.rotationsService.update(id, changes).subscribe({
            next: updated => {
                this.isSubmitting.set(false);
                const detached = updated.detachedTrips
                    ? ` ${updated.detachedTrips} ${updated.detachedTrips === 1 ? 'viaje futuro dejó' : 'viajes futuros dejaron'} de pertenecer a la rotación.`
                    : '';
                this.notification.success(`Rotación "${updated.name}" actualizada.${detached}`);
                this.updated.emit(updated);
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private onSubmitError(err: AppError): void {
        this.isSubmitting.set(false);
        this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
    }

    private fill(rotation: RotationDetail): void {
        const legs = rotation.legs.map(leg => ({ weekday: leg.weekday, frequencyId: String(leg.frequency.id) }));
        this.originalName = rotation.name;
        this.originalLegs = legsSignature(legs);
        this.legs.clear();
        legs.forEach(() => this.legs.push(this.createLeg()));
        this.form.setValue({
            name: rotation.name,
            busId: rotation.busId === null ? '' : String(rotation.busId),
            legs,
        });
    }

    private createLeg() {
        return this.formBuilder.nonNullable.group({
            weekday: ['', Validators.required],
            frequencyId: ['', Validators.required],
        });
    }
}
