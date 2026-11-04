import { EMaintenanceStatus, EMaintenanceType } from '../enums/bus.enum';

export interface MaintenanceResponse {
    id: number;
    busId: number;
    // Opcional hasta que la API lo incluya; mientras tanto se muestra el busId.
    busPlate?: string | null;
    type: EMaintenanceType;
    status: EMaintenanceStatus;
    description: string | null;
    // Prisma serializa los Decimal como texto.
    cost: string | number | null;
    startedAt: Date;
    finishedAt: Date | null;
    createdAt: Date;
}

export interface UpdateMaintenanceDto {
    // Requerido por la API para validar que el mantenimiento pertenece al bus.
    busId: number;
    type?: EMaintenanceType;
    description?: string;
    // ISO 8601; no puede ser futura.
    startedAt?: string;
    cost?: number;
}

export interface CompleteMaintenanceDto {
    // ISO 8601; no puede ser futura.
    finishedAt: string;
}

export type MaintenanceStatusStats = { total: number } & Record<EMaintenanceStatus, number>;

export interface MaintenanceCostReportResponse {
    bus: { id: number; plate: string };
    period: { from: Date; to: Date };
    summary: {
        // Prisma serializa los Decimal como texto.
        totalCost: string | number;
        // Promedia solo los mantenimientos que tienen costo registrado.
        averageCost: string | number;
        totalMaintenances: number;
    };
    items: MaintenanceResponse[];
}
