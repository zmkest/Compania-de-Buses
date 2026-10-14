import { Bus } from "./Buses";
import { Tripulacion } from "./Tripulacion";

export class Viaje {
    codigo: number;
    origen: string;
    destino: string;
    hora: string;
    fecha: Date;
    bus: Bus;
    tripulacion: Tripulacion;
    estado: string;
    constructor(codigo: number, origen: string, destino: string, hora: string, fecha: Date, bus: Bus, tripulacion: Tripulacion, estado: string) {
        this.codigo = codigo;
        this.origen = origen;
        this.destino = destino;
        this.hora = hora;
        this.fecha = fecha;
        this.bus = bus;
        this.tripulacion = tripulacion;
        this.estado = estado;
    }
}