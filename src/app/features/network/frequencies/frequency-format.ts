export function formatDepartureTime(value: string): string {
    return value.slice(11, 16);
}

export function formatArrivalTime(departureTime: string, durationMinutes: number): string {
    const [hours, minutes] = formatDepartureTime(departureTime).split(':').map(Number);
    const total = hours * 60 + minutes + durationMinutes;
    const days = Math.floor(total / 1440);
    const rest = total % 1440;
    const time = `${String(Math.floor(rest / 60)).padStart(2, '0')}:${String(rest % 60).padStart(2, '0')}`;
    return days ? `${time} (+${days} ${days === 1 ? 'día' : 'días'})` : time;
}
