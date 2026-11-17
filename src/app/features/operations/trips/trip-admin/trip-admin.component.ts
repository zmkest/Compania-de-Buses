import { Component, ChangeDetectionStrategy, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { TripSortBy, TripsService } from '../trips.service';
import { RoutesService } from '../../../network/routes/routes.service';
import { TRIP_STATUSES, TRIP_STATUS_BADGE_CLASSES, TRIP_STATUS_LABELS } from '../trip.dto';
import { SortOrder } from '../../../../core/http/paginated';
import { toDate, toId, toOneOf, toPage, toSearch } from '../../../../core/routing/query-params';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';

const PAGE_SIZE = 10;
const SORT_FIELDS: TripSortBy[] = ['id', 'scheduledDeparture', 'price'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];
const BOOLEAN_VALUES = ['true', 'false'] as const;

const DEFAULT_SORT_BY: TripSortBy = 'scheduledDeparture';
const DEFAULT_ORDER: SortOrder = 'asc';

@Component({
    selector: 'app-trip-admin',
    templateUrl: './trip-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CurrencyPipe, DatePipe, NgTemplateOutlet, SearchBoxComponent]
})
export class TripAdminComponent {
    private readonly tripsService = inject(TripsService);
    private readonly routesService = inject(RoutesService);
    private readonly router = inject(Router);

    readonly page = input(1, { transform: toPage });
    readonly routeId = input(null, { transform: toId });
    readonly busPlate = input('', { transform: toSearch });
    readonly status = input(null, { transform: toOneOf(TRIP_STATUSES) });
    readonly from = input(null, { transform: toDate });
    readonly to = input(null, { transform: toDate });
    readonly unassigned = input(null, { transform: (value: string | undefined) => {
        const unassigned = toOneOf(BOOLEAN_VALUES)(value);
        return unassigned === null ? null : unassigned === 'true';
    } });
    readonly sortBy = input<TripSortBy, string | undefined>(DEFAULT_SORT_BY, { transform: value => toOneOf(SORT_FIELDS)(value) ?? DEFAULT_SORT_BY });
    readonly order = input<SortOrder, string | undefined>(DEFAULT_ORDER, { transform: value => toOneOf(SORT_ORDERS)(value) ?? DEFAULT_ORDER });

    readonly statuses = TRIP_STATUSES;
    readonly statusLabels = TRIP_STATUS_LABELS;
    readonly statusBadgeClasses = TRIP_STATUS_BADGE_CLASSES;

    readonly hasFilters = computed(() =>
        this.routeId() !== null || !!this.busPlate() || this.status() !== null || !!this.from() || !!this.to() || this.unassigned() !== null
    );

    readonly tripsResource = rxResource({
        params: () => {
            const from = this.from();
            const to = this.to();
            const unassigned = this.unassigned();
            return {
                page: this.page(),
                limit: PAGE_SIZE,
                routeId: this.routeId(),
                busPlate: unassigned ? '' : this.busPlate(),
                status: this.status(),
                from,
                to: from && to && to < from ? null : to,
                unassigned,
                sortBy: this.sortBy(),
                order: this.order(),
            };
        },
        stream: ({ params }) => this.tripsService.getAll(params),
    });

    readonly routesResource = rxResource({
        stream: () => this.routesService.getAllOptions(),
    });

    private readonly tripsPage = computed(() => this.tripsResource.hasValue() ? this.tripsResource.value() : undefined);

    readonly trips = computed(() => this.tripsPage()?.items ?? []);
    readonly total = computed(() => this.tripsPage()?.meta.total);
    readonly totalPages = computed(() => this.tripsPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

    readonly routes = computed(() => this.routesResource.hasValue() ? this.routesResource.value() : []);

    constructor() {
        effect(() => {
            const totalPages = this.totalPages();
            if (this.tripsResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    onRouteChange(value: string): void {
        this.navigate({ routeId: value || null, page: null });
    }

    onBusPlateSearch(busPlate: string): void {
        if (busPlate === this.busPlate()) {
            return;
        }
        this.navigate({ busPlate: busPlate || null, page: null }, true);
    }

    onStatusChange(value: string): void {
        this.navigate({ status: value || null, page: null });
    }

    onUnassignedChange(value: string): void {
        this.navigate({ unassigned: value || null, ...(value === 'true' ? { busPlate: null } : {}), page: null });
    }

    setFrom(value: string): void {
        const from = toDate(value);
        const to = this.to();
        const clearTo = !!from && !!to && to < from;
        this.navigate({ from, ...(clearTo ? { to: null } : {}), page: null });
    }

    setTo(value: string): void {
        this.navigate({ to: toDate(value), page: null });
    }

    clearFilters(): void {
        this.navigate({ routeId: null, busPlate: null, status: null, from: null, to: null, unassigned: null, page: null });
    }

    sort(field: TripSortBy): void {
        const order: SortOrder = field === this.sortBy() && this.order() === 'asc' ? 'desc' : 'asc';
        this.navigate({
            sortBy: field === DEFAULT_SORT_BY ? null : field,
            order: order === DEFAULT_ORDER ? null : order,
            page: null,
        });
    }

    ariaSort(field: TripSortBy): string | null {
        if (field !== this.sortBy()) {
            return null;
        }
        return this.order() === 'asc' ? 'ascending' : 'descending';
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
            this.navigate({ page: page === 1 ? null : page });
        }
    }

    reload(): void {
        this.tripsResource.reload();
        this.routesResource.reload();
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
