import { Chofer } from "./Chofer";

export class Tripulacion {
    codigo: number;
    personas: number;
    choferes: Chofer[];
    constructor(codigo: number, personas: number, choferes: Chofer[]) {
        this.codigo = codigo;
        this.personas = personas;
        this.choferes = choferes;
    }
}