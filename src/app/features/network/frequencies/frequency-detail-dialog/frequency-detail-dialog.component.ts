import { Component, ChangeDetectionStrategy, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FrequenciesService } from '../frequencies.service';
import { WEEKDAYS, WEEKDAY_LABELS, WEEKDAY_SHORT_LABELS } from '../frequency.dto';
import { formatArrivalTime, formatDepartureTime } from '../frequency-format';
import { formatDuration } from '../../routes/route-format';

@Component({
    selector: 'app-frequency-detail-dialog',
    templateUrl: './frequency-detail-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CurrencyPipe, DecimalPipe]
})
export class FrequencyDetailDialogComponent {
    private readonly frequenciesService = inject(FrequenciesService);

    readonly frequencyId = input.required<number>();

    readonly closed = output<void>();

    readonly weekdays = WEEKDAYS;
    readonly weekdayLabels = WEEKDAY_LABELS;
    readonly weekdayShortLabels = WEEKDAY_SHORT_LABELS;
    readonly formatDepartureTime = formatDepartureTime;
    readonly formatArrivalTime = formatArrivalTime;
    readonly formatDuration = formatDuration;

    readonly frequencyResource = rxResource({
        params: () => this.frequencyId(),
        stream: ({ params }) => this.frequenciesService.getById(params),
    });

    readonly frequency = computed(() => this.frequencyResource.hasValue() ? this.frequencyResource.value() : undefined);
}
