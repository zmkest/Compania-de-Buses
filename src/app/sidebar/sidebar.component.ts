import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EUserRole } from '../shared/enums/user.enum';

interface SubMenuItem {
    title: string;
    icon: string;
    // Sin ruta: el módulo aún no está implementado y se muestra deshabilitado.
    route?: string;
}

interface MenuItem {
    route: string;
    title: string;
    imageUrl: string;
    roles: EUserRole[];
    children?: SubMenuItem[];
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
            route: 'flota', title: 'Flota', imageUrl: 'assets/img/bus.png',
            roles: [EUserRole.ADMIN],
            children: [
                { route: 'flota/buses', title: 'Buses', icon: 'M6 17V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v11M6 17h12M6 17v2m12-2v2M6 11h12' },
                { title: 'Asientos', icon: 'M7 4v9h10M7 13l-1 7M17 13v7M10 9h7' },
                { route: 'flota/buses/historial', title: 'Historial', icon: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 3' },
                { title: 'Mantenimiento', icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z' },
            ]
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
    imports: [RouterLink, RouterLinkActive]
})
export class SidebarComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    // "Buses" no debe quedar activo dentro de "Buses > Historial"; los filtros (?page=...) no cuentan.
    readonly exactPath: IsActiveMatchOptions = { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' };

    readonly currentUser = this.authService.currentUser;
    readonly role = computed(() => this.currentUser()?.role);

    private readonly currentUrl = toSignal(
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(event => event.urlAfterRedirects),
        ),
        { initialValue: this.router.url },
    );

    private readonly expandedGroups = signal(new Set<string>(
        menu.filter(item => item.children && this.isInSection(item.route)).map(item => item.route)
    ));

     protected readonly items = computed(() => {
        const role = this.role();
        return role ? this.filterMenu(menu, role) : [];
    });

    filterMenu(items: MenuItem[], role: EUserRole): MenuItem[] {
        return items.filter( i => !i.roles || i.roles.includes(this.role()!))
    }

    isExpanded(item: MenuItem): boolean {
        return this.expandedGroups().has(item.route);
    }

    isGroupActive(item: MenuItem): boolean {
        return this.isInSection(item.route);
    }

    toggleGroup(item: MenuItem): void {
        this.expandedGroups.update(groups => {
            const next = new Set(groups);
            next.has(item.route) ? next.delete(item.route) : next.add(item.route);
            return next;
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }

    private isInSection(route: string): boolean {
        return this.currentUrl().startsWith(`/${route}`);
    }
}
