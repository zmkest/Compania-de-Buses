import { TerminalDetail } from '../terminals/terminal.dto';

export enum EWeekday {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export const WEEKDAY_SHORT_LABELS: Record<EWeekday, string> = {
    [EWeekday.MONDAY]: 'Lun',
    [EWeekday.TUESDAY]: 'Mar',
    [EWeekday.WEDNESDAY]: 'Mié',
    [EWeekday.THURSDAY]: 'Jue',
    [EWeekday.FRIDAY]: 'Vie',
    [EWeekday.SATURDAY]: 'Sáb',
    [EWeekday.SUNDAY]: 'Dom',
};

// Listado, creación y edición traen origen y destino con su ciudad.
export interface RouteResponse {
    id: number;
    originId: number;
    destinationId: number;
    distanceKm: number;
    durationMinutes: number;
    origin: TerminalDetail;
    destination: TerminalDetail;
}

export interface Frequency {
    id: number;
    routeId: number;
    // Columna TIME: llega como fecha ISO de 1970 en UTC (ej. 1970-01-01T08:30:00.000Z).
    departureTime: string;
    weekdays: EWeekday[];
    // Decimal: llega como texto (ej. "12.5").
    basePrice: string;
    isActive: boolean;
}

// GET /routes/:id además trae las frecuencias ordenadas por hora de salida.
export interface RouteDetail extends RouteResponse {
    frequencies: Frequency[];
}

export interface CreateRouteDto {
    originId: number;
    destinationId: number;
    distanceKm: number;
    durationMinutes: number;
}

export type UpdateRouteDto = Partial<Pick<CreateRouteDto, 'distanceKm' | 'durationMinutes'>>;
