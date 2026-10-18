import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BUS_STATUS_LABELS, EBusStatus } from '../../shared/enums/bus.enum';
import { BusResponse, UpdateBusDto } from '../../shared/models/bus.dto';
import { BusesService } from '../../services/buses.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { BusSearchComponent } from '../bus-search/bus-search.component';
import { BusFormComponent } from '../bus-form/bus-form.component';
import { BusDeleteDialogComponent } from '../bus-delete-dialog/bus-delete-dialog.component';
import { BusStatusDialogComponent } from '../bus-status-dialog/bus-status-dialog.component';
import { AppError } from '../../core/errors/app-error';
import { toPage, toSearch } from '../../core/routing/query-params';

const PAGE_SIZE = 5;

const STATUS_BADGE_CLASSES: Record<EBusStatus, string> = {
    [EBusStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-700',
    [EBusStatus.ON_ROUTE]: 'bg-blue-100 text-blue-700',
    [EBusStatus.MAINTENANCE]: 'bg-amber-100 text-amber-700',
    [EBusStatus.OUT_OF_SERVICE]: 'bg-red-100 text-red-700',
};

const STATUS_CARDS: { status: EBusStatus; border: string; text: string }[] = [
    { status: EBusStatus.AVAILABLE, border: 'border-emerald-600', text: 'text-emerald-600' },
    { status: EBusStatus.ON_ROUTE, border: 'border-blue-600', text: 'text-blue-600' },
    { status: EBusStatus.MAINTENANCE, border: 'border-amber-500', text: 'text-amber-500' },
    { status: EBusStatus.OUT_OF_SERVICE, border: 'border-red-600', text: 'text-red-600' },
];

@Component({
    selector: 'app-bus-admin',
    templateUrl: './bus-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, DecimalPipe, BusSearchComponent, BusFormComponent, BusDeleteDialogComponent, BusStatusDialogComponent]
})
export class BusAdminComponent {
    private readonly busesService = inject(BusesService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);

    readonly statusLabels = BUS_STATUS_LABELS;
    readonly statusBadgeClasses = STATUS_BADGE_CLASSES;
    readonly statusCards = STATUS_CARDS;

    // Enlazados a los query params ?page=&search= (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly search = input('', { transform: toSearch });

    readonly isFormOpen = signal(false);
    readonly editingBus = signal<BusResponse | null>(null);
    readonly deletingBus = signal<BusResponse | null>(null);
    readonly statusBus = signal<BusResponse | null>(null);

    readonly busesResource = rxResource({
        params: () => ({ page: this.page(), limit: PAGE_SIZE, search: this.search() }),
        stream: ({ params }) => this.busesService.getAll(params),
    });

    readonly statsResource = rxResource({
        stream: () => this.busesService.getStats(),
    });

    private readonly busesPage = computed(() => this.busesResource.hasValue() ? this.busesResource.value() : undefined);

    readonly buses = computed(() => this.busesPage()?.items ?? []);
    readonly totalPages = computed(() => this.busesPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
    readonly stats = computed(() => this.statsResource.hasValue() ? this.statsResource.value() : undefined);

    constructor() {
        // Una URL vieja o eliminar el último bus de una página puede dejar la página fuera de rango.
        effect(() => {
            const totalPages = this.totalPages();
            if (this.busesResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    isOnRoute(bus: BusResponse): boolean {
        return bus.status === EBusStatus.ON_ROUTE;
    }

    onSearch(search: string): void {
        if (search === this.search()) {
            return;
        }
        // replaceUrl: cada tecla buscada no debe llenar el historial del navegador.
        this.navigate({ search: search || null, page: null }, true);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
            this.navigate({ page: page === 1 ? null : page });
        }
    }

    reload(): void {
        this.busesResource.reload();
        this.statsResource.reload();
    }

    openCreate(): void {
        this.editingBus.set(null);
        this.isFormOpen.set(true);
    }

    openEdit(bus: BusResponse): void {
        this.editingBus.set(bus);
        this.isFormOpen.set(true);
    }

    closeForm(): void {
        this.isFormOpen.set(false);
        this.editingBus.set(null);
    }

    onCreated(): void {
        this.closeForm();
        this.reload();
    }

    onUpdated({ id, changes }: { id: number; changes: UpdateBusDto }): void {
        this.replaceBus(id, bus => ({ ...bus, ...changes }));
        this.closeForm();
        this.statsResource.reload();
    }

    onStatusChanged({ id, status }: { id: number; status: EBusStatus }): void {
        this.replaceBus(id, bus => ({ ...bus, status }));
        this.statusBus.set(null);
        this.statsResource.reload();
    }

    confirmDelete(bus: BusResponse): void {
        this.busesService.delete(bus.id).subscribe({
            next: (_) => {
                this.deletingBus.set(null);
                this.notificationService.success(`Bus ${bus.plate} eliminado.`);
                this.reload();
            },
            error: (err: AppError) => {
                this.notificationService.error(err.message);
                this.deletingBus.set(null);
            }
        })
    }

    private replaceBus(id: number, change: (bus: BusResponse) => BusResponse): void {
        this.busesResource.value.update(response => response && {
            ...response,
            items: response.items.map(bus => bus.id === id ? change(bus) : bus),
        });
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
