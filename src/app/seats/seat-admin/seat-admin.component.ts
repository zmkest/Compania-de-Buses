import { Component, ChangeDetectionStrategy, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { SeatsService } from '../../services/seats.service';
import { BusSearchComponent } from '../../buses/bus-search/bus-search.component';
import { SeatMapPanelComponent } from '../seat-map-panel/seat-map-panel.component';
import { BusSeatCount } from '../../shared/models/seat.dto';
import { toId, toPage, toSearch } from '../../core/routing/query-params';

// Pocas filas para que el mapa de abajo quede a la vista.
const PAGE_SIZE = 5;

@Component({
    selector: 'app-seat-admin',
    templateUrl: './seat-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [BusSearchComponent, SeatMapPanelComponent]
})
export class SeatAdminComponent {
    private readonly seatsService = inject(SeatsService);
    private readonly router = inject(Router);

    // Enlazados a los query params ?page=&search=&bus= (withComponentInputBinding).
    readonly page = input(1, { transform: toPage });
    readonly search = input('', { transform: toSearch });
    // Bus cuyo mapa se muestra abajo; puede no estar en la página actual de la tabla.
    readonly selectedBusId = input(null, { alias: 'bus', transform: toId });

    readonly busesResource = rxResource({
        params: () => ({ page: this.page(), limit: PAGE_SIZE, search: this.search() }),
        stream: ({ params }) => this.seatsService.getBuses(params),
    });

    private readonly busesPage = computed(() => this.busesResource.hasValue() ? this.busesResource.value() : undefined);

    readonly buses = computed(() => this.busesPage()?.items ?? []);
    readonly totalPages = computed(() => this.busesPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

    constructor() {
        // Una URL vieja puede dejar la página fuera de rango.
        effect(() => {
            const totalPages = this.totalPages();
            if (this.busesResource.hasValue() && this.page() > totalPages) {
                this.navigate({ page: totalPages === 1 ? null : totalPages }, true);
            }
        });
    }

    selectBus(bus: BusSeatCount): void {
        if (bus.id !== this.selectedBusId()) {
            this.navigate({ bus: bus.id });
        }
    }

    clearSelection(): void {
        this.navigate({ bus: null });
    }

    onSeatCountChanged({ busId, seatCount }: { busId: number; seatCount: number }): void {
        const bus = this.buses().find(item => item.id === busId);
        if (!bus || bus.seatCount === seatCount) {
            return;
        }
        this.busesResource.value.update(response => response && {
            ...response,
            items: response.items.map(item => item.id === busId ? { ...item, seatCount } : item),
        });
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

    private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
        this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
    }
}
