import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FrequencyResponse, WEEKDAY_SHORT_LABELS, WEEKDAYS } from '../frequency.dto';
import { formatDepartureTime } from '../frequency-format';

@Component({
    selector: 'app-frequency-delete-dialog',
    templateUrl: './frequency-delete-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class FrequencyDeleteDialogComponent {
    readonly frequency = input.required<FrequencyResponse>();
    readonly isDeleting = input(false);

    readonly confirmed = output<FrequencyResponse>();
    readonly cancelled = output<void>();

    readonly formatDepartureTime = formatDepartureTime;

    days(frequency: FrequencyResponse): string {
        return WEEKDAYS.filter(day => frequency.weekdays.includes(day)).map(day => WEEKDAY_SHORT_LABELS[day]).join(', ');
    }
}
