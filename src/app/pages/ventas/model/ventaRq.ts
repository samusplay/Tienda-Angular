
export class VentaRq {
  idSucursal: number;
  idCliente: number;
  idEmpleado: number;
  total: number;

  constructor(init?: Partial<VentaRq>) {
    this.idSucursal = 0;
    this.idCliente = 0;
    this.idEmpleado = 0;
    this.total = 0;

    Object.assign(this, init);
  }
}