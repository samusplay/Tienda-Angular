
export class ProductoRs {
  id!: number;
  nombre!: string;
  precio!: number;
  sku!: string;
  activo!: boolean;
  createdAt!: string;
  sucursal?: string;  // 👈 opcional, por si el backend aún no lo envía

  constructor(init?: Partial<ProductoRs>) {
    Object.assign(this, init);
  }
}


