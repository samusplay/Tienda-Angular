
// src/app/pages/ventas/model/detalleVentaRq.ts
export class DetalleVentaRq {
  idProducto: number;
  cantidad: number;
  precioUnit: number;

  constructor(init?: Partial<DetalleVentaRq>) {
    this.idProducto = 0;
    this.cantidad = 0;
    this.precioUnit = 0;

    Object.assign(this, init);
  }
}
