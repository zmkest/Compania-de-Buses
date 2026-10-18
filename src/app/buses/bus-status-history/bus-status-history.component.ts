import { Component, ChangeDetectionStrategy, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { BUS_STATUS_BADGE_CLASSES, BUS_STATUS_LABELS, EBusStatus } from '../../shared/enums/bus.enum';
import { BusesService } from '../../services/buses.service';
import { BusSearchComponent } from '../bus-search/bus-search.component';
import { toOneOf, toPage, toSearch } from '../../core/routing/query-params';

const PAGE_SIZE = 10;

type StatusDirection = 'from' | 'to';

const DIRECTIONS: { value: StatusDirection; label: string }[] = [
    { value: 'from', label: 'Estado anterior' },
    { value: 'to', label: 'Estado nuevo' },
];

const STATUS_CARDS: { status: EBusStatus; label: string; border: string; text: string }[] = [
    { status: EBusStatus.AVAILABLE, label: 'A disponible', border: 'border-emerald-600', text: 'text-emerald-600' },
    { status: EBusStatus.ON_ROUTE, label: 'Salidas a ruta', border: 'border-blue-600', text: 'text-blue-600' },
    { status: EBusStatus.MAINTENANCE, label: 'A mantenimiento', border: 'border-amber-500', text: 'text-amber-500' },
    { status: EBusStatus.OUT_OF_SERVICE, label: 'Fuera de servicio', border: 'border-red-600', text: 'text-red-600' },
];

// Botón de filtro activo/inactivo por estado, con el mismo color que su badge.
const FILTER_CLASSES: Record<EBusStatus, string> = {
    [EBusStatus.AVAILABLE]: 'border-emerald-500 bg-emerald-500 text-white',
    [EBusStatus.ON_ROUTE]: 'border-blue-500 bg-blue-500 text-white',
    [EBusStatus.MAINTENANCE]: 'border-amber-500 bg-amber-500 text-white',
    [EBusStatus.OUT_OF_SERVICE]: 'border-red-500 bg-red-500 text-white',
};

@Component({
    selector: 'app-bus-status-history',
    templateUrl: './bus-status-history.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, BusSearchComponent]
})
export class BusStatusHistoryComponent {
    private readonly busesService = inject(BusesService);
    private readonly router = inject(Router);

    readonly statuses = Object.values(EBusStatus);
    readonly statusLabels = BUS_STATUS_LABELS;
    readonly statusBadgeClasses = BUS_STATUS_BADGE_CLASSES;
    readonly filterClasses = FILTER_CLASSES;
    readonly statusCards = STATUS_CARDS;
    readonly directions = DIRECTIONS;

    // Enlazados a los query params ?page=&search=&status=&direction= (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly search = input('', { transform: toSearch });
    readonly status = input(null, { transform: toOneOf(Object.values(EBusStatus)) });
    readonly direction = input<StatusDirection, string | undefined>('to', {
        transform: value => toOneOf<StatusDirection>(['from', 'to'])(value) ?? 'to',
    });

    readonly historyResource = rxResource({
        params: () => ({
            page: this.page(),
            limit: PAGE_SIZE,
            search: this.search(),
            fromStatus: this.direction() === 'from' ? this.status() : null,
            toStatus: this.direction() === 'to' ? this.status() : null,
        }),
        stream: ({ params }) => this.busesService.getStatusHistory(params),
    });

    readonly statsResource = rxResource({
        stream: () => this.busesService.getStatusHistoryStats(),
    });

    private readonly historyPage = computed(() => this.historyResource.hasValue() ? this.historyResource.value() : undefined);

    readonly records = computed(() => this.historyPage()?.items ?? []);
    readonly total = computed(() => this.historyPage()?.meta.total ?? 0);
    readonly totalPages = computed(() => this.historyPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
    readonly stats = computed(() => this.statsResource.hasValue() ? this.statsResource.value() : undefined);
    readonly hasFilters = computed(() => !!this.search() || this.status() !== null);

    constructor() {
        effect(() => {
            const totalPages = this.totalPages();
            if (this.historyResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    onSearch(search: string): void {
        if (search === this.search()) {
            return;
        }
        this.navigate({ search: search || null, page: null }, true);
    }

    toggleStatus(status: EBusStatus): void {
        this.navigate({ status: this.status() === status ? null : status, page: null });
    }

    setDirection(direction: StatusDirection): void {
        if (direction !== this.direction()) {
            this.navigate({ direction: direction === 'to' ? null : direction, page: null });
        }
    }

    clearFilters(): void {
        this.navigate({ search: null, status: null, direction: null, page: null });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
            this.navigate({ page: page === 1 ? null : page });
        }
    }

    reload(): void {
        this.historyResource.reload();
        this.statsResource.reload();
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
