import { TerminalDetail } from '../../network/terminals/terminal.dto';

export enum ETripStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export const TRIP_STATUSES = Object.values(ETripStatus);

export const TRIP_STATUS_LABELS: Record<ETripStatus, string> = {
    [ETripStatus.SCHEDULED]: 'Programado',
    [ETripStatus.IN_PROGRESS]: 'En curso',
    [ETripStatus.COMPLETED]: 'Completado',
    [ETripStatus.CANCELLED]: 'Cancelado',
};

export const TRIP_STATUS_BADGE_CLASSES: Record<ETripStatus, string> = {
    [ETripStatus.SCHEDULED]: 'bg-blue-100 text-blue-700',
    [ETripStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-700',
    [ETripStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
    [ETripStatus.CANCELLED]: 'bg-red-100 text-red-700',
};

type TripTerminal = Pick<TerminalDetail, 'id' | 'name' | 'city'>;

export interface Trip {
    id: number;
    routeId: number;
    frequencyId: number | null;
    busId: number | null;
    rotationId: number | null;
    scheduledDeparture: string;
    scheduledArrival: string;
    estimatedArrival: string;
    actualDeparture: string | null;
    actualArrival: string | null;
    price: string;
    status: ETripStatus;
    durationMinutes: number;
    createdAt: string;
    updatedAt: string;
}

export interface TripResponse extends Trip {
    route: { id: number; origin: TripTerminal; destination: TripTerminal };
    bus: { id: number; plate: string; model: string } | null;
}

export const MAX_GENERATION_DAYS = 31;

export interface GenerateTripsDto {
    from: string;
    to: string;
    routeId?: number;
}

export interface GeneratedUnassigned {
    frequencyId: number;
    scheduledDeparture: string;
    code: string;
    message: string;
    conflictTripId?: number;
}

export interface GenerateTripsResult {
    created: number;
    skipped: number;
    assigned: number;
    unassigned: GeneratedUnassigned[];
}

export interface CreateTripDto {
    routeId: number;
    busId: number;
    scheduledDeparture: string;
    price: number;
}
