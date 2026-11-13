import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { RouteSortBy, RoutesService } from '../routes.service';
import { CitiesService } from '../../cities/cities.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { EUserRole } from '../../../../core/auth/user.enum';
import { RouteResponse } from '../route.dto';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';
import { SortOrder } from '../../../../core/http/paginated';
import { toId, toOneOf, toPage } from '../../../../core/routing/query-params';
import { formatDuration } from '../route-format';
import { RouteFormComponent } from '../route-form/route-form.component';
import { RouteDetailDialogComponent } from '../route-detail-dialog/route-detail-dialog.component';
import { RouteDeleteDialogComponent } from '../route-delete-dialog/route-delete-dialog.component';

const PAGE_SIZE = 10;
const SORT_FIELDS: RouteSortBy[] = ['id', 'distanceKm', 'durationMinutes'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

// Orden por defecto de la API: las rutas más nuevas primero.
const DEFAULT_SORT_BY: RouteSortBy = 'id';
const DEFAULT_ORDER: SortOrder = 'desc';

@Component({
    selector: 'app-route-admin',
    templateUrl: './route-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe, NgTemplateOutlet, RouteFormComponent, RouteDetailDialogComponent, RouteDeleteDialogComponent]
})
export class RouteAdminComponent {
    private readonly routesService = inject(RoutesService);
    private readonly citiesService = inject(CitiesService);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly notificationService = inject(NotificationService);

    // Enlazados a los query params (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly originCityId = input(null, { transform: toId });
    readonly destinationCityId = input(null, { transform: toId });
    readonly sortBy = input<RouteSortBy, string | undefined>(DEFAULT_SORT_BY, { transform: value => toOneOf(SORT_FIELDS)(value) ?? DEFAULT_SORT_BY });
    readonly order = input<SortOrder, string | undefined>(DEFAULT_ORDER, { transform: value => toOneOf(SORT_ORDERS)(value) ?? DEFAULT_ORDER });

    // Crear, editar y eliminar son solo para ADMIN; OPERATOR puede listar y ver el detalle.
    readonly isAdmin = computed(() => this.authService.currentUser()?.role === EUserRole.ADMIN);

    readonly hasFilters = computed(() => this.originCityId() !== null || this.destinationCityId() !== null);

    readonly isFormOpen = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly detailId = signal<number | null>(null);
    readonly deletingRoute = signal<RouteResponse | null>(null);
    readonly isDeleting = signal(false);

    readonly formatDuration = formatDuration;

    readonly routesResource = rxResource({
        params: () => ({
            page: this.page(),
            limit: PAGE_SIZE,
            originCityId: this.originCityId(),
            destinationCityId: this.destinationCityId(),
            sortBy: this.sortBy(),
            order: this.order(),
        }),
        stream: ({ params }) => this.routesService.getAll(params),
    });

    // Solo ciudades con terminales: son las únicas que pueden tener rutas.
    readonly citiesResource = rxResource({
        stream: () => this.citiesService.getAll(true),
    });

    private readonly routesPage = computed(() => this.routesResource.hasValue() ? this.routesResource.value() : undefined);

    readonly routes = computed(() => this.routesPage()?.items ?? []);
    readonly total = computed(() => this.routesPage()?.meta.total);
    readonly totalPages = computed(() => this.routesPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

    readonly cities = computed(() => this.citiesResource.hasValue() ? this.citiesResource.value() : []);

    constructor() {
        // Una URL vieja o eliminar la última ruta de una página puede dejar la página fuera de rango.
        effect(() => {
            const totalPages = this.totalPages();
            if (this.routesResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    onOriginChange(value: string): void {
        this.navigate({ originCityId: value || null, page: null });
    }

    onDestinationChange(value: string): void {
        this.navigate({ destinationCityId: value || null, page: null });
    }

    clearFilters(): void {
        this.navigate({ originCityId: null, destinationCityId: null, page: null });
    }

    // Otra columna: empieza ascendente; la misma columna: invierte el orden.
    sort(field: RouteSortBy): void {
        const order: SortOrder = field === this.sortBy() && this.order() === 'asc' ? 'desc' : 'asc';
        this.navigate({
            sortBy: field === DEFAULT_SORT_BY ? null : field,
            order: field === DEFAULT_SORT_BY && order === DEFAULT_ORDER ? null : order,
            page: null,
        });
    }

    ariaSort(field: RouteSortBy): string | null {
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
        this.routesResource.reload();
        this.citiesResource.reload();
    }

    openCreate(): void {
        this.editingId.set(null);
        this.isFormOpen.set(true);
    }

    openEdit(id: number): void {
        this.editingId.set(id);
        this.isFormOpen.set(true);
    }

    closeForm(): void {
        this.isFormOpen.set(false);
        this.editingId.set(null);
    }

    onCreated(): void {
        this.closeForm();
        this.routesResource.reload();
    }

    onUpdated(route: RouteResponse): void {
        this.routesResource.value.update(response => response && {
            ...response,
            items: response.items.map(item => item.id === route.id ? route : item),
        });
        this.closeForm();
    }

    confirmDelete(route: RouteResponse): void {
        this.isDeleting.set(true);
        this.routesService.delete(route.id).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.deletingRoute.set(null);
                this.notificationService.success(`Ruta #${route.id} eliminada.`);
                this.routesResource.reload();
            },
            error: (err: AppError) => {
                this.isDeleting.set(false);
                this.deletingRoute.set(null);
                this.notificationService.error(err.message);
            },
        });
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
