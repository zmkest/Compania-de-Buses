import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { CreateRouteDto, RouteDetail, RouteResponse, UpdateRouteDto } from '../route.dto';
import { RoutesService } from '../routes.service';
import { TerminalsService } from '../../terminals/terminals.service';
import { City } from '../../cities/city.dto';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { AppError } from '../../../../core/errors/app-error';

// Mismos límites que valida la API.
const MAX_DISTANCE_KM = 10000;
const MAX_DURATION_MINUTES = 10080;

// Hasta 2 decimales, como acepta la API.
const DISTANCE_PATTERN = /^\d+(\.\d{1,2})?$/;

type RouteFormControl = 'originCityId' | 'originId' | 'destinationCityId' | 'destinationId' | 'distanceKm' | 'durationMinutes';

interface CreateStep {
    title: string;
    description: string;
    controls: RouteFormControl[];
}

// Al crear, la ruta se arma por pasos: primero el origen, luego el destino y al final el recorrido.
const CREATE_STEPS: CreateStep[] = [
    { title: 'Origen', description: 'Terminal desde donde sale el bus', controls: ['originCityId', 'originId'] },
    { title: 'Destino', description: 'Terminal donde llega el bus', controls: ['destinationCityId', 'destinationId'] },
    { title: 'Recorrido', description: 'Distancia y duración del viaje', controls: ['distanceKm', 'durationMinutes'] },
];

@Component({
    selector: 'app-route-form',
    templateUrl: './route-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class RouteFormComponent implements OnInit {
    private readonly formBuilder = inject(FormBuilder);
    private readonly routesService = inject(RoutesService);
    private readonly terminalsService = inject(TerminalsService);
    private readonly notification = inject(NotificationService);

    // Solo ciudades con terminales: las demás no sirven como origen ni destino.
    readonly cities = input.required<City[]>();
    // null: crear; con id: editar distancia y duración (los datos actuales se piden a GET /routes/:id).
    readonly routeId = input<number | null>(null);

    readonly created = output();
    readonly updated = output<RouteResponse>();
    readonly cancelled = output<void>();

    readonly maxDistanceKm = MAX_DISTANCE_KM;
    readonly maxDurationMinutes = MAX_DURATION_MINUTES;
    readonly isEdit = computed(() => this.routeId() !== null);

    readonly steps = CREATE_STEPS;
    readonly step = signal(0);
    readonly isLastStep = computed(() => this.step() === CREATE_STEPS.length - 1);

    readonly route = signal<RouteDetail | null>(null);
    readonly isLoading = signal(false);
    readonly loadError = signal<string | null>(null);
    readonly errorMessages = signal<string[]>([]);
    readonly isSubmitting = signal(false);

    readonly form = this.formBuilder.group({
        originCityId: [null as number | null, Validators.required],
        originId: [{ value: null as number | null, disabled: true }, Validators.required],
        destinationCityId: [null as number | null, Validators.required],
        destinationId: [{ value: null as number | null, disabled: true }, Validators.required],
        distanceKm: ['', [Validators.required, Validators.pattern(DISTANCE_PATTERN), Validators.min(0.01), Validators.max(MAX_DISTANCE_KM)]],
        durationMinutes: [null as number | null, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(MAX_DURATION_MINUTES)]],
    });

    private readonly originCityId = toSignal(this.form.controls.originCityId.valueChanges, { initialValue: null });
    private readonly destinationCityId = toSignal(this.form.controls.destinationCityId.valueChanges, { initialValue: null });
    private readonly originId = toSignal(this.form.controls.originId.valueChanges, { initialValue: null });
    private readonly destinationId = toSignal(this.form.controls.destinationId.valueChanges, { initialValue: null });

    readonly originTerminalsResource = this.terminalsOf(this.originCityId);
    readonly destinationTerminalsResource = this.terminalsOf(this.destinationCityId);

    readonly originTerminals = computed(() => this.originTerminalsResource.hasValue() ? this.originTerminalsResource.value() : []);
    // El terminal de origen no puede ser también el destino.
    readonly destinationTerminals = computed(() => {
        const terminals = this.destinationTerminalsResource.hasValue() ? this.destinationTerminalsResource.value() : [];
        return terminals.filter(terminal => terminal.id !== this.originId());
    });

    // Resumen de lo elegido en los pasos anteriores.
    readonly originSummary = computed(() => this.summary(this.originCityId(), this.originId(), this.originTerminals()));
    readonly destinationSummary = computed(() => this.summary(this.destinationCityId(), this.destinationId(), this.destinationTerminals()));

    constructor() {
        // Al cambiar de ciudad, el terminal elegido deja de valer.
        this.form.controls.originCityId.valueChanges.subscribe(cityId => this.resetTerminal('originId', cityId));
        this.form.controls.destinationCityId.valueChanges.subscribe(cityId => this.resetTerminal('destinationId', cityId));
        // Si al volver atrás se elige como origen el terminal de destino, el destino se vuelve a elegir.
        this.form.controls.originId.valueChanges.subscribe(originId => {
            if (originId && originId === this.form.controls.destinationId.value) {
                this.form.controls.destinationId.reset(null);
            }
        });
    }

    next(): void {
        const controls = CREATE_STEPS[this.step()].controls.map(name => this.form.controls[name]);
        controls.forEach(control => control.markAsTouched());
        if (controls.some(control => control.invalid)) {
            return;
        }
        this.step.update(step => step + 1);
    }

    back(): void {
        this.step.update(step => Math.max(0, step - 1));
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        const id = this.routeId();
        if (id === null) {
            return;
        }

        // En edición la API solo permite cambiar distancia y duración.
        this.form.controls.originCityId.disable();
        this.form.controls.destinationCityId.disable();
        this.isLoading.set(true);
        this.loadError.set(null);

        this.routesService.getById(id).subscribe({
            next: route => {
                this.route.set(route);
                this.form.patchValue({ distanceKm: String(route.distanceKm), durationMinutes: route.durationMinutes });
                this.isLoading.set(false);
            },
            error: (err: AppError) => {
                this.loadError.set(err.message);
                this.isLoading.set(false);
            },
        });
    }

    submit(): void {
        // Enter en un paso intermedio avanza en lugar de enviar.
        if (!this.isEdit() && !this.isLastStep()) {
            this.next();
            return;
        }
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const { originId, destinationId, distanceKm, durationMinutes } = this.form.getRawValue();
        const distance = Number(distanceKm);
        const duration = Number(durationMinutes);
        const route = this.route();

        this.isSubmitting.set(true);
        this.errorMessages.set([]);

        if (route) {
            this.update(route, distance, duration);
            return;
        }

        const data: CreateRouteDto = {
            originId: Number(originId),
            destinationId: Number(destinationId),
            distanceKm: distance,
            durationMinutes: duration,
        };

        this.routesService.create(data).subscribe({
            next: created => {
                this.isSubmitting.set(false);
                this.notification.success(`Ruta ${created.origin.city.name} → ${created.destination.city.name} creada.`);
                this.created.emit();
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private update(route: RouteDetail, distanceKm: number, durationMinutes: number): void {
        // Solo se envían los campos modificados.
        const changes: UpdateRouteDto = {
            ...(distanceKm !== route.distanceKm && { distanceKm }),
            ...(durationMinutes !== route.durationMinutes && { durationMinutes }),
        };

        if (Object.keys(changes).length === 0) {
            this.isSubmitting.set(false);
            this.cancelled.emit();
            return;
        }

        this.routesService.update(route.id, changes).subscribe({
            next: updated => {
                this.isSubmitting.set(false);
                this.notification.success(`Ruta #${updated.id} actualizada.`);
                this.updated.emit(updated);
            },
            error: (err: AppError) => this.onSubmitError(err),
        });
    }

    private terminalsOf(cityId: () => number | null) {
        return rxResource({
            params: () => this.cities().find(city => city.id === cityId()),
            stream: ({ params: city }) => city ? this.terminalsService.getByCity(city) : of([]),
        });
    }

    private summary(cityId: number | null, terminalId: number | null, terminals: { id: number; name: string }[]) {
        const city = this.cities().find(item => item.id === cityId);
        const terminal = terminals.find(item => item.id === terminalId);
        return city && terminal ? { city: city.name, terminal: terminal.name } : null;
    }

    private resetTerminal(control: 'originId' | 'destinationId', cityId: number | null): void {
        const terminal = this.form.controls[control];
        terminal.reset(null);
        cityId ? terminal.enable() : terminal.disable();
    }

    private onSubmitError(err: AppError): void {
        this.isSubmitting.set(false);
        this.errorMessages.set(err.fieldErrors?.length ? err.fieldErrors : [err.message]);
    }
}
