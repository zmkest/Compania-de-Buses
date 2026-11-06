import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { BusesService } from '../../services/buses.service';
import { toDateTime } from '../../core/routing/query-params';
import { toDateTimeLocal } from '../../shared/utils/date-util';

const DEFAULT_RANGE_HOURS = 24;

@Component({
    selector: 'app-bus-availability',
    templateUrl: './bus-availability.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe]
})
export class BusAvailabilityComponent {
    private readonly busesService = inject(BusesService);
    private readonly router = inject(Router);

    private readonly defaultStart = toDateTimeLocal(new Date());
    private readonly defaultFinish = toDateTimeLocal(new Date(Date.now() + DEFAULT_RANGE_HOURS * 60 * 60 * 1000));

    // Enlazados a los query params ?start=&finish= (withComponentInputBinding), en hora local.
    readonly startParam = input(null, { alias: 'start', transform: toDateTime });
    readonly finishParam = input(null, { alias: 'finish', transform: toDateTime });

    readonly start = computed(() => this.startParam() ?? this.defaultStart);
    readonly finish = computed(() => this.finishParam() ?? this.defaultFinish);

    // La API exige que el fin sea estrictamente posterior al inicio.
    readonly isRangeValid = computed(() => this.start() < this.finish());

    readonly availableResource = rxResource({
        params: () => this.isRangeValid()
            ? { startDate: new Date(this.start()).toISOString(), finishDate: new Date(this.finish()).toISOString() }
            : undefined,
        stream: ({ params }) => this.busesService.getAvailable(params),
    });

    readonly buses = computed(() => this.availableResource.hasValue() ? this.availableResource.value() : []);

    setStart(value: string): void {
        this.navigate({ start: toDateTime(value) });
    }

    setFinish(value: string): void {
        this.navigate({ finish: toDateTime(value) });
    }

    private navigate(queryParams: Record<string, string | null>): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
    }
}
