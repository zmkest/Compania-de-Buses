import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { BUS_STATUS_LABELS, BUS_STATUS_TRANSITIONS, EBusStatus } from '../../shared/enums/bus.enum';
import { BusResponse } from '../../shared/models/bus.dto';
import { BusesService } from '../../services/buses.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';

const MAX_REASON_LENGTH = 255;

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
    readonly maxReasonLength = MAX_REASON_LENGTH;

    readonly targets = computed<readonly EBusStatus[]>(() => BUS_STATUS_TRANSITIONS[this.bus().status]);

    readonly selected = signal<EBusStatus | null>(null);
    readonly reason = signal('');
    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    submit(): void {
        const status = this.selected();
        if (!status || this.isSubmitting()) {
            return;
        }

        const { id, plate } = this.bus();
        const reason = this.reason().trim();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.busesService.updateStatus(id, reason ? { status, reason } : { status }).subscribe({
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
}
