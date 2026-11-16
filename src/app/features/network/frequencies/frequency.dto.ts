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

export const WEEKDAY_LABELS: Record<EWeekday, string> = {
    [EWeekday.MONDAY]: 'Lunes',
    [EWeekday.TUESDAY]: 'Martes',
    [EWeekday.WEDNESDAY]: 'Miércoles',
    [EWeekday.THURSDAY]: 'Jueves',
    [EWeekday.FRIDAY]: 'Viernes',
    [EWeekday.SATURDAY]: 'Sábado',
    [EWeekday.SUNDAY]: 'Domingo',
};

export interface Frequency {
    id: number;
    routeId: number;
    departureTime: string;
    weekdays: EWeekday[];
    basePrice: string;
    isActive: boolean;
}

export interface FrequencyResponse extends Frequency {
    route: {
        id: number;
        origin: Pick<TerminalDetail, 'id' | 'name' | 'city'>;
        destination: Pick<TerminalDetail, 'id' | 'name' | 'city'>;
    };
}

export interface FrequencyDetail extends Frequency {
    route: FrequencyResponse['route'] & { distanceKm: number; durationMinutes: number };
    _count: { trips: number };
}

export interface DeletedFrequency extends Frequency {
    detachedTrips: number;
}

export interface CreateFrequencyDto {
    routeId: number;
    departureTime: string;
    weekdays: EWeekday[];
    basePrice: number;
}

export type UpdateFrequencyDto = Partial<Omit<CreateFrequencyDto, 'routeId'>>;
