import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
    selector: 'app-user-search',
    templateUrl: './user-search.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class UserSearchComponent {
    readonly searched = output<string>();

    readonly query = new FormControl('', { nonNullable: true });
    readonly hasValue = toSignal(this.query.valueChanges.pipe(map(value => value.length > 0)), { initialValue: false });

    constructor() {
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
