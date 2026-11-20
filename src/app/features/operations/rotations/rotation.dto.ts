import { EBusStatus } from '../../fleet/buses/bus.enum';
import { EWeekday } from '../../network/frequencies/frequency.dto';
import { GeneratedUnassigned } from '../trips/trip.dto';
import { TerminalDetail } from '../../network/terminals/terminal.dto';

export interface Rotation {
    id: number;
    name: string;
    busId: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RotationResponse extends Rotation {
    bus: { id: number; plate: string } | null;
    _count: { legs: number };
}

type RotationTerminal = Pick<TerminalDetail, 'id' | 'name' | 'city'>;

export interface RotationLeg {
    id: number;
    weekday: EWeekday;
    frequency: {
        id: number;
        departureTime: string;
        isActive: boolean;
        route: {
            id: number;
            durationMinutes: number;
            origin: RotationTerminal;
            destination: RotationTerminal;
        };
    };
}

export interface RotationDetail extends Rotation {
    bus: { id: number; plate: string; model: string; status: EBusStatus } | null;
    legs: RotationLeg[];
    _count: { trips: number };
}

export interface RotationLegDto {
    frequencyId: number;
    weekday: EWeekday;
}

export interface CreateRotationDto {
    name: string;
    busId?: number;
    legs: RotationLegDto[];
}

export type UpdateRotationDto = Partial<Omit<CreateRotationDto, 'busId'>>;

export interface UpdatedRotation extends RotationDetail {
    detachedTrips: number;
}

export interface ChangeRotationBusDto {
    busId: number | null;
    applyFrom?: string;
}

export interface RotationTripUnassigned extends GeneratedUnassigned {
    tripId: number;
}

export interface ChangeRotationBusResult {
    rotation: RotationDetail;
    reassigned: number;
    unassigned: RotationTripUnassigned[];
}
