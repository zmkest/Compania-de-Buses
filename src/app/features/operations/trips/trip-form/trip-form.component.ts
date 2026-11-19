import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TripResponse, UpdateTripDto } from '../trip.dto';
import { TripsService } from '../trips.service';
import { BusesService } from '../../../fleet/buses/buses.service';
import { BUS_STATUS_LABELS, EBusStatus } from '../../../fleet/buses/bus.enum';
import { RouteResponse } from '../../../network/routes/route.dto';
import { formatDuration } from '../../../network/routes/route-format';
import { toDateTimeLocal } from '../../../../shared/utils/date-util';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

const MAX_PRICE = 99999999.99;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

function futureDateTime(unchanged: () => string | null) {
    return (control: AbstractControl<string>): ValidationErrors | null => {
        const time = Date.parse(control.value);
        if (!control.value || Number.isNaN(time) || control.value === unchanged()) {
            return null;
        }
        return time > Date.now() ? null : { past: true };
    };
}

@Component({
    selector: 'app-trip-form',
    templateUrl: './trip-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePipe]
})
export class TripFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly tripsService = inject(TripsService);
    private readonly busesService = inject(BusesService);
    private readonly notification = inject(NotificationService);

    readonly routes = input.required<RouteResponse[]>();
    readonly trip = input<TripResponse | null>(null);

    readonly created = output<TripResponse>();
    readonly updated = output<TripResponse>();
    readonly cancelled = output<void>();

    readonly maxPrice = MAX_PRICE;
    readonly busStatusLabels = BUS_STATUS_LABELS;
    readonly formatDuration = formatDuration;
    readonly minDeparture = toDateTimeLocal(new Date());
    readonly isEdit = computed(() => this.trip() !== null);

    private originalDeparture: string | null = null;

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        routeId: ['', Validators.required],
        busId: ['', Validators.required],
        scheduledDeparture: ['', [Validators.required, futureDateTime(() => this.originalDeparture)]],
        price: ['', [Validators.required, Validators.pattern(PRICE_PATTERN), Validators.min(0.01), Validators.max(MAX_PRICE)]],
    });

    ngOnInit(): void {
        const trip = this.trip();
        if (!trip) {
            return;
        }
        this.originalDeparture = toDateTimeLocal(new Date(trip.scheduledDeparture));
        this.form.controls.busId.removeValidators(Validators.required);
        this.form.setValue({
            routeId: String(trip.route.id),
            busId: trip.busId === null ? '' : String(trip.busId),
            scheduledDeparture: this.originalDeparture,
            price: String(Number(trip.price)),
        });
        this.form.controls.routeId.disable();
    }

    private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

    readonly busesResource = rxResource({
        stream: () => this.busesService.getAllOptions(),
    });

    readonly buses = computed(() =>
        this.busesResource.hasValue()
            ? this.busesResource.value().filter(bus => bus.status !== EBusStatus.OUT_OF_SERVICE || bus.id === this.trip()?.busId)
            : []
    );

    readonly selectedRoute = computed(() => {
        const routeId = Number(this.formValue().routeId);
        return this.routes().find(route => route.id === routeId) ?? null;
    });

    readonly arrival = computed(() => {
        const route = this.selectedRoute();
        const departure = Date.parse(this.formValue().scheduledDeparture ?? '');
        if (!route || Number.isNaN(departure)) {
            return null;
        }
        return new Date(departure + route.durationMinutes * 60_000);
    });

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { routeId, busId, scheduledDeparture, price } = this.form.getRawValue();
        const trip = this.trip();

        if (trip) {
            this.update(trip, { busId, scheduledDeparture, price });
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.tripsService.create({
            routeId: Number(routeId),
            busId: Number(busId),
            scheduledDeparture: new Date(scheduledDeparture).toISOString(),
            price: Number(price),
        }).subscribe({
            next: created => {
                this.isSubmitting.set(false);
                this.notification.success(`Viaje #${created.id} creado.`);
                this.created.emit(created);
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private update(trip: TripResponse, values: { busId: string; scheduledDeparture: string; price: string }): void {
        const busId = values.busId ? Number(values.busId) : null;
        const price = Number(values.price);
        const changes: UpdateTripDto = {
            ...(values.scheduledDeparture !== this.originalDeparture && { scheduledDeparture: new Date(values.scheduledDeparture).toISOString() }),
            ...(busId !== trip.busId && { busId }),
            ...(price !== Number(trip.price) && { price }),
        };

        if (Object.keys(changes).length === 0) {
            this.cancelled.emit();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.tripsService.update(trip.id, changes).subscribe({
            next: updated => {
                this.isSubmitting.set(false);
                this.notification.success(`Viaje #${updated.id} actualizado.`);
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
