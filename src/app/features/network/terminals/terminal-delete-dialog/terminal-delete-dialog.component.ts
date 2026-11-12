import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TerminalResponse } from '../terminal.dto';

@Component({
    selector: 'app-terminal-delete-dialog',
    templateUrl: './terminal-delete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class TerminalDeleteDialogComponent {
    readonly terminal = input.required<TerminalResponse>();
    readonly cityName = input.required<string>();
    readonly isDeleting = input(false);

    readonly confirmed = output<TerminalResponse>();
    readonly cancelled = output<void>();
}
