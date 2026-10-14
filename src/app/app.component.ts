import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastsComponent } from './core/notifications/notification.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./app.component.css'],
    imports: [RouterOutlet, ToastsComponent]
})
export class AppComponent {
  title = 'practica';
}
