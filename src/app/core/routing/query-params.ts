// Transformaciones para inputs enlazados a query params (withComponentInputBinding).
// Un query param ausente llega como undefined y uno manipulado puede traer cualquier texto.

export function toPage(value: string | number | undefined): number {
    const page = Math.trunc(Number(value));
    return Number.isFinite(page) && page >= 1 ? page : 1;
}

// Devuelve el valor solo si pertenece al conjunto permitido (ej. Object.values de un enum).
export function toOneOf<T extends string>(allowed: readonly T[]) {
    return (value: string | undefined): T | null =>
        allowed.includes(value as T) ? value as T : null;
}

export function toSearch(value: string | undefined): string {
    return value?.trim() ?? '';
}
