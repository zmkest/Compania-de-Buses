import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RotationsService } from '../rotations.service';
import { ChangeRotationBusResult, RotationResponse } from '../rotation.dto';
import { BusResponse } from '../../../fleet/buses/bus.dto';
import { BUS_STATUS_LABELS, EBusStatus } from '../../../fleet/buses/bus.enum';
import { toDateInput } from '../../../../shared/utils/date-util';
import { AppError } from '../../../../core/errors/app-error';

@Component({
    selector: 'app-rotation-bus-dialog',
    templateUrl: './rotation-bus-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, DatePipe]
})
export class RotationBusDialogComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly rotationsService = inject(RotationsService);

    readonly rotation = input.required<RotationResponse>();
    readonly buses = input.required<BusResponse[]>();

    readonly closed = output<boolean>();

    readonly busStatusLabels = BUS_STATUS_LABELS;
    readonly today = toDateInput(new Date());

    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);
    readonly result = signal<ChangeRotationBusResult | null>(null);

    readonly form = this.formBuilder.nonNullable.group({
        busId: [''],
        reassign: [true],
        applyFrom: [this.today],
    });

    private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

    readonly availableBuses = computed(() => this.buses().filter(bus => bus.status !== EBusStatus.OUT_OF_SERVICE));
    readonly unchanged = computed(() => this.formValue().busId === String(this.rotation().busId ?? ''));
    readonly missingDate = computed(() => !!this.formValue().reassign && !this.formValue().applyFrom);
    readonly pastDate = computed(() => !!this.formValue().reassign && !!this.formValue().applyFrom && this.formValue().applyFrom! < this.today);

    ngOnInit(): void {
        this.form.controls.busId.setValue(String(this.rotation().busId ?? ''));
    }

    submit(): void {
        if (this.isSubmitting() || this.missingDate() || this.pastDate() || (this.unchanged() && !this.form.controls.reassign.value)) {
            return;
        }

        const { busId, reassign, applyFrom } = this.form.getRawValue();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        this.rotationsService.changeBus(this.rotation().id, {
            busId: busId ? Number(busId) : null,
            ...(reassign && { applyFrom }),
        }).subscribe({
            next: result => {
                this.isSubmitting.set(false);
                if (reassign) {
                    this.result.set(result);
                } else {
                    this.closed.emit(true);
                }
            },
            error: (err: AppError) => {
                this.isSubmitting.set(false);
                this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
            },
        });
    }

    close(): void {
        this.closed.emit(this.result() !== null);
    }
}
