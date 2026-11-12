export enum EUserRole {
    ADMIN = 'ADMIN',
    OPERATOR = 'OPERATOR',
    SELLER = 'SELLER',
    DRIVER = 'DRIVER',
    PASSENGER = 'PASSENGER'
}

export const USER_ROLE_LABELS: Record<EUserRole, string> = {
    [EUserRole.ADMIN]: 'Administrador',
    [EUserRole.OPERATOR]: 'Operador',
    [EUserRole.SELLER]: 'Vendedor',
    [EUserRole.DRIVER]: 'Chofer',
    [EUserRole.PASSENGER]: 'Pasajero',
};
