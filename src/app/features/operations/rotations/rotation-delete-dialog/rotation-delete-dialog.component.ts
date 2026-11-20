import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RotationResponse } from '../rotation.dto';

@Component({
    selector: 'app-rotation-delete-dialog',
    templateUrl: './rotation-delete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class RotationDeleteDialogComponent {
    readonly rotation = input.required<RotationResponse>();
    readonly isDeleting = input(false);

    readonly confirmed = output<RotationResponse>();
    readonly cancelled = output<void>();
}
