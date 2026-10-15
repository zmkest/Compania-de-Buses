import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BUS_STATUS_LABELS, EBusStatus } from '../../shared/enums/bus.enum';
import { BusResponse, UpdateBusDto } from '../../shared/models/bus.dto';
import { BusesService } from '../../services/buses.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { BusSearchComponent } from '../bus-search/bus-search.component';
import { BusFormComponent } from '../bus-form/bus-form.component';
import { BusDeleteDialogComponent } from '../bus-delete-dialog/bus-delete-dialog.component';
import { AppError } from '../../core/errors/app-error';

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
    imports: [DatePipe, DecimalPipe, BusSearchComponent, BusFormComponent, BusDeleteDialogComponent]
})
export class BusAdminComponent {
    private readonly busesService = inject(BusesService);
    private readonly notificationService = inject(NotificationService);

    readonly statusLabels = BUS_STATUS_LABELS;
    readonly statusBadgeClasses = STATUS_BADGE_CLASSES;
    readonly statusCards = STATUS_CARDS;

    readonly page = signal(1);
    readonly search = signal('');

    readonly isFormOpen = signal(false);
    readonly editingBus = signal<BusResponse | null>(null);
    readonly deletingBus = signal<BusResponse | null>(null);

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

    isOnRoute(bus: BusResponse): boolean {
        return bus.status === EBusStatus.ON_ROUTE;
    }

    onSearch(search: string): void {
        this.search.set(search);
        this.page.set(1);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.page.set(page);
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
}
