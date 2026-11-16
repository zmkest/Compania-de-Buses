// 135 -> "2 h 15 min"; 45 -> "45 min"; 120 -> "2 h".
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) {
        return `${rest} min`;
    }
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
