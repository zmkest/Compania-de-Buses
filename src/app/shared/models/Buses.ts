export class Bus {
    codigo: number;
    placa: string;
    tipo: string;
    estado: string;
    num_viajes: number;
    constructor(codigo: number, placa: string, tipo: string, estado: string, num_viajes: number) {
        this.codigo = codigo;
        this.placa = placa;
        this.tipo = tipo;
        this.estado = estado;
        this.num_viajes = num_viajes;
    }
}