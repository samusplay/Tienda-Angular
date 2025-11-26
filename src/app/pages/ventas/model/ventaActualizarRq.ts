import { DetalleVentaRq } from "./detalleVentaRq";

export class VentaActualizarRq {
  idSucursal: number;
  idCliente: number;
  idEmpleado: number;
  items: DetalleVentaRq[];

  constructor(init?: Partial<VentaActualizarRq>) {
    this.idSucursal = 0;
    this.idCliente = 0;
    this.idEmpleado = 0;
    this.items = [];

    Object.assign(this, init);
  }
}
