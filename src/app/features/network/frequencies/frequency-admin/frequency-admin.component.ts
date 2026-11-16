import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { FrequenciesService, FrequencySortBy } from '../frequencies.service';
import { RoutesService } from '../../routes/routes.service';
import { FrequencyResponse, WEEKDAYS, WEEKDAY_LABELS, WEEKDAY_SHORT_LABELS } from '../frequency.dto';
import { formatDepartureTime } from '../frequency-format';
import { SortOrder } from '../../../../core/http/paginated';
import { toId, toOneOf, toPage } from '../../../../core/routing/query-params';
import { FrequencyDetailDialogComponent } from '../frequency-detail-dialog/frequency-detail-dialog.component';
import { FrequencyFormComponent } from '../frequency-form/frequency-form.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { EUserRole } from '../../../../core/auth/user.enum';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

const PAGE_SIZE = 10;
const SORT_FIELDS: FrequencySortBy[] = ['id', 'departureTime', 'basePrice'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];
const ACTIVE_VALUES = ['true', 'false'] as const;

const DEFAULT_SORT_BY: FrequencySortBy = 'departureTime';
const DEFAULT_ORDER: SortOrder = 'asc';

@Component({
    selector: 'app-frequency-admin',
    templateUrl: './frequency-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CurrencyPipe, NgTemplateOutlet, FrequencyDetailDialogComponent, FrequencyFormComponent]
})
export class FrequencyAdminComponent {
    private readonly frequenciesService = inject(FrequenciesService);
    private readonly routesService = inject(RoutesService);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly notificationService = inject(NotificationService);

    readonly page = input(1, { transform: toPage });
    readonly routeId = input(null, { transform: toId });
    readonly weekday = input(null, { transform: toOneOf(WEEKDAYS) });
    readonly isActive = input(null, { transform: (value: string | undefined) => {
        const active = toOneOf(ACTIVE_VALUES)(value);
        return active === null ? null : active === 'true';
    } });
    readonly sortBy = input<FrequencySortBy, string | undefined>(DEFAULT_SORT_BY, { transform: value => toOneOf(SORT_FIELDS)(value) ?? DEFAULT_SORT_BY });
    readonly order = input<SortOrder, string | undefined>(DEFAULT_ORDER, { transform: value => toOneOf(SORT_ORDERS)(value) ?? DEFAULT_ORDER });

    readonly weekdays = WEEKDAYS;
    readonly weekdayLabels = WEEKDAY_LABELS;
    readonly weekdayShortLabels = WEEKDAY_SHORT_LABELS;
    readonly formatDepartureTime = formatDepartureTime;

    readonly detailId = signal<number | null>(null);
    readonly editingFrequency = signal<FrequencyResponse | null>(null);
    readonly togglingId = signal<number | null>(null);

    readonly isAdmin = computed(() => this.authService.currentUser()?.role === EUserRole.ADMIN);

    readonly hasFilters = computed(() => this.routeId() !== null || this.weekday() !== null || this.isActive() !== null);

    readonly frequenciesResource = rxResource({
        params: () => ({
            page: this.page(),
            limit: PAGE_SIZE,
            routeId: this.routeId(),
            weekday: this.weekday(),
            isActive: this.isActive(),
            sortBy: this.sortBy(),
            order: this.order(),
        }),
        stream: ({ params }) => this.frequenciesService.getAll(params),
    });

    readonly routesResource = rxResource({
        stream: () => this.routesService.getAllOptions(),
    });

    private readonly frequenciesPage = computed(() => this.frequenciesResource.hasValue() ? this.frequenciesResource.value() : undefined);

    readonly frequencies = computed(() => this.frequenciesPage()?.items ?? []);
    readonly total = computed(() => this.frequenciesPage()?.meta.total);
    readonly totalPages = computed(() => this.frequenciesPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

    readonly routes = computed(() => this.routesResource.hasValue() ? this.routesResource.value() : []);

    constructor() {
        effect(() => {
            const totalPages = this.totalPages();
            if (this.frequenciesResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    onRouteChange(value: string): void {
        this.navigate({ routeId: value || null, page: null });
    }

    onWeekdayChange(value: string): void {
        this.navigate({ weekday: value || null, page: null });
    }

    onActiveChange(value: string): void {
        this.navigate({ isActive: value || null, page: null });
    }

    clearFilters(): void {
        this.navigate({ routeId: null, weekday: null, isActive: null, page: null });
    }

    sort(field: FrequencySortBy): void {
        const order: SortOrder = field === this.sortBy() && this.order() === 'asc' ? 'desc' : 'asc';
        this.navigate({
            sortBy: field === DEFAULT_SORT_BY ? null : field,
            order: order === DEFAULT_ORDER ? null : order,
            page: null,
        });
    }

    ariaSort(field: FrequencySortBy): string | null {
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
        this.frequenciesResource.reload();
        this.routesResource.reload();
    }

    onUpdated(): void {
        this.editingFrequency.set(null);
        this.frequenciesResource.reload();
    }

    toggleActive(frequency: FrequencyResponse): void {
        if (this.togglingId() !== null) {
            return;
        }
        this.togglingId.set(frequency.id);
        this.frequenciesService.updateActive(frequency.id, !frequency.isActive).subscribe({
            next: updated => {
                this.togglingId.set(null);
                this.notificationService.success(`Frecuencia #${updated.id} ${updated.isActive ? 'activada' : 'desactivada'}.`);
                if (this.isActive() === null) {
                    this.frequenciesResource.value.update(response => response && {
                        ...response,
                        items: response.items.map(item => item.id === updated.id ? updated : item),
                    });
                } else {
                    this.frequenciesResource.reload();
                }
            },
            error: (err: AppError) => {
                this.togglingId.set(null);
                this.notificationService.error(err.message);
            },
        });
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
