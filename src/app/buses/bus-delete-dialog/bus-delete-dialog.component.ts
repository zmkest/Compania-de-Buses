import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { BusResponse } from '../../shared/models/bus.dto';

@Component({
    selector: 'app-bus-delete-dialog',
    templateUrl: './bus-delete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class BusDeleteDialogComponent {
    readonly bus = input.required<BusResponse>();

    readonly confirmed = output<BusResponse>();
    readonly cancelled = output<void>();
}
