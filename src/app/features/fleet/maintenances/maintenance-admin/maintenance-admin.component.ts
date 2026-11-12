import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
    EMaintenanceStatus,
    EMaintenanceType,
    MAINTENANCE_STATUS_LABELS,
    MAINTENANCE_STATUS_TEXT_CLASSES,
    MAINTENANCE_TYPE_TEXT_CLASSES,
    MAINTENANCE_TYPE_LABELS,
} from '../../buses/bus.enum';
import { MaintenanceResponse } from '../maintenance.dto';
import { EUserRole } from '../../../../core/auth/user.enum';
import { MaintenancesService } from '../maintenances.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { BusSearchComponent } from '../../../../shared/components/search-box/bus-search.component';
import { MaintenanceFormComponent } from '../maintenance-form/maintenance-form.component';
import { MaintenanceCompleteDialogComponent } from '../maintenance-complete-dialog/maintenance-complete-dialog.component';
import { MaintenanceCancelDialogComponent } from '../maintenance-cancel-dialog/maintenance-cancel-dialog.component';
import { toDate, toPage, toSearch } from '../../../../core/routing/query-params';

const PAGE_SIZE = 10;

const STATUS_CARDS: { status: EMaintenanceStatus; border: string; text: string }[] = [
    { status: EMaintenanceStatus.IN_PROGRESS, border: 'border-amber-500', text: 'text-amber-500' },
    { status: EMaintenanceStatus.COMPLETED, border: 'border-emerald-600', text: 'text-emerald-600' },
    { status: EMaintenanceStatus.CANCELLED, border: 'border-gray-400', text: 'text-gray-500' },
];

const TYPE_CARDS: { type: EMaintenanceType; border: string }[] = [
    { type: EMaintenanceType.PREVENTIVE, border: 'border-sky-700' },
    { type: EMaintenanceType.CORRECTIVE, border: 'border-orange-600' },
];

@Component({
    selector: 'app-maintenance-admin',
    templateUrl: './maintenance-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, CurrencyPipe, BusSearchComponent, MaintenanceFormComponent, MaintenanceCompleteDialogComponent, MaintenanceCancelDialogComponent]
})
export class MaintenanceAdminComponent {
    private readonly maintenancesService = inject(MaintenancesService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly typeLabels = MAINTENANCE_TYPE_LABELS;
    readonly typeTextClasses = MAINTENANCE_TYPE_TEXT_CLASSES;
    readonly statusLabels = MAINTENANCE_STATUS_LABELS;
    readonly statusTextClasses = MAINTENANCE_STATUS_TEXT_CLASSES;
    readonly statusCards = STATUS_CARDS;
    readonly typeCards = TYPE_CARDS;

    // Enlazados a los query params ?page=&search=&startDate=&endDate= (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly search = input('', { transform: toSearch });
    readonly startDate = input(null, { transform: toDate });
    readonly endDate = input(null, { transform: toDate });

    readonly editingMaintenance = signal<MaintenanceResponse | null>(null);
    readonly completingMaintenance = signal<MaintenanceResponse | null>(null);
    readonly cancellingMaintenance = signal<MaintenanceResponse | null>(null);

    readonly maintenancesResource = rxResource({
        params: () => {
            const startDate = this.startDate();
            const endDate = this.endDate();
            // Un rango invertido (URL manipulada) haría fallar la validación de la API: se ignora el fin.
            const validEnd = startDate && endDate && endDate < startDate ? null : endDate;
            return { page: this.page(), limit: PAGE_SIZE, search: this.search(), startDate, endDate: validEnd };
        },
        stream: ({ params }) => this.maintenancesService.getAll(params),
    });

    readonly statsResource = rxResource({
        stream: () => this.maintenancesService.getStatusStats(),
    });

    readonly typeStatsResource = rxResource({
        stream: () => this.maintenancesService.getTypeStats(),
    });

    private readonly maintenancesPage = computed(() => this.maintenancesResource.hasValue() ? this.maintenancesResource.value() : undefined);

    readonly maintenances = computed(() => this.maintenancesPage()?.items ?? []);
    readonly total = computed(() => this.maintenancesPage()?.meta.total ?? 0);
    readonly totalPages = computed(() => this.maintenancesPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
    readonly stats = computed(() => this.statsResource.hasValue() ? this.statsResource.value() : undefined);
    readonly typeStats = computed(() => this.typeStatsResource.hasValue() ? this.typeStatsResource.value() : undefined);
    readonly hasFilters = computed(() => !!this.search() || !!this.startDate() || !!this.endDate());

    constructor() {
        effect(() => {
            const totalPages = this.totalPages();
            if (this.maintenancesResource.hasValue() && this.page() > totalPages) {
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

    setStartDate(value: string): void {
        const startDate = toDate(value);
        const endDate = this.endDate();
        // Si el nuevo inicio queda después del fin, el fin deja de tener sentido.
        const clearEnd = !!startDate && !!endDate && endDate < startDate;
        this.navigate({ startDate, ...(clearEnd ? { endDate: null } : {}), page: null });
    }

    setEndDate(value: string): void {
        this.navigate({ endDate: toDate(value), page: null });
    }

    clearFilters(): void {
        this.navigate({ search: null, startDate: null, endDate: null, page: null });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
            this.navigate({ page: page === 1 ? null : page });
        }
    }

    reload(): void {
        this.maintenancesResource.reload();
        this.statsResource.reload();
        this.typeStatsResource.reload();
    }

    isInProgress(maintenance: MaintenanceResponse): boolean {
        return maintenance.status === EMaintenanceStatus.IN_PROGRESS;
    }

    // Un mantenimiento finalizado solo lo puede editar un administrador.
    canEdit(maintenance: MaintenanceResponse): boolean {
        return this.isInProgress(maintenance) || this.authService.currentUser()?.role === EUserRole.ADMIN;
    }

    onUpdated({ id, changes }: { id: number; changes: Partial<MaintenanceResponse> }): void {
        this.replaceMaintenance(id, changes);
        this.editingMaintenance.set(null);
        if (changes.type) {
            this.typeStatsResource.reload();
        }
    }

    onCompleted({ id, finishedAt }: { id: number; finishedAt: Date }): void {
        this.replaceMaintenance(id, { status: EMaintenanceStatus.COMPLETED, finishedAt });
        this.completingMaintenance.set(null);
        this.statsResource.reload();
    }

    onCancelled(id: number): void {
        // La API marca finishedAt con la hora del servidor; se aproxima con la local hasta recargar.
        this.replaceMaintenance(id, { status: EMaintenanceStatus.CANCELLED, finishedAt: new Date() });
        this.cancellingMaintenance.set(null);
        this.statsResource.reload();
    }

    // Se actualiza la fila localmente: las respuestas de los PATCH no traen busPlate.
    private replaceMaintenance(id: number, changes: Partial<MaintenanceResponse>): void {
        this.maintenancesResource.value.update(response => response && {
            ...response,
            items: response.items.map(maintenance => maintenance.id === id ? { ...maintenance, ...changes } : maintenance),
        });
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
