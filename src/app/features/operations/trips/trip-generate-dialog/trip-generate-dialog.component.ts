import { Component, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { GenerateTripsResult, MAX_GENERATION_DAYS } from '../trip.dto';
import { TripsService } from '../trips.service';
import { RouteResponse } from '../../../network/routes/route.dto';
import { toDateInput } from '../../../../shared/utils/date-util';
import { AppError } from '../../../../core/errors/app-error';

const DAY_MS = 86_400_000;

function addDays(day: string, days: number): string {
    const date = new Date(`${day}T00:00:00`);
    date.setDate(date.getDate() + days);
    return toDateInput(date);
}

function validRange(group: AbstractControl): ValidationErrors | null {
    const { from, to } = group.value as { from: string; to: string };
    if (!from || !to) {
        return null;
    }
    if (to < from) {
        return { order: true };
    }
    const days = Math.round((Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / DAY_MS) + 1;
    return days > MAX_GENERATION_DAYS ? { tooLong: true } : null;
}

@Component({
    selector: 'app-trip-generate-dialog',
    templateUrl: './trip-generate-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePipe]
})
export class TripGenerateDialogComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly tripsService = inject(TripsService);

    readonly routes = input.required<RouteResponse[]>();

    readonly closed = output<boolean>();

    readonly maxDays = MAX_GENERATION_DAYS;
    readonly today = toDateInput(new Date());

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);
    readonly result = signal<GenerateTripsResult | null>(null);
    private readonly hasCreated = signal(false);

    readonly form = this.formBuilder.nonNullable.group({
        from: [this.today, Validators.required],
        to: [addDays(this.today, 6), Validators.required],
        routeId: [''],
    }, { validators: validRange });

    private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

    readonly maxTo = computed(() => {
        const from = this.formValue().from;
        return from ? addDays(from, MAX_GENERATION_DAYS - 1) : '';
    });

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { from, to, routeId } = this.form.getRawValue();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.tripsService.generate({ from, to, ...(routeId && { routeId: Number(routeId) }) }).subscribe({
            next: result => {
                this.isSubmitting.set(false);
                this.result.set(result);
                this.hasCreated.update(created => created || result.created > 0);
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    close(): void {
        this.closed.emit(this.hasCreated());
    }
}
