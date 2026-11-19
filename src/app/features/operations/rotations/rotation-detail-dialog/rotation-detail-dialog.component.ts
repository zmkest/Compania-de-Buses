import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RotationsService } from '../rotations.service';
import { RotationLeg } from '../rotation.dto';
import { BUS_STATUS_BADGE_CLASSES, BUS_STATUS_LABELS } from '../../../fleet/buses/bus.enum';
import { EWeekday, WEEKDAYS, WEEKDAY_LABELS } from '../../../network/frequencies/frequency.dto';
import { formatArrivalTime, formatDepartureTime } from '../../../network/frequencies/frequency-format';
import { formatDuration } from '../../../network/routes/route-format';

@Component({
    selector: 'app-rotation-detail-dialog',
    templateUrl: './rotation-detail-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe]
})
export class RotationDetailDialogComponent {
    private readonly rotationsService = inject(RotationsService);

    readonly rotationId = input.required<number>();

    readonly closed = output<void>();

    readonly weekdayLabels = WEEKDAY_LABELS;
    readonly busStatusLabels = BUS_STATUS_LABELS;
    readonly busStatusBadgeClasses = BUS_STATUS_BADGE_CLASSES;
    readonly formatDepartureTime = formatDepartureTime;
    readonly formatArrivalTime = formatArrivalTime;
    readonly formatDuration = formatDuration;

    readonly rotationResource = rxResource({
        params: () => this.rotationId(),
        stream: ({ params }) => this.rotationsService.getById(params),
    });

    readonly rotation = computed(() => this.rotationResource.hasValue() ? this.rotationResource.value() : undefined);

    readonly days = computed(() => {
        const legs = this.rotation()?.legs ?? [];
        return WEEKDAYS
            .map(weekday => ({
                weekday,
                legs: legs
                    .filter(leg => leg.weekday === weekday)
                    .sort((a, b) => a.frequency.departureTime.localeCompare(b.frequency.departureTime)),
            }))
            .filter((day): day is { weekday: EWeekday; legs: RotationLeg[] } => day.legs.length > 0);
    });

    readonly hasInactiveFrequencies = computed(() => this.rotation()?.legs.some(leg => !leg.frequency.isActive) ?? false);
}
