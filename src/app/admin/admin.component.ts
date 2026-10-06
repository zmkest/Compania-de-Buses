import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./admin.component.css'],
    imports: [SidebarComponent, RouterOutlet]
})
export class AdminComponent {

}
