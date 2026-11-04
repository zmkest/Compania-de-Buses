// Formato que espera <input type="datetime-local"> (hora local, sin segundos).
export function toDateTimeLocal(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Formato que espera <input type="date"> (YYYY-MM-DD en hora local).
export function toDateInput(date: Date): string {
    return toDateTimeLocal(date).slice(0, 10);
}

// Instante en que empieza en hora local un día YYYY-MM-DD.
export function startOfLocalDayIso(day: string): string {
    return new Date(`${day}T00:00:00`).toISOString();
}
