import { HttpErrorResponse } from "@angular/common/http";

export interface AppError {
    status: number;
    message: string;
    code?: string;
    fieldErrors?: string[];
}

export function toAppError(err: HttpErrorResponse): AppError {
    const body = err.error;

    const defaults: Record<number, string> = {
        0: 'No se pudo conectar con el servidor. Revisa tu conexión.',
        400: 'La solicitud no es válida.',
        401: 'Tu sesión expiró. Inicia sesión nuevamente.',
        403: 'No tienes permisos para realizar esta acción.',
        404: 'No encontramos lo que buscas.',
        409: 'Hay un conflicto con el estado actual del recurso.',
        422: 'Revisa los datos ingresados.',
        429: 'Demasiadas solicitudes. Intenta en unos momentos.',
        500: 'Ocurrió un error en el servidor. Intenta más tarde.',
        503: 'El servicio no está disponible temporalmente.',
    };

    let fieldErrors: string[] | undefined;
    let message = defaults[err.status] ?? 'Ocurrió un error inesperado.';

    if (err.status > 0 && err.status < 500) {
        if (Array.isArray(body?.message)) {
            fieldErrors = [];
            for (const msg of body.message as string[]) {
                fieldErrors.push(msg);
            }
        } else if (typeof body?.message === 'string') {
            message = body.message;
        }
    }
    return { status: err.status, message, fieldErrors }
}