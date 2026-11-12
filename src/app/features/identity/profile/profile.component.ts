import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { USER_ROLE_LABELS } from '../../../core/auth/user.enum';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, ChangePasswordDialogComponent]
})
export class ProfileComponent {
    private readonly authService = inject(AuthService);

    readonly roleLabels = USER_ROLE_LABELS;

    readonly isChangingPassword = signal(false);

    readonly profileResource = rxResource({
        stream: () => this.authService.getProfile(),
    });
}
