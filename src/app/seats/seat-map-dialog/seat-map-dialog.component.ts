import { Component, ChangeDetectionStrategy, computed, effect, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { SeatsService } from '../../services/seats.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';
import { Seat } from '../../shared/models/seat.dto';

// Distribución 2 + pasillo + 2.
const SEATS_PER_ROW = 4;

// Límites de CreateManySeatsDto en la API.
const MIN_SEATS = 2;
const MAX_SEATS = 80;

@Component({
    selector: 'app-seat-map-dialog',
    templateUrl: './seat-map-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgTemplateOutlet]
})
export class SeatMapDialogComponent {
    private readonly seatsService = inject(SeatsService);
    private readonly notification = inject(NotificationService);

    readonly busId = input.required<number>();
    // Se muestra en el encabezado mientras carga el mapa.
    readonly busPlate = input.required<string>();

    readonly closed = output<void>();
    // Nuevo total de asientos del bus, para actualizar la fila del listado.
    readonly seatCountChanged = output<number>();

    readonly minSeats = MIN_SEATS;
    readonly maxSeats = MAX_SEATS;

    readonly seatMapResource = rxResource({
        params: () => this.busId(),
        stream: ({ params }) => this.seatsService.getSeatMap(params),
    });

    readonly seats = computed(() => this.seatMapResource.hasValue() ? this.seatMapResource.value().seats : []);
    readonly operationalCount = computed(() => this.seats().filter(seat => seat.isOperational).length);
    // Los asientos vienen ordenados por número; la API limita por el número más alto.
    readonly nextSeatNumber = computed(() => (this.seats().at(-1)?.number ?? 0) + 1);
    readonly isAtMaxSeats = computed(() => this.nextSeatNumber() > MAX_SEATS);
    readonly lastSeatNumber = computed(() => this.nextSeatNumber() - 1);
    readonly canTrim = computed(() => this.lastSeatNumber() > MIN_SEATS);

    readonly rows = computed(() => {
        const seats = this.seats();
        const rows: { left: Seat[]; right: Seat[] }[] = [];
        for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
            const row = seats.slice(i, i + SEATS_PER_ROW);
            rows.push({ left: row.slice(0, SEATS_PER_ROW / 2), right: row.slice(SEATS_PER_ROW / 2) });
        }
        return rows;
    });

    // Texto crudo del input: '' mientras está vacío.
    readonly totalSeats = signal('');
    readonly isTotalSeatsTouched = signal(false);
    readonly isCreating = signal(false);
    readonly isAdding = signal(false);
    // Asientos con un cambio de estado en curso.
    readonly updatingSeatIds = signal(new Set<number>());
    readonly createErrors = signal<string[]>([]);

    readonly totalSeatsError = computed(() => {
        const value = this.totalSeats().trim();
        if (!value) {
            return 'Ingresa el número de asientos.';
        }
        const total = Number(value);
        if (!Number.isInteger(total)) {
            return 'Debe ser un número entero.';
        }
        return total < MIN_SEATS || total > MAX_SEATS ? `Debe estar entre ${MIN_SEATS} y ${MAX_SEATS}.` : null;
    });

    readonly isTrimOpen = signal(false);
    // Texto crudo del input: '' mientras está vacío.
    readonly keep = signal('');
    readonly isTrimming = signal(false);
    readonly trimErrors = signal<string[]>([]);

    readonly keepError = computed(() => {
        const value = this.keep().trim();
        if (!value) {
            return 'Ingresa cuántos asientos conservar.';
        }
        const keep = Number(value);
        if (!Number.isInteger(keep)) {
            return 'Debe ser un número entero.';
        }
        const max = this.lastSeatNumber() - 1;
        return keep < MIN_SEATS || keep > max ? `Debe estar entre ${MIN_SEATS} y ${max}.` : null;
    });

    // Asientos que la API eliminaría (número mayor a keep); se resaltan en el mapa.
    readonly seatsToDelete = computed(() => {
        const keep = Number(this.keep());
        return this.keepError() ? [] : this.seats().filter(seat => seat.number > keep);
    });
    readonly seatIdsToDelete = computed(() => new Set(this.isTrimOpen() ? this.seatsToDelete().map(seat => seat.id) : []));

    constructor() {
        // Cada carga del mapa trae el total real; el listado se sincroniza con él.
        effect(() => {
            if (this.seatMapResource.hasValue()) {
                this.seatCountChanged.emit(this.seatMapResource.value().seats.length);
            }
        });
    }

    toggleOperational(seat: Seat): void {
        if (this.updatingSeatIds().has(seat.id)) {
            return;
        }
        this.setUpdating(seat.id, true);

        this.seatsService.updateOperational(seat.id, !seat.isOperational).subscribe({
            next: ({ id, isOperational }) => {
                this.setUpdating(id, false);
                this.seatMapResource.value.update(map => map && {
                    ...map,
                    seats: map.seats.map(s => s.id === id ? { ...s, isOperational } : s),
                });
            },
            error: (err: AppError) => {
                this.setUpdating(seat.id, false);
                this.notification.error(err.message);
                // 404: el asiento ya no existe (p. ej. se redujo el bus); el mapa se pone al día.
                if (err.status === 404) {
                    this.seatMapResource.reload();
                }
            },
        });
    }

    addSeat(): void {
        if (this.isAtMaxSeats() || this.isAdding()) {
            return;
        }
        const number = this.nextSeatNumber();
        this.isAdding.set(true);

        this.seatsService.addOne(this.busId()).subscribe({
            next: () => {
                this.isAdding.set(false);
                this.notification.success(`Asiento ${number} agregado al bus ${this.busPlate()}.`);
                // Se recarga para obtener el id del asiento nuevo.
                this.seatMapResource.reload();
            },
            error: (err: AppError) => {
                this.isAdding.set(false);
                this.notification.error(err.message);
                // 409: el mapa pudo quedar desactualizado (otro usuario agregó o redujo asientos).
                if (err.status === 409) {
                    this.seatMapResource.reload();
                }
            },
        });
    }

    openTrim(): void {
        this.keep.set(String(this.lastSeatNumber() - 1));
        this.trimErrors.set([]);
        this.isTrimOpen.set(true);
    }

    closeTrim(): void {
        this.isTrimOpen.set(false);
        this.trimErrors.set([]);
    }

    trimSeats(): void {
        if (this.keepError() || this.isTrimming()) {
            return;
        }
        const keep = Number(this.keep());
        this.isTrimming.set(true);
        this.trimErrors.set([]);

        this.seatsService.trim(this.busId(), keep).subscribe({
            next: ({ deleted }) => {
                this.isTrimming.set(false);
                this.isTrimOpen.set(false);
                this.notification.success(
                    deleted === 1
                        ? `Se eliminó 1 asiento del bus ${this.busPlate()}.`
                        : `Se eliminaron ${deleted} asientos del bus ${this.busPlate()}.`,
                );
                this.seatMapResource.reload();
            },
            error: (err: AppError) => {
                this.isTrimming.set(false);
                this.trimErrors.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    createSeats(): void {
        this.isTotalSeatsTouched.set(true);
        if (this.totalSeatsError() || this.isCreating()) {
            return;
        }

        this.isCreating.set(true);
        this.createErrors.set([]);

        this.seatsService.createMany(this.busId(), Number(this.totalSeats())).subscribe({
            next: ({ created }) => {
                this.isCreating.set(false);
                this.notification.success(`Se crearon ${created} asientos para el bus ${this.busPlate()}.`);
                this.seatMapResource.reload();
            },
            error: (err: AppError) => {
                this.isCreating.set(false);
                // 409: otro usuario ya registró los asientos; se recarga el mapa y el formulario desaparece.
                if (err.status === 409) {
                    this.notification.error(err.message);
                    this.seatMapResource.reload();
                    return;
                }
                this.createErrors.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    private setUpdating(id: number, isUpdating: boolean): void {
        this.updatingSeatIds.update(ids => {
            const next = new Set(ids);
            isUpdating ? next.add(id) : next.delete(id);
            return next;
        });
    }
}
