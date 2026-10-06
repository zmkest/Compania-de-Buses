import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AdminComponent } from './admin/admin.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./app.component.css'],
    imports: [AdminComponent]
})
export class AppComponent {
  title = 'practica';
}
