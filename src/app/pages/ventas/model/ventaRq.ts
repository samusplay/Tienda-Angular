import { DetalleVentaRq } from "./detalleVentaRq";

export class VentaRq {
  idSucursal: number;
  idCliente: number;
  idEmpleado: number;
  idProducto: number;
  items: DetalleVentaRq[];   
  total: number;

  constructor(init?: Partial<VentaRq>) {
    this.idSucursal = 0;
    this.idCliente = 0;
    this.idEmpleado = 0;
    this.idProducto = 0;  
    this.total = 0;
    this.items = [];

    Object.assign(this, init);
  }
}
