
export class VentaRs {
  id: number;
  fecha: string;            // viene como LocalDateTime → string (ej: "2025-11-24T21:30:00")
  sucursalNombre: string;
  clienteNombre: string;
  empleadoNombre: string;
  total: number;

  constructor(init?: Partial<VentaRs>) {
    this.id = 0;
    this.fecha = '';
    this.sucursalNombre = '';
    this.clienteNombre = '';
    this.empleadoNombre = '';
    this.total = 0;

    Object.assign(this, init);
  }

  // opcional: helper para convertir fecha a Date
  get fechaDate(): Date | null {
    return this.fecha ? new Date(this.fecha) : null;
  }
}