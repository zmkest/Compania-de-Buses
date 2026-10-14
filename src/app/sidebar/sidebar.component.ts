import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EUserRole } from '../shared/enums/user.enum';

interface MenuItem {
    route: string;
    title: string;
    imageUrl: string;
    roles: EUserRole[]
}

const menu: MenuItem[] =[
        {
            route: 'usuarios', title: 'Usuarios', imageUrl: 'assets/img/users.png',
            roles: [EUserRole.ADMIN]
        },
        {
            route: 'choferes', title: 'Choferes', imageUrl: 'assets/img/chofer.png',
            roles: [EUserRole.ADMIN]
        },
        {
            route: 'buses', title: 'Buses', imageUrl: 'assets/img/bus.png',
            roles: [EUserRole.ADMIN]
        },
        {
            route: 'tripulacion', title: 'Tripulación', imageUrl: 'assets/img/tripulacion.png',
            roles: [EUserRole.ADMIN]
        },
        {
            route: 'viajes', title: 'Viajes', imageUrl: 'assets/img/viaje.png',
            roles: [EUserRole.ADMIN]
        },
        {
            route: 'consultas', title: 'Consultas', imageUrl: 'assets/img/reporte.png',
            roles: [EUserRole.ADMIN]
        },
    ]

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
    readonly role = computed(() => this.currentUser()?.role);

     protected readonly items = computed(() => {
        const role = this.role();
        return role ? this.filterMenu(menu, role) : [];
    });

    filterMenu(items: MenuItem[], role: EUserRole): MenuItem[] {
        return items.filter( i => !i.roles || i.roles.includes(this.role()!))
    }

    logout(): void {
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
