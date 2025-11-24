//Lo que vamos enviar
export class ProductoRq {
  nombre!: string;
  precio!: number;   // BigDecimal en Java -> number en TS
  sku!: string;
  activo!: boolean;
  sucursal!: string; // nombre de la sucursal que se busca en el repo

  constructor(init?: Partial<ProductoRq>) {
    Object.assign(this, init);
  }
}