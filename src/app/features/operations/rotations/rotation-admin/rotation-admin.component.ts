import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { RotationSortBy, RotationsService } from '../rotations.service';
import { RotationResponse } from '../rotation.dto';
import { RotationDetailDialogComponent } from '../rotation-detail-dialog/rotation-detail-dialog.component';
import { RotationFormComponent } from '../rotation-form/rotation-form.component';
import { BusesService } from '../../../fleet/buses/buses.service';
import { SortOrder, pageWindow } from '../../../../core/http/paginated';
import { toId, toOneOf, toPage } from '../../../../core/routing/query-params';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

const PAGE_SIZE = 10;
const SORT_FIELDS: RotationSortBy[] = ['id', 'name', 'createdAt'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];
const ACTIVE_VALUES = ['true', 'false'] as const;

const DEFAULT_SORT_BY: RotationSortBy = 'id';
const DEFAULT_ORDER: SortOrder = 'asc';

@Component({
    selector: 'app-rotation-admin',
    templateUrl: './rotation-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, NgTemplateOutlet, RotationFormComponent, RotationDetailDialogComponent]
})
export class RotationAdminComponent {
    private readonly rotationsService = inject(RotationsService);
    private readonly busesService = inject(BusesService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);

    readonly page = input(1, { transform: toPage });
    readonly busId = input(null, { transform: toId });
    readonly isActive = input(null, { transform: (value: string | undefined) => {
        const active = toOneOf(ACTIVE_VALUES)(value);
        return active === null ? null : active === 'true';
    } });
    readonly sortBy = input<RotationSortBy, string | undefined>(DEFAULT_SORT_BY, { transform: value => toOneOf(SORT_FIELDS)(value) ?? DEFAULT_SORT_BY });
    readonly order = input<SortOrder, string | undefined>(DEFAULT_ORDER, { transform: value => toOneOf(SORT_ORDERS)(value) ?? DEFAULT_ORDER });

    readonly isCreating = signal(false);
    readonly detailId = signal<number | null>(null);
    readonly editingId = signal<number | null>(null);
    readonly togglingId = signal<number | null>(null);

    readonly hasFilters = computed(() => this.busId() !== null || this.isActive() !== null);

    readonly rotationsResource = rxResource({
        params: () => ({
            page: this.page(),
            limit: PAGE_SIZE,
            busId: this.busId(),
            isActive: this.isActive(),
            sortBy: this.sortBy(),
            order: this.order(),
        }),
        stream: ({ params }) => this.rotationsService.getAll(params),
    });

    readonly busesResource = rxResource({
        stream: () => this.busesService.getAllOptions(),
    });

    private readonly rotationsPage = computed(() => this.rotationsResource.hasValue() ? this.rotationsResource.value() : undefined);

    readonly rotations = computed(() => this.rotationsPage()?.items ?? []);
    readonly total = computed(() => this.rotationsPage()?.meta.total);
    readonly totalPages = computed(() => this.rotationsPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => pageWindow(this.page(), this.totalPages()));

    readonly buses = computed(() => this.busesResource.hasValue() ? this.busesResource.value() : []);

    constructor() {
        effect(() => {
            const totalPages = this.totalPages();
            if (this.rotationsResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    onBusChange(value: string): void {
        this.navigate({ busId: value || null, page: null });
    }

    onActiveChange(value: string): void {
        this.navigate({ isActive: value || null, page: null });
    }

    clearFilters(): void {
        this.navigate({ busId: null, isActive: null, page: null });
    }

    sort(field: RotationSortBy): void {
        const order: SortOrder = field === this.sortBy() && this.order() === 'asc' ? 'desc' : 'asc';
        this.navigate({
            sortBy: field === DEFAULT_SORT_BY ? null : field,
            order: order === DEFAULT_ORDER ? null : order,
            page: null,
        });
    }

    ariaSort(field: RotationSortBy): string | null {
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

    onCreated(): void {
        this.isCreating.set(false);
        this.rotationsResource.reload();
    }

    onUpdated(): void {
        this.editingId.set(null);
        this.rotationsResource.reload();
    }

    toggleActive(rotation: RotationResponse): void {
        if (this.togglingId() !== null) {
            return;
        }
        this.togglingId.set(rotation.id);
        this.rotationsService.updateActive(rotation.id, !rotation.isActive).subscribe({
            next: updated => {
                this.togglingId.set(null);
                this.notificationService.success(`Rotación "${updated.name}" ${updated.isActive ? 'activada' : 'desactivada'}.`);
                if (this.isActive() === null) {
                    this.rotationsResource.value.update(response => response && {
                        ...response,
                        items: response.items.map(item => item.id === updated.id ? { ...item, isActive: updated.isActive, updatedAt: updated.updatedAt } : item),
                    });
                } else {
                    this.rotationsResource.reload();
                }
            },
            error: (err: AppError) => {
                this.togglingId.set(null);
                this.notificationService.error(err.message);
            },
        });
    }

    reload(): void {
        this.rotationsResource.reload();
        this.busesResource.reload();
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
