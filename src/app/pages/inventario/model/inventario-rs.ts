
export class InventarioRs {
  idInventario!: number;
  idSucursal!: number;
  idProducto!: number;
  sucursalNombre!: string;
   productNombre!: string; 
  stock!: number;

  constructor(init?: Partial<InventarioRs>) {
    Object.assign(this, init);
  }
}