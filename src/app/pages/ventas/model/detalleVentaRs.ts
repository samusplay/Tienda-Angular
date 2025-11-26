
export class DetalleVentaRs {
  idDetalle: number;
  idProducto: number;
  productoNombre: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;

  constructor(init?: Partial<DetalleVentaRs>) {
    this.idDetalle = 0;
    this.idProducto = 0;
    this.productoNombre = '';
    this.cantidad = 0;
    this.precioUnit = 0;
    this.subtotal = 0;

    Object.assign(this, init);
  }
}
