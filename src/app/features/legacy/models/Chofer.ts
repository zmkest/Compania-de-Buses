export class Chofer {
    codigo: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento: Date;
    aniosConduccion: number;

    constructor(codigo: number, cedula: string, nombres: string, apellidos: string, fechaNacimiento: Date, aniosConduccion: number) {
        this.codigo = codigo;
        this.cedula = cedula;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.fechaNacimiento = fechaNacimiento;
        this.aniosConduccion = aniosConduccion;
    }
}