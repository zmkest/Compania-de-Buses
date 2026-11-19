import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TripsService } from '../trips.service';
import { CREW_POSITION_LABELS, TRIP_STATUS_BADGE_CLASSES, TRIP_STATUS_LABELS } from '../trip.dto';
import { BUS_STATUS_BADGE_CLASSES, BUS_STATUS_LABELS } from '../../../fleet/buses/bus.enum';
import { formatDuration } from '../../../network/routes/route-format';

@Component({
    selector: 'app-trip-detail-dialog',
    templateUrl: './trip-detail-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CurrencyPipe, DatePipe, DecimalPipe]
})
export class TripDetailDialogComponent {
    private readonly tripsService = inject(TripsService);

    readonly tripId = input.required<number>();

    readonly closed = output<void>();

    readonly statusLabels = TRIP_STATUS_LABELS;
    readonly statusBadgeClasses = TRIP_STATUS_BADGE_CLASSES;
    readonly busStatusLabels = BUS_STATUS_LABELS;
    readonly busStatusBadgeClasses = BUS_STATUS_BADGE_CLASSES;
    readonly positionLabels = CREW_POSITION_LABELS;
    readonly formatDuration = formatDuration;

    readonly tripResource = rxResource({
        params: () => this.tripId(),
        stream: ({ params }) => this.tripsService.getById(params),
    });

    readonly trip = computed(() => this.tripResource.hasValue() ? this.tripResource.value() : undefined);

    readonly occupiedSeats = computed(() => {
        const trip = this.trip();
        return trip && trip.totalSeats !== null && trip.seatsLeft !== null ? trip.totalSeats - trip.seatsLeft : null;
    });
}
