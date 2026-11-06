// Bus con el total de asientos registrados (GET /seats/bus).
export interface BusSeatCount {
    id: number;
    plate: string;
    seatCount: number;
}

export interface Seat {
    id: number;
    number: number;
    isOperational: boolean;
}

export interface SeatsCreatedResponse {
    busId: number;
    created: number;
}

// Mapa de asientos de un bus (GET /seats/bus/:id), ordenados por número.
export interface BusSeatMap {
    bus: { id: number; plate: string };
    seats: Seat[];
}
