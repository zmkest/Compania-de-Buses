import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RoutesService } from '../routes.service';
import { WEEKDAY_SHORT_LABELS } from '../route.dto';
import { formatDepartureTime, formatDuration } from '../route-format';

@Component({
    selector: 'app-route-detail-dialog',
    templateUrl: './route-detail-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CurrencyPipe, DecimalPipe]
})
export class RouteDetailDialogComponent {
    private readonly routesService = inject(RoutesService);

    readonly routeId = input.required<number>();

    readonly closed = output<void>();

    readonly weekdayLabels = WEEKDAY_SHORT_LABELS;
    readonly formatDuration = formatDuration;
    readonly formatDepartureTime = formatDepartureTime;

    readonly routeResource = rxResource({
        params: () => this.routeId(),
        stream: ({ params }) => this.routesService.getById(params),
    });

    readonly route = computed(() => this.routeResource.hasValue() ? this.routeResource.value() : undefined);
}
