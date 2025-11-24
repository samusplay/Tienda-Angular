
export class InventarioActualizarRq {
  idInventario!: number;
  idSucursal!: number;
  idProducto!: number;
  stock!: number;

  constructor(init?: Partial<InventarioActualizarRq>) {
    Object.assign(this, init);
  }
}