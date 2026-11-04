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

export const BUS_STATUS_BADGE_CLASSES: Record<EBusStatus, string> = {
    [EBusStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-700',
    [EBusStatus.ON_ROUTE]: 'bg-blue-100 text-blue-700',
    [EBusStatus.MAINTENANCE]: 'bg-amber-100 text-amber-700',
    [EBusStatus.OUT_OF_SERVICE]: 'bg-red-100 text-red-700',
};

// Cambios de estado permitidos desde cada estado actual.
export const BUS_STATUS_TRANSITIONS: Record<EBusStatus, readonly EBusStatus[]> = {
    [EBusStatus.AVAILABLE]: [EBusStatus.ON_ROUTE, EBusStatus.MAINTENANCE, EBusStatus.OUT_OF_SERVICE],
    [EBusStatus.ON_ROUTE]: [EBusStatus.AVAILABLE],
    [EBusStatus.OUT_OF_SERVICE]: [EBusStatus.AVAILABLE, EBusStatus.MAINTENANCE],
    // Solo se sale de mantenimiento completándolo o cancelándolo: la API rechaza el cambio directo.
    [EBusStatus.MAINTENANCE]: [],
};

export enum EMaintenanceType {
    PREVENTIVE = 'PREVENTIVE',
    CORRECTIVE = 'CORRECTIVE'
}

export const MAINTENANCE_TYPE_LABELS: Record<EMaintenanceType, string> = {
    [EMaintenanceType.PREVENTIVE]: 'Preventivo',
    [EMaintenanceType.CORRECTIVE]: 'Correctivo',
};

export const MAINTENANCE_TYPE_TEXT_CLASSES: Record<EMaintenanceType, string> = {
    [EMaintenanceType.PREVENTIVE]: 'text-sky-700',
    [EMaintenanceType.CORRECTIVE]: 'text-orange-600',
};

export enum EMaintenanceStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export const MAINTENANCE_STATUS_LABELS: Record<EMaintenanceStatus, string> = {
    [EMaintenanceStatus.IN_PROGRESS]: 'En curso',
    [EMaintenanceStatus.COMPLETED]: 'Completado',
    [EMaintenanceStatus.CANCELLED]: 'Cancelado',
};

export const MAINTENANCE_STATUS_TEXT_CLASSES: Record<EMaintenanceStatus, string> = {
    [EMaintenanceStatus.IN_PROGRESS]: 'text-amber-600',
    [EMaintenanceStatus.COMPLETED]: 'text-emerald-600',
    [EMaintenanceStatus.CANCELLED]: 'text-gray-500',
};
