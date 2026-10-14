import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EUserRole, USER_ROLE_LABELS } from '../../shared/enums/user.enum';
import { CreateUserDto, UpdateUserDto, UserResponse } from '../../shared/models/user.dto';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { AppError } from '../../core/errors/app-error';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePipe]
})
export class UserFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly notification = inject(NotificationService);

    readonly user = input<UserResponse | null>(null);

    readonly created = output();
    readonly updated = output<{ id: number; changes: UpdateUserDto }>();
    readonly cancelled = output<void>();

    readonly roles = Object.values(EUserRole);
    readonly roleLabels = USER_ROLE_LABELS;
    readonly isEdit = computed(() => this.user() !== null);

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        role: [EUserRole.PASSENGER, [Validators.required]],
    });

    ngOnInit(): void {
        const user = this.user();
        if (user) {
            this.form.patchValue({ name: user.name, email: user.email, role: user.role });
        }
    }

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const user = this.user();
        const { name, email, role } = this.form.getRawValue();

        if (user) {
            this.isSubmitting.set(true);
            this.errorMessages.set([]);
            const userId = user.id;
            this.userService.update(userId, { name: name.trim(), email: email.trim(), role}).subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.errorMessages.set([]);
                    this.notification.success(`Usuario ${name} actualizado.`);
                    this.updated.emit({ id: userId, changes: { name: name.trim(), email: email.trim(), role} } );
                },
                error: (err: AppError) => {
                    this.isSubmitting.set(false);
                    this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
                },
            });
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.authService.registerByAdmin(name.trim(), email.trim(), role).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                    this.errorMessages.set([]);
                this.notification.success(`Usuario ${name} creado.`);
                this.created.emit();
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }
}
