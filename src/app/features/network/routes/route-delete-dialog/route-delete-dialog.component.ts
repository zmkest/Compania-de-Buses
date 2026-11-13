import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouteResponse } from '../route.dto';

@Component({
    selector: 'app-route-delete-dialog',
    templateUrl: './route-delete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class RouteDeleteDialogComponent {
    readonly route = input.required<RouteResponse>();
    readonly isDeleting = input(false);

    readonly confirmed = output<RouteResponse>();
    readonly cancelled = output<void>();
}
