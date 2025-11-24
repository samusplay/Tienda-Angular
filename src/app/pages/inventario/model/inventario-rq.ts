
export class InventarioRq {
  idSucursal!: number;
  idProducto!: number;
  stock!: number;

  constructor(init?: Partial<InventarioRq>) {
    Object.assign(this, init);
  }
}