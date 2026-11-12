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

export interface TerminalDetail extends TerminalResponse {
    city: City;
}

export interface CreateTerminalDto {
    name: string;
    cityId: number;
    address?: string;
}

// address: null borra la dirección guardada.
export type UpdateTerminalDto = Partial<Omit<CreateTerminalDto, 'address'>> & { address?: string | null };
