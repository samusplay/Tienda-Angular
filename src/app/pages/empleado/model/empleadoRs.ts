
export class EmpleadoRs {
  id!: number;
  primerNombre!: string;
  segundoNombre?: string;
  apellidoPaterno!: string;
  apellidoMaterno?: string;
  cargo!: string;
  sucursalNombre!: string;  // 👈 viene como nombre desde el backend
  email!: string;
  activo!: boolean;
  createdAt!: string;       // LocalDateTime -> string en Angular

  constructor(init?: Partial<EmpleadoRs>) {
    Object.assign(this, init);
  }
}
