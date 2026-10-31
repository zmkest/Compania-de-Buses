import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppError } from '../../core/errors/app-error';
import { newPasswordMatchValidator } from '../../shared/validators/new-password-match.validator';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RouterLink]
})
export class ResetPasswordComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);

    readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

    readonly form = this.formBuilder.nonNullable.group({
        newPwd: ['', [Validators.required, Validators.minLength(8)]],
        repitNewPwd: ['', [Validators.required]],
    }, { validators: newPasswordMatchValidator });

    readonly errorMessage = signal('');
    readonly successMessage = signal('');
    readonly isSubmitting = signal(false);

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const { newPwd, repitNewPwd } = this.form.getRawValue();

        this.authService.resetPassword(this.token, newPwd, repitNewPwd).subscribe({
            next: ({ message }) => {
                this.successMessage.set(message);
                this.isSubmitting.set(false);
            },
            error: (err: AppError) => {
                this.errorMessage.set(err.fieldErrors?.[0] ?? err.message);
                this.isSubmitting.set(false);
            },
        });
    }
}
