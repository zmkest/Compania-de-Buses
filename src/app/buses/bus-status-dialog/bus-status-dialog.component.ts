import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { BUS_STATUS_LABELS, BUS_STATUS_TRANSITIONS, EBusStatus, EMaintenanceType, MAINTENANCE_TYPE_LABELS } from '../../shared/enums/bus.enum';
import { BusResponse, UpdateBusStatusDto } from '../../shared/models/bus.dto';
import { BusesService } from '../../services/buses.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';

const MAX_TEXT_LENGTH = 255;

// Estados que exigen un motivo para el cambio.
const REASON_REQUIRED: readonly EBusStatus[] = [EBusStatus.MAINTENANCE, EBusStatus.OUT_OF_SERVICE];

const STATUS_STYLES: Record<EBusStatus, { soft: string; selected: string, unselected: string }> = {
    [EBusStatus.AVAILABLE]: {
        soft: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        selected: 'border-emerald-500 bg-emerald-500 text-white',
        unselected: 'border-emerald-500 text-emerald-700',
    },
    [EBusStatus.ON_ROUTE]: {
        soft: 'border-blue-200 bg-blue-50 text-blue-700',
        selected: 'border-blue-500 bg-blue-500 text-white',
        unselected: 'border-blue-500 text-blue-700',
    },
    [EBusStatus.MAINTENANCE]: {
        soft: 'border-amber-200 bg-amber-50 text-amber-700',
        selected: 'border-amber-400 bg-amber-500 text-white',
        unselected: 'border-amber-400 text-amber-700',
    },
    [EBusStatus.OUT_OF_SERVICE]: {
        soft: 'border-red-200 bg-red-50 text-red-700',
        selected: 'border-red-500 bg-red-500 text-white',
        unselected: 'border-red-500 text-red-700',
    },
};

// Formato que espera <input type="datetime-local"> (hora local, sin segundos).
function toDateTimeLocal(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
    selector: 'app-bus-status-dialog',
    templateUrl: './bus-status-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class BusStatusDialogComponent {
    private readonly busesService = inject(BusesService);
    private readonly notification = inject(NotificationService);

    readonly bus = input.required<BusResponse>();

    readonly changed = output<{ id: number; status: EBusStatus }>();
    readonly cancelled = output<void>();

    readonly statusLabels = BUS_STATUS_LABELS;
    readonly statusStyles = STATUS_STYLES;
    readonly maintenanceTypeLabels = MAINTENANCE_TYPE_LABELS;
    readonly maintenanceTypes = Object.values(EMaintenanceType);
    readonly maxTextLength = MAX_TEXT_LENGTH;

    readonly targets = computed<readonly EBusStatus[]>(() => BUS_STATUS_TRANSITIONS[this.bus().status]);

    readonly selected = signal<EBusStatus | null>(null);
    readonly reason = signal('');
    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    // Datos del registro de mantenimiento
    readonly maintenanceType = signal<EMaintenanceType | null>(null);
    readonly startedAt = signal(toDateTimeLocal(new Date()));
    readonly finishedAt = signal(toDateTimeLocal(new Date()));
    readonly description = signal('');
    readonly cost = signal('');

    readonly isReasonRequired = computed(() => {
        const status = this.selected();
        return status !== null && REASON_REQUIRED.includes(status);
    });

    readonly isOpeningMaintenance = computed(() => this.selected() === EBusStatus.MAINTENANCE);

    readonly isClosingMaintenance = computed(
        () => this.bus().status === EBusStatus.MAINTENANCE && this.selected() === EBusStatus.AVAILABLE,
    );

    readonly isCostInvalid = computed(() => {
        const value = this.cost().trim();
        return value !== '' && !/^\d+(\.\d{1,2})?$/.test(value);
    });

    readonly canSubmit = computed(() => {
        if (!this.selected() || this.isSubmitting()) {
            return false;
        }
        if (this.isReasonRequired() && !this.reason().trim()) {
            return false;
        }
        if (this.isOpeningMaintenance() && (!this.maintenanceType() || !this.startedAt())) {
            return false;
        }
        return !(this.isClosingMaintenance() && (!this.cost().trim() || this.isCostInvalid()));
    });

    submit(): void {
        const status = this.selected();
        if (!status || !this.canSubmit()) {
            return;
        }

        const { id, plate } = this.bus();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.busesService.updateStatus(id, this.buildPayload(status)).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Bus ${plate} ahora está ${this.statusLabels[status].toLowerCase()}.`);
                this.changed.emit({ id, status });
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    // Envía solo los campos que aplican a la transición elegida.
    private buildPayload(status: EBusStatus): UpdateBusStatusDto {
        const payload: UpdateBusStatusDto = { status };
        const reason = this.reason().trim();
        const description = this.description().trim();

        if (reason) {
            payload.reason = reason;
        }

        if (this.isOpeningMaintenance()) {
            payload.type = this.maintenanceType() ?? undefined;
            payload.startedAt = new Date(this.startedAt()).toISOString();
            if (description) {
                payload.description = description;
            }
        }

        if (this.isClosingMaintenance()) {
            payload.cost = Number(this.cost().trim());
            if (description) {
                payload.description = description;
            }
            if (this.finishedAt()) {
                payload.finishedAt = new Date(this.finishedAt()).toISOString();
            }
        }

        return payload;
    }
}
