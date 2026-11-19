import { EWeekday } from '../../network/frequencies/frequency.dto';

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

export interface RotationLegDto {
    frequencyId: number;
    weekday: EWeekday;
}

export interface CreateRotationDto {
    name: string;
    busId?: number;
    legs: RotationLegDto[];
}
