import { Component, ChangeDetectionStrategy, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MAINTENANCE_TYPE_LABELS, MAINTENANCE_TYPE_TEXT_CLASSES } from '../../shared/enums/bus.enum';
import { BusResponse } from '../../shared/models/bus.dto';
import { BusesService } from '../../services/buses.service';
import { MaintenancesService } from '../../services/maintenances.service';
import { BusSearchComponent } from '../../buses/bus-search/bus-search.component';
import { toDate, toId } from '../../core/routing/query-params';
import { toDateInput } from '../../shared/utils/date-util';

const DEFAULT_RANGE_DAYS = 30;
const BUS_RESULTS_LIMIT = 5;

@Component({
    selector: 'app-maintenance-cost-report',
    templateUrl: './maintenance-cost-report.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, DatePipe, CurrencyPipe, BusSearchComponent]
})
export class MaintenanceCostReportComponent {
    private readonly maintenancesService = inject(MaintenancesService);
    private readonly busesService = inject(BusesService);
    private readonly router = inject(Router);

    readonly typeLabels = MAINTENANCE_TYPE_LABELS;
    readonly typeTextClasses = MAINTENANCE_TYPE_TEXT_CLASSES;

    readonly today = toDateInput(new Date());
    private readonly defaultStart = this.daysAgo(DEFAULT_RANGE_DAYS);

    // Enlazados a los query params ?busId=&startDate=&endDate= (withComponentInputBinding).
    readonly busId = input(null, { transform: toId });
    readonly startDateParam = input(null, { alias: 'startDate', transform: toDate });
    readonly endDateParam = input(null, { alias: 'endDate', transform: toDate });

    readonly startDate = computed(() => this.startDateParam() ?? this.defaultStart);
    readonly endDate = computed(() => this.endDateParam() ?? this.today);

    // La API exige que el fin sea estrictamente posterior al inicio.
    readonly isRangeValid = computed(() => this.startDate() < this.endDate());

    readonly busSearch = signal('');

    readonly busResultsResource = rxResource({
        params: () => this.busSearch() ? { page: 1, limit: BUS_RESULTS_LIMIT, search: this.busSearch() } : undefined,
        stream: ({ params }) => this.busesService.getAll(params),
    });

    readonly reportResource = rxResource({
        params: () => {
            const busId = this.busId();
            return busId && this.isRangeValid() ? { busId, startDate: this.startDate(), endDate: this.endDate() } : undefined;
        },
        stream: ({ params }) => this.maintenancesService.getCostReport(params),
    });

    readonly busResults = computed(() => this.busResultsResource.hasValue() ? this.busResultsResource.value().items : []);
    readonly report = computed(() => this.reportResource.hasValue() ? this.reportResource.value() : undefined);
    // El total y el promedio ignoran estos registros, así que hay que avisarlo junto a las cifras.
    readonly withoutCost = computed(() => this.report()?.items.filter(item => item.cost === null).length ?? 0);

    selectBus(bus: BusResponse): void {
        this.busSearch.set('');
        this.navigate({ busId: bus.id });
    }

    setStartDate(value: string): void {
        this.navigate({ startDate: toDate(value) });
    }

    setEndDate(value: string): void {
        this.navigate({ endDate: toDate(value) });
    }

    private daysAgo(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return toDateInput(date);
    }

    private navigate(queryParams: Record<string, string | number | null>): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
    }
}
