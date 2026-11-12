import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
    MAINTENANCE_STATUS_LABELS,
    MAINTENANCE_STATUS_TEXT_CLASSES,
    MAINTENANCE_TYPE_LABELS,
    MAINTENANCE_TYPE_TEXT_CLASSES,
} from '../../buses/bus.enum';
import { MaintenancesService } from '../maintenances.service';

@Component({
    selector: 'app-maintenance-detail-dialog',
    templateUrl: './maintenance-detail-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, CurrencyPipe]
})
export class MaintenanceDetailDialogComponent {
    private readonly maintenancesService = inject(MaintenancesService);

    readonly maintenanceId = input.required<number>();
    // El detalle de la API no trae la placa; la aporta quien abre el diálogo.
    readonly busPlate = input.required<string>();

    readonly closed = output<void>();

    readonly typeLabels = MAINTENANCE_TYPE_LABELS;
    readonly typeTextClasses = MAINTENANCE_TYPE_TEXT_CLASSES;
    readonly statusLabels = MAINTENANCE_STATUS_LABELS;
    readonly statusTextClasses = MAINTENANCE_STATUS_TEXT_CLASSES;

    readonly maintenanceResource = rxResource({
        params: () => this.maintenanceId(),
        stream: ({ params }) => this.maintenancesService.getById(params),
    });

    readonly maintenance = computed(() => this.maintenanceResource.hasValue() ? this.maintenanceResource.value() : undefined);
}
