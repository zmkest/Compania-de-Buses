import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';
import { newPasswordMatchValidator } from '../../../../shared/validators/new-password-match.validator';

@Component({
    selector: 'app-change-password-dialog',
    templateUrl: './change-password-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class ChangePasswordDialogComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly notification = inject(NotificationService);

    readonly changed = output<void>();
    readonly cancelled = output<void>();

    readonly form = this.formBuilder.nonNullable.group({
        pwd: ['', [Validators.required]],
        newPwd: ['', [Validators.required, Validators.minLength(8)]],
        repitNewPwd: ['', [Validators.required]],
    }, { validators: newPasswordMatchValidator });

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        const { pwd, newPwd, repitNewPwd } = this.form.getRawValue();

        this.authService.changePassword(pwd, newPwd, repitNewPwd).subscribe({
            next: ({ message }) => {
                this.isSubmitting.set(false);
                this.notification.success(message);
                this.changed.emit();
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }
}
