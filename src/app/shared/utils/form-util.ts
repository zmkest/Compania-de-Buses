/**
 * Compara dos objetos con iguales atributos y retorna un nuevo objecto solo con los
 * atributos con su valor modificado
 * @param original 
 * @param modificado 
 * @returns 
 */
export function obtenerCamposModificados<T extends Object>(original: T, modificado: T): Partial<T> {
    const cambios: Partial<T> = {};

    for (let llave in modificado) {
        if (Object.prototype.hasOwnProperty.call(modificado, llave)) {
            if (modificado[llave] !== original[llave]) {
                cambios[llave] = modificado[llave];
            }
        }
    }

    return cambios;
}