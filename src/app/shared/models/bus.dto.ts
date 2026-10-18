import { EBusStatus } from '../enums/bus.enum';

export interface BusResponse {
    id: number;
    plate: string;
    model: string;
    year: number;
    odometerKm: number;
    status: EBusStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateBusDto {
    plate: string;
    model: string;
    year: number;
    odometerKm: number;
}

export type UpdateBusDto = Partial<CreateBusDto>;

export interface BusStatusHistoryResponse {
    id: number;
    busId: number;
    busPlate: string | null;
    fromStatus: EBusStatus | null;
    toStatus: EBusStatus;
    reason: string | null;
    changedById: number | null;
    changedByName: string | null;
    createdAt: Date;
}

export interface UpdateBusStatusDto {
    status: EBusStatus;
    reason?: string;
}
