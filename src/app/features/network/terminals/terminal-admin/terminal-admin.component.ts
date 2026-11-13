import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TerminalsService } from '../terminals.service';
import { SortOrder } from '../../../../core/http/paginated';
import { CitiesService } from '../../cities/cities.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { EUserRole } from '../../../../core/auth/user.enum';
import { TerminalDetail, TerminalResponse } from '../terminal.dto';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { TerminalFormComponent } from '../terminal-form/terminal-form.component';
import { TerminalDeleteDialogComponent } from '../terminal-delete-dialog/terminal-delete-dialog.component';
import { toOneOf, toPage, toSearch } from '../../../../core/routing/query-params';

const PAGE_SIZE = 10;
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

@Component({
    selector: 'app-terminal-admin',
    templateUrl: './terminal-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SearchBoxComponent, TerminalFormComponent, TerminalDeleteDialogComponent]
})
export class TerminalAdminComponent {
    private readonly terminalsService = inject(TerminalsService);
    private readonly citiesService = inject(CitiesService);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);
    private readonly notificationService = inject(NotificationService);

    // Enlazados a los query params ?page=&search=&order= (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly search = input('', { transform: toSearch });
    readonly order = input<SortOrder, string | undefined>('asc', { transform: value => toOneOf(SORT_ORDERS)(value) ?? 'asc' });

    // Editar y eliminar son solo para ADMIN; OPERATOR puede listar y crear.
    readonly isAdmin = computed(() => this.authService.currentUser()?.role === EUserRole.ADMIN);

    readonly columnCount = computed(() => this.isAdmin() ? 5 : 4);

    readonly isFormOpen = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly deletingTerminal = signal<TerminalResponse | null>(null);
    readonly isDeleting = signal(false);

    readonly terminalsResource = rxResource({
        params: () => ({ page: this.page(), limit: PAGE_SIZE, search: this.search(), order: this.order() }),
        stream: ({ params }) => this.terminalsService.getAll(params),
    });

    readonly citiesResource = rxResource({
        stream: () => this.citiesService.getAll(),
    });

    private readonly terminalsPage = computed(() => this.terminalsResource.hasValue() ? this.terminalsResource.value() : undefined);

    readonly terminals = computed(() => this.terminalsPage()?.items ?? []);
    readonly total = computed(() => this.terminalsPage()?.meta.total);
    readonly totalPages = computed(() => this.terminalsPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

    readonly cities = computed(() => this.citiesResource.hasValue() ? this.citiesResource.value() : []);

    // El listado solo trae cityId; el nombre sale de GET /cities.
    private readonly cityNames = computed(() => new Map(this.cities().map(city => [city.id, city.name])));

    constructor() {
        // Una URL vieja o eliminar el último terminal de una página puede dejar la página fuera de rango.
        effect(() => {
            const totalPages = this.totalPages();
            if (this.terminalsResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    cityName(cityId: number): string {
        return this.cityNames().get(cityId) ?? `Ciudad #${cityId}`;
    }

    onSearch(search: string): void {
        if (search === this.search()) {
            return;
        }
        // replaceUrl: cada tecla buscada no debe llenar el historial del navegador.
        this.navigate({ search: search || null, page: null }, true);
    }

    toggleOrder(): void {
        this.navigate({ order: this.order() === 'asc' ? 'desc' : null, page: null });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
            this.navigate({ page: page === 1 ? null : page });
        }
    }

    reload(): void {
        this.terminalsResource.reload();
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
        this.terminalsResource.reload();
    }

    onUpdated({ city, ...terminal }: TerminalDetail): void {
        this.terminalsResource.value.update(response => response && {
            ...response,
            items: response.items.map(item => item.id === terminal.id ? terminal : item),
        });
        this.closeForm();
    }

    confirmDelete(terminal: TerminalResponse): void {
        this.isDeleting.set(true);
        this.terminalsService.delete(terminal.id).subscribe({
            next: () => {
                this.isDeleting.set(false);
                this.deletingTerminal.set(null);
                this.notificationService.success(`Terminal ${terminal.name} eliminado.`);
                this.terminalsResource.reload();
            },
            error: (err: AppError) => {
                this.isDeleting.set(false);
                this.deletingTerminal.set(null);
                this.notificationService.error(err.message);
            },
        });
    }

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
