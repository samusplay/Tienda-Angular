import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ClienteService } from '../cliente/services/cliente.service';
import { EmpleadoService } from '../empleado/services/empleado.service';
import { InventarioService } from '../inventario/services/inventario.service';
import { ProductoService } from '../productos/services/producto.service';
import { SucursalService } from '../sucursal/services/sucursal.service';
import { VentaRs } from '../ventas/model/ventaRs';
import { VentaService } from '../ventas/services/venta.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class Inicio implements OnInit {
  isLoading = false;
  errorMsg: string | null = null;
  fechaHoy: Date = new Date();

  totales = {
    sucursales: 0,
    empleados: 0,
    clientes: 0,
    productos: 0,
    ventas: 0,
    inventario: 0,
  };

  ultimasVentas: VentaRs[] = [];

  constructor(
    private readonly sucursalService: SucursalService,
    private readonly empleadoService: EmpleadoService,
    private readonly clienteService: ClienteService,
    private readonly productoService: ProductoService,
    private readonly ventaService: VentaService,
    private readonly inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  private cargarDashboard(): void {
    this.isLoading = true;
    this.errorMsg = null;

    forkJoin({
      sucursales: this.sucursalService.ListarSucursales(),
      empleados: this.empleadoService.ListarEmpleados(),
      clientes: this.clienteService.ListarClientes(),
      productos: this.productoService.ListarProductos(),
      ventas: this.ventaService.ListarVentas(),
      inventario: this.inventarioService.ListarInventario(), // sin filtro de sucursal
    }).subscribe({
      next: (resp) => {
        this.totales.sucursales = resp.sucursales.length;
        this.totales.empleados = resp.empleados.length;
        this.totales.clientes = resp.clientes.length;
        this.totales.productos = resp.productos.length;
        this.totales.ventas = resp.ventas.length;
        this.totales.inventario = resp.inventario.length;

        // Tomamos las 5 ventas más recientes (suponiendo que vienen ordenadas por fecha asc/desc)
        this.ultimasVentas = [...resp.ventas]
          .sort((a, b) => {
            const fa = new Date(a.fecha).getTime();
            const fb = new Date(b.fecha).getTime();
            return fb - fa;
          })
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar dashboard', err);
        this.errorMsg = 'No se pudo cargar el resumen inicial.';
        this.isLoading = false;
      },
    });
  }
}