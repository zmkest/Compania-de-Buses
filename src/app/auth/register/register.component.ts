import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppError } from '../../core/errors/app-error';
import { NotificationService } from '../../core/notifications/notification.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, RouterLink]
})
export class RegisterComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly notification = inject(NotificationService);

    readonly form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator });

    readonly errorMessage = signal('');
    readonly isSubmitting = signal(false);

    async submit(): Promise<void> {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const { name, email, password } = this.form.getRawValue();

        this.authService.register(name, email, password).subscribe({
            next: (_) => {
                this.router.navigateByUrl('/login');
                this.notification.success('Cuenta creada exitosamente');
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
