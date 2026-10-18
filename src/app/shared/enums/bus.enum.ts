export enum EBusStatus {
    AVAILABLE = 'AVAILABLE',
    ON_ROUTE = 'ON_ROUTE',
    MAINTENANCE = 'MAINTENANCE',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export const BUS_STATUS_LABELS: Record<EBusStatus, string> = {
    [EBusStatus.AVAILABLE]: 'Disponible',
    [EBusStatus.ON_ROUTE]: 'En ruta',
    [EBusStatus.MAINTENANCE]: 'Mantenimiento',
    [EBusStatus.OUT_OF_SERVICE]: 'Fuera de servicio',
};

// Cambios de estado permitidos desde cada estado actual.
export const BUS_STATUS_TRANSITIONS: Record<EBusStatus, readonly EBusStatus[]> = {
    [EBusStatus.AVAILABLE]: [EBusStatus.ON_ROUTE, EBusStatus.MAINTENANCE, EBusStatus.OUT_OF_SERVICE],
    [EBusStatus.ON_ROUTE]: [EBusStatus.AVAILABLE],
    [EBusStatus.OUT_OF_SERVICE]: [EBusStatus.AVAILABLE],
    [EBusStatus.MAINTENANCE]: [EBusStatus.AVAILABLE],
};
