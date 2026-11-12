import { Component, ChangeDetectionStrategy, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAINTENANCE_TYPE_LABELS } from '../../buses/bus.enum';
import { MaintenanceResponse } from '../maintenance.dto';
import { MaintenancesService } from '../maintenances.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

@Component({
    selector: 'app-maintenance-cancel-dialog',
    templateUrl: './maintenance-cancel-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe]
})
export class MaintenanceCancelDialogComponent {
    private readonly maintenancesService = inject(MaintenancesService);
    private readonly notification = inject(NotificationService);

    readonly maintenance = input.required<MaintenanceResponse>();

    readonly confirmed = output<number>();
    readonly cancelled = output<void>();

    readonly typeLabels = MAINTENANCE_TYPE_LABELS;
    readonly errorMessage = signal<string | null>(null);
    readonly isSubmitting = signal(false);

    confirm(): void {
        if (this.isSubmitting()) {
            return;
        }

        const { id } = this.maintenance();

        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        this.maintenancesService.cancel(id).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Mantenimiento #${id} cancelado.`);
                this.confirmed.emit(id);
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(err.message);
            },
        });
    }
}
