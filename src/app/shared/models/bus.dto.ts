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
    status?: EBusStatus;
}

export type UpdateBusDto = Partial<CreateBusDto>;
