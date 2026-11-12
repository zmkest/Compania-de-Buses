import { Component, ChangeDetectionStrategy, effect, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
    selector: 'app-bus-search',
    templateUrl: './bus-search.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class BusSearchComponent {
    // Valor actual (viene de la URL); mantiene la caja sincronizada al recargar o usar atrás/adelante.
    readonly value = input('');
    readonly placeholder = input('Buscar por placa o modelo');
    readonly searched = output<string>();

    readonly query = new FormControl('', { nonNullable: true });
    readonly hasValue = toSignal(this.query.valueChanges.pipe(map(value => value.length > 0)), { initialValue: false });

    constructor() {
        effect(() => {
            const value = this.value();
            if (this.query.value.trim() !== value) {
                this.query.setValue(value);
            }
        });

        this.query.valueChanges.pipe(
            debounceTime(300),
            map(value => value.trim()),
            distinctUntilChanged(),
            takeUntilDestroyed(),
        ).subscribe(value => this.searched.emit(value));
    }

    clear(): void {
        this.query.setValue('');
        this.searched.emit('');
    }
}
