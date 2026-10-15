// Transformaciones para inputs enlazados a query params (withComponentInputBinding).
// Un query param ausente llega como undefined y uno manipulado puede traer cualquier texto.

export function toPage(value: string | number | undefined): number {
    const page = Math.trunc(Number(value));
    return Number.isFinite(page) && page >= 1 ? page : 1;
}

export function toSearch(value: string | undefined): string {
    return value?.trim() ?? '';
}
