
// src/app/pages/ventas/model/ventaActualizarRq.ts
export class VentaActualizarRq {
  idSucursal: number;
  idCliente: number;
  idEmpleado: number;
  total: number;

  constructor(init?: Partial<VentaActualizarRq>) {
    this.idSucursal = 0;
    this.idCliente = 0;
    this.idEmpleado = 0;
    this.total = 0;

    Object.assign(this, init);
  }
}
