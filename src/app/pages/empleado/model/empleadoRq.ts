
export class EmpleadoRq {
  primerNombre!: string;
  segundoNombre?: string;   // opcional
  apellidoPaterno!: string;
  apellidoMaterno?: string;
  cargo!: string;
  idSucursal!: number;      // 👈 en el Rq va el ID de la sucursal
  email!: string;
  activo!: boolean;

  constructor(init?: Partial<EmpleadoRq>) {
    Object.assign(this, init);
  }
}
