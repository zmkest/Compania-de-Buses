import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sidebar.component.css'],
    imports: [RouterLink, RouterLinkActive]
})
export class SidebarComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly currentUser = this.authService.currentUser;

    logout(): void {
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
