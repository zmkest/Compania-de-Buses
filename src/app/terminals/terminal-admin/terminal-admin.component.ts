import { Component, ChangeDetectionStrategy, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { SortOrder, TerminalsService } from '../../services/terminals.service';
import { CitiesService } from '../../services/cities.service';
import { BusSearchComponent } from '../../buses/bus-search/bus-search.component';
import { toOneOf, toPage, toSearch } from '../../core/routing/query-params';

const PAGE_SIZE = 10;
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

@Component({
    selector: 'app-terminal-admin',
    templateUrl: './terminal-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [BusSearchComponent]
})
export class TerminalAdminComponent {
    private readonly terminalsService = inject(TerminalsService);
    private readonly citiesService = inject(CitiesService);
    private readonly router = inject(Router);

    // Enlazados a los query params ?page=&search=&order= (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly search = input('', { transform: toSearch });
    readonly order = input<SortOrder, string | undefined>('asc', { transform: value => toOneOf(SORT_ORDERS)(value) ?? 'asc' });

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

    // El listado solo trae cityId; el nombre sale de GET /cities.
    private readonly cityNames = computed(() => new Map(
        (this.citiesResource.hasValue() ? this.citiesResource.value() : []).map(city => [city.id, city.name])
    ));

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

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
