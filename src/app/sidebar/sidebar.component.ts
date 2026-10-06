import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sidebar.component.css'],
    imports: [RouterLink, RouterLinkActive]
})
export class SidebarComponent {

}
