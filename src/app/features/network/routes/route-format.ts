// 135 -> "2 h 15 min"; 45 -> "45 min"; 120 -> "2 h".
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) {
        return `${rest} min`;
    }
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

// "1970-01-01T08:30:00.000Z" -> "08:30". La hora se guarda sin zona, así que se lee tal cual (UTC).
export function formatDepartureTime(value: string): string {
    return value.slice(11, 16);
}
