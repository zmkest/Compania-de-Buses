import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RoutesService } from '../routes.service';
import { WEEKDAY_SHORT_LABELS } from '../../frequencies/frequency.dto';
import { formatDuration } from '../route-format';
import { formatDepartureTime } from '../../frequencies/frequency-format';
import { FrequencyFormComponent } from '../../frequencies/frequency-form/frequency-form.component';

@Component({
    selector: 'app-route-detail-dialog',
    templateUrl: './route-detail-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CurrencyPipe, DecimalPipe, FrequencyFormComponent]
})
export class RouteDetailDialogComponent {
    private readonly routesService = inject(RoutesService);

    readonly routeId = input.required<number>();
    readonly isAdmin = input(false);

    readonly closed = output<void>();

    readonly isFrequencyFormOpen = signal(false);

    readonly weekdayLabels = WEEKDAY_SHORT_LABELS;
    readonly formatDuration = formatDuration;
    readonly formatDepartureTime = formatDepartureTime;

    readonly routeResource = rxResource({
        params: () => this.routeId(),
        stream: ({ params }) => this.routesService.getById(params),
    });

    readonly route = computed(() => this.routeResource.hasValue() ? this.routeResource.value() : undefined);

    onFrequencyCreated(): void {
        this.isFrequencyFormOpen.set(false);
        this.routeResource.reload();
    }
}
