import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { UserResponse } from '../../shared/models/user.dto';

@Component({
    selector: 'app-user-delete-dialog',
    templateUrl: './user-delete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class UserDeleteDialogComponent {
    readonly user = input.required<UserResponse>();

    readonly confirmed = output<UserResponse>();
    readonly cancelled = output<void>();
}
