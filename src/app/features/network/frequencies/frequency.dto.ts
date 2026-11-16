export enum EWeekday {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export const WEEKDAYS = Object.values(EWeekday);

export const WEEKDAY_SHORT_LABELS: Record<EWeekday, string> = {
    [EWeekday.MONDAY]: 'Lun',
    [EWeekday.TUESDAY]: 'Mar',
    [EWeekday.WEDNESDAY]: 'Mié',
    [EWeekday.THURSDAY]: 'Jue',
    [EWeekday.FRIDAY]: 'Vie',
    [EWeekday.SATURDAY]: 'Sáb',
    [EWeekday.SUNDAY]: 'Dom',
};

export interface Frequency {
    id: number;
    routeId: number;
    departureTime: string;
    weekdays: EWeekday[];
    basePrice: string;
    isActive: boolean;
}

export interface CreateFrequencyDto {
    routeId: number;
    departureTime: string;
    weekdays: EWeekday[];
    basePrice: number;
}
