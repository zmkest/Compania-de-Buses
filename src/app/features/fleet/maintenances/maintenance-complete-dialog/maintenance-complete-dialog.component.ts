import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAINTENANCE_TYPE_LABELS } from '../../buses/bus.enum';
import { MaintenanceResponse } from '../maintenance.dto';
import { MaintenancesService } from '../maintenances.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';
import { toDateTimeLocal } from '../../../../shared/utils/date-util';

@Component({
    selector: 'app-maintenance-complete-dialog',
    templateUrl: './maintenance-complete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe]
})
export class MaintenanceCompleteDialogComponent {
    private readonly maintenancesService = inject(MaintenancesService);
    private readonly notification = inject(NotificationService);

    readonly maintenance = input.required<MaintenanceResponse>();

    readonly completed = output<{ id: number; finishedAt: Date }>();
    readonly cancelled = output<void>();

    readonly typeLabels = MAINTENANCE_TYPE_LABELS;
    readonly maxFinishedAt = toDateTimeLocal(new Date());
    readonly minFinishedAt = computed(() => toDateTimeLocal(new Date(this.maintenance().startedAt)));

    readonly finishedAt = signal(this.maxFinishedAt);
    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    // Mismas reglas que la API (MaxDate) y no puede terminar antes de iniciar.
    readonly finishedAtError = computed(() => {
        const value = this.finishedAt();
        if (!value) {
            return 'Ingresa la fecha de finalización.';
        }
        const finishedAt = new Date(value);
        if (finishedAt > new Date()) {
            return 'La fecha de finalización no puede ser futura.';
        }
        return value < this.minFinishedAt() ? 'La fecha de finalización no puede ser anterior al inicio.' : null;
    });

    submit(): void {
        if (this.finishedAtError() || this.isSubmitting()) {
            return;
        }

        const { id } = this.maintenance();
        const finishedAt = new Date(this.finishedAt());

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.maintenancesService.complete(id, { finishedAt: finishedAt.toISOString() }).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.notification.success(`Mantenimiento #${id} completado.`);
                this.completed.emit({ id, finishedAt });
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }
}
