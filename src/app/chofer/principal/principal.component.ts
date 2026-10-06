import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ListarComponent } from '../listar/listar.component';

@Component({
    selector: 'app-principal',
    templateUrl: './principal.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./principal.component.css'],
    imports: [ListarComponent]
})
export class PrincipalComponent {

}
