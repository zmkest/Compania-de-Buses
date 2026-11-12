export interface City {
    id: number;
    name: string;
}

// El listado paginado solo trae cityId; GET /terminals/:id incluye la ciudad.
export interface TerminalResponse {
    id: number;
    name: string;
    cityId: number;
    address: string | null;
}
