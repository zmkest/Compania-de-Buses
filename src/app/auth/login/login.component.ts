import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppError } from '../../core/errors/app-error';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RouterLink]
})
export class LoginComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly form = this.formBuilder.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    readonly errorMessage = signal('');
    readonly isSubmitting = signal(false);

    async submit(): Promise<void> {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const { email, password } = this.form.getRawValue();

        this.authService.login(email, password).subscribe({
            next: (_) => {
                this.router.navigateByUrl('/');
            },
            error: (err: AppError) => {
                if (err.fieldErrors) {
                    for (let msg of err.fieldErrors) {
                        this.errorMessage.set(msg);
                    }
                    this.isSubmitting.set(false);
                } else {
                    this.errorMessage.set(err.message);
                    this.isSubmitting.set(false);
                }
            },
            complete: () => this.isSubmitting.set(false)
        });
    }
}
