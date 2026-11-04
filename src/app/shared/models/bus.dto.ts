import { EBusStatus, EMaintenanceType } from '../enums/bus.enum';

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
    busPlate: string;
    fromStatus: EBusStatus;
    toStatus: EBusStatus;
    reason: string | null;
    changedById: number;
    changedByName: string;
    // La API solo lo asigna en el cambio que abre el mantenimiento.
    maintenanceId: number | null;
    createdAt: Date;
}

export interface UpdateBusStatusDto {
    status: EBusStatus;
    reason?: string;
    // Apertura de mantenimiento
    type?: EMaintenanceType;
    startedAt?: string;
    description?: string;
}
