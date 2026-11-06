import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { SeatsService } from '../../services/seats.service';
import { Seat } from '../../shared/models/seat.dto';

// Distribución 2 + pasillo + 2.
const SEATS_PER_ROW = 4;

@Component({
    selector: 'app-seat-map-dialog',
    templateUrl: './seat-map-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgTemplateOutlet]
})
export class SeatMapDialogComponent {
    private readonly seatsService = inject(SeatsService);

    readonly busId = input.required<number>();
    // Se muestra en el encabezado mientras carga el mapa.
    readonly busPlate = input.required<string>();

    readonly closed = output<void>();

    readonly seatMapResource = rxResource({
        params: () => this.busId(),
        stream: ({ params }) => this.seatsService.getSeatMap(params),
    });

    readonly seats = computed(() => this.seatMapResource.hasValue() ? this.seatMapResource.value().seats : []);
    readonly operationalCount = computed(() => this.seats().filter(seat => seat.isOperational).length);

    readonly rows = computed(() => {
        const seats = this.seats();
        const rows: { left: Seat[]; right: Seat[] }[] = [];
        for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
            const row = seats.slice(i, i + SEATS_PER_ROW);
            rows.push({ left: row.slice(0, SEATS_PER_ROW / 2), right: row.slice(SEATS_PER_ROW / 2) });
        }
        return rows;
    });
}
