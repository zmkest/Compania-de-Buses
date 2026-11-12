import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppError } from '../../../../core/errors/app-error';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RouterLink]
})
export class ForgotPasswordComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);

    readonly form = this.formBuilder.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
    });

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

        const { email } = this.form.getRawValue();

        this.authService.forgotPassword(email).subscribe({
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
