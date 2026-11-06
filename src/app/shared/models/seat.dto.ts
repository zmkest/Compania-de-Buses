// Bus con el total de asientos registrados (GET /seats/bus).
export interface BusSeatCount {
    id: number;
    plate: string;
    seatCount: number;
}
