import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { EUserRole, USER_ROLE_LABELS } from '../../shared/enums/user.enum';
import { UpdateUserDto, UserResponse } from '../../shared/models/user.dto';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { UserSearchComponent } from '../user-search/user-search.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserDeleteDialogComponent } from '../user-delete-dialog/user-delete-dialog.component';
import { AppError } from '../../core/errors/app-error';

const PAGE_SIZE = 5;

const ROLE_BADGE_CLASSES: Record<EUserRole, string> = {
    [EUserRole.ADMIN]: 'bg-brand-navy text-white',
    [EUserRole.OPERATOR]: 'bg-blue-100 text-blue-700',
    [EUserRole.SELLER]: 'bg-amber-100 text-amber-700',
    [EUserRole.DRIVER]: 'bg-emerald-100 text-emerald-700',
    [EUserRole.PASSENGER]: 'bg-gray-100 text-gray-700',
};

@Component({
    selector: 'app-user-admin',
    templateUrl: './user-admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DatePipe, UserSearchComponent, UserFormComponent, UserDeleteDialogComponent]
})
export class UserAdminComponent {
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly notificationService = inject(NotificationService);

    readonly roleLabels = USER_ROLE_LABELS;
    readonly roleBadgeClasses = ROLE_BADGE_CLASSES;

    readonly page = signal(1);
    readonly search = signal('');

    readonly isFormOpen = signal(false);
    readonly editingUser = signal<UserResponse | null>(null);
    readonly deletingUser = signal<UserResponse | null>(null);

    readonly usersResource = rxResource({
        params: () => ({ page: this.page(), limit: PAGE_SIZE, search: this.search() }),
        stream: ({ params }) => this.userService.getAll(params),
    });

    readonly statsResource = rxResource({
        stream: () => this.userService.getStats(),
    });

    private readonly usersPage = computed(() => this.usersResource.hasValue() ? this.usersResource.value() : undefined);

    readonly users = computed(() => this.usersPage()?.items ?? []);
    readonly totalPages = computed(() => this.usersPage()?.meta.totalPages ?? 1);
    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));
    readonly stats = computed(() => this.statsResource.hasValue() ? this.statsResource.value() : undefined);

    isCurrentUser(user: UserResponse): boolean {
        return this.authService.currentUser()?.id === user.id;
    }

    initials(name: string): string {
        return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase();
    }

    onSearch(search: string): void {
        this.search.set(search);
        this.page.set(1);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.page.set(page);
        }
    }

    reload(): void {
        this.usersResource.reload();
        this.statsResource.reload();
    }

    openCreate(): void {
        this.editingUser.set(null);
        this.isFormOpen.set(true);
    }

    openEdit(user: UserResponse): void {
        this.editingUser.set(user);
        this.isFormOpen.set(true);
    }

    closeForm(): void {
        this.isFormOpen.set(false);
        this.editingUser.set(null);
    }

    onCreated(): void {
        this.closeForm();
        this.reload();
    }

    onUpdated({ id, changes }: { id: number; changes: UpdateUserDto }): void {
        this.replaceUser(id, user => ({ ...user, ...changes }));
        this.closeForm();
    }

    toggleActive(user: UserResponse): void {
        const isActive = !user.isActive;
        this.userService.updateIsActive(user.id, isActive).subscribe({
            next: (_) => {
                this.replaceUser(user.id, current => ({ ...current, isActive }));
                this.notificationService.success(`Usuario ${isActive ? 'activado' : 'desactivado'}.`);

                this.statsResource.reload();
            },
            error: (err: AppError) => {
                this.notificationService.error(err.message);
            }
        })
    }

    confirmDelete(user: UserResponse): void {
        this.deletingUser.set(null);
        this.notificationService.success(`Usuario ${user.name} eliminado.`);
    }

    private replaceUser(id: number, change: (user: UserResponse) => UserResponse): void {
        this.usersResource.value.update(response => response && {
            ...response,
            items: response.items.map(user => user.id === id ? change(user) : user),
        });
    }
}
