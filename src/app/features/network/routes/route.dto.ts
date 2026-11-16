import { TerminalDetail } from '../terminals/terminal.dto';
import { Frequency } from '../frequencies/frequency.dto';

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
