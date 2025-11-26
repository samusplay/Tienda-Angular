import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { VentaRq } from './model/ventaRq';
import { VentaActualizarRq } from './model/ventaActualizarRq';
import { VentaRs } from './model/ventaRs';
import { VentaService } from './services/venta.service';

import { DetalleVentaRq } from './model/detalleVentaRq';
import { DetalleVentaRs } from './model/detalleVentaRs';

// combos
import { SucursalRs } from '../sucursal/model/sucursalRs';
import { SucursalService } from '../sucursal/services/sucursal.service';

import { ClienteRs } from '../cliente/model/clienteRs';
import { ClienteService } from '../cliente/services/cliente.service';

import { EmpleadoRs } from '../empleado/model/empleadoRs';
import { EmpleadoService } from '../empleado/services/empleado.service';

import { ProductoRs } from '../productos/model/productoRs';
import { ProductoService } from '../productos/services/producto.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss'
})
export class Ventas {
  // ================== MODAL ==================
  modalInstance: Modal | null = null;
  modoFormulario: 'C' | 'E' | '' = '';
  titleModal = '';
  titleBoton = '';

  // ================== LISTAS ==================
  ventaList: VentaRs[] = [];
  ventasFiltradas: VentaRs[] = [];

  sucursales: SucursalRs[] = [];
  clientes: ClienteRs[] = [];
  empleados: EmpleadoRs[] = [];

  // lista de productos para el combo
  productos: ProductoRs[] = [];

  // ================== ESTADO ==================
  isLoading = false;
  selectedVentaId: number | null = null;

  // ================== FILTROS TABLA ==================
  filtros = {
    id: '',
    sucursal: '',
    cliente: '',
    empleado: ''
  };

  // ================== FORMULARIO ==================
  form: FormGroup = new FormGroup({});

  constructor(
    private readonly ventaService: VentaService,
    private readonly sucursalService: SucursalService,
    private readonly clienteService: ClienteService,
    private readonly empleadoService: EmpleadoService,
    private readonly productoService: ProductoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarVentas();
    this.cargarSucursales();
    this.cargarClientes();
    this.cargarEmpleados();
    this.cargarProductos();
  }

  // ================== GETTERS ==================

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  // Total calculado en base a los items (para mostrar en el HTML)
  get totalCalculado(): number {
    return this.items.controls.reduce((acc, ctrl) => {
      const cantidad = Number(ctrl.get('cantidad')?.value ?? 0);
      const precio = Number(ctrl.get('precioUnit')?.value ?? 0);
      return acc + cantidad * precio;
    }, 0);
  }

  // ================== FORM / DETALLE ==================

  private inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      idSucursal: [null, [Validators.required]],
      idCliente: [null, [Validators.required]],
      idEmpleado: [null, [Validators.required]],
      items: this.formBuilder.array([], [Validators.required])
    });

    // al menos una línea de detalle
    this.agregarItem();
  }

  private crearItemDetalle(init?: Partial<DetalleVentaRq>): FormGroup {
    return this.formBuilder.group({
      idProducto: [init?.idProducto ?? null, [Validators.required]],
      cantidad: [init?.cantidad ?? 1, [Validators.required, Validators.min(1)]],
      precioUnit: [init?.precioUnit ?? 0, [Validators.required, Validators.min(0.01)]]
    });
  }

  agregarItem(): void {
    this.items.push(this.crearItemDetalle());
  }

  eliminarItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  limpiarFormulario(): void {
    this.form.reset({
      idSucursal: null,
      idCliente: null,
      idEmpleado: null
    });

    // limpiar ítems
    while (this.items.length > 0) {
      this.items.removeAt(0);
    }
    this.agregarItem();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ================== CARGAR COMBOS ==================

  private cargarSucursales(): void {
    this.sucursalService.ListarSucursales().subscribe({
      next: (data: SucursalRs[]) => {
        this.sucursales = data.filter(s => s.activo);
      },
      error: err => {
        console.error('Error al cargar sucursales', err);
      }
    });
  }

  private cargarClientes(): void {
    this.clienteService.ListarClientes().subscribe({
      next: (data: ClienteRs[]) => {
        this.clientes = data;
      },
      error: err => {
        console.error('Error al cargar clientes', err);
      }
    });
  }

  private cargarEmpleados(): void {
    this.empleadoService.ListarEmpleados().subscribe({
      next: (data: EmpleadoRs[]) => {
        this.empleados = data;
      },
      error: err => {
        console.error('Error al cargar empleados', err);
      }
    });
  }

  private cargarProductos(): void {
    this.productoService.ListarProductos().subscribe({
      next: (data: ProductoRs[]) => {
        this.productos = data;
      },
      error: err => {
        console.error('Error al cargar productos', err);
      }
    });
  }

  // ================== LISTAR VENTAS ==================

  listarVentas(): void {
    console.log('Cargando ventas...');
    this.isLoading = true;

    this.ventaService.ListarVentas().subscribe({
      next: (data: VentaRs[]) => {
        this.ventaList = data;
        this.ventasFiltradas = [...data];
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        console.error('Error al cargar ventas', err);
      }
    });
  }

  // ================== CREAR ==================

  guardarVenta(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.isLoading = true;

    const formValue = this.form.getRawValue();

    const items: DetalleVentaRq[] = (formValue.items ?? []).map((it: any) => ({
      idProducto: it.idProducto,
      cantidad: it.cantidad,
      precioUnit: it.precioUnit
    }));

    const body: VentaRq = new VentaRq({
      idSucursal: formValue.idSucursal!,
      idCliente: formValue.idCliente!,
      idEmpleado: formValue.idEmpleado!,
      items
    });

    this.ventaService.CrearVenta(body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Venta registrada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarVentas();
      },
      error: err => {
        this.isLoading = false;

        const msgBackend = err?.error?.message as string | undefined;

        Swal.fire({
          title: 'Error',
          text: msgBackend || 'No se pudo registrar la venta',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });

        console.error('Error al crear venta', err);
      }
    });
  }

  // ================== ACTUALIZAR ==================

  actualizarVenta(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (this.selectedVentaId == null) {
      console.error('No hay venta seleccionada para actualizar');
      return;
    }

    this.isLoading = true;

    const formValue = this.form.getRawValue();

    const items: DetalleVentaRq[] = (formValue.items ?? []).map((it: any) => ({
      idProducto: it.idProducto,
      cantidad: it.cantidad,
      precioUnit: it.precioUnit
    }));

    const body: VentaActualizarRq = new VentaActualizarRq({
      idSucursal: formValue.idSucursal!,
      idCliente: formValue.idCliente!,
      idEmpleado: formValue.idEmpleado!,
      items
    });

    this.ventaService.ActualizarVenta(this.selectedVentaId, body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Éxito',
          text: 'Venta actualizada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarVentas();
      },
      error: err => {
        this.isLoading = false;

        const msgBackend = err?.error?.message as string | undefined;

        Swal.fire({
          title: 'Error',
          text: msgBackend || 'No se pudo actualizar la venta',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });

        console.error('Error al actualizar venta', err);
      }
    });
  }

  // ================== MODAL ==================

  abrirNuevaVenta(): void {
    this.limpiarFormulario();
    this.selectedVentaId = null;
    this.openModal('C');
  }

  abrirEditarVenta(venta: VentaRs): void {
    this.limpiarFormulario();
    this.modoFormulario = 'E';
    this.selectedVentaId = venta.id;

    // --- cabecera ---
    const sucursal = this.sucursales.find(
      s => s.nombre.toLowerCase() === venta.sucursalNombre.toLowerCase()
    );

    const cliente = this.clientes.find(c => {
      const nombreCompletoCliente = `${c.nombre} ${c.apellidoPaterno ?? ''} ${c.apellidoMaterno ?? ''}`
        .trim()
        .toLowerCase();
      return nombreCompletoCliente === venta.clienteNombre.toLowerCase();
    });

    const empleado = this.empleados.find(e => {
      const nombreCompletoEmpleado = `${e.primerNombre} ${e.apellidoPaterno ?? ''} ${e.apellidoMaterno ?? ''}`
        .trim()
        .toLowerCase();
      return nombreCompletoEmpleado === venta.empleadoNombre.toLowerCase();
    });

    this.form.patchValue({
      idSucursal: sucursal?.id ?? null,
      idCliente: cliente?.id ?? null,
      idEmpleado: empleado?.id ?? null
    });

    // --- detalles: llamamos al backend para traer los productos de la venta ---
    this.ventaService.ListarDetallePorVenta(venta.id).subscribe({
      next: (detalles: DetalleVentaRs[]) => {
        while (this.items.length > 0) {
          this.items.removeAt(0);
        }

        if (detalles.length === 0) {
          this.agregarItem();
        } else {
          detalles.forEach(d => {
            const detalleInit: DetalleVentaRq = {
              idProducto: d.idProducto,
              cantidad: d.cantidad,
              precioUnit: d.precioUnit
            };
            this.items.push(this.crearItemDetalle(detalleInit));
          });
        }

        this.openModal('E');
      },
      error: err => {
        console.error('Error al cargar detalles de la venta', err);
        // al menos una línea vacía para que el usuario pueda corregir
        this.agregarItem();
        this.openModal('E');
      }
    });
  }

  openModal(modo: 'C' | 'E'): void {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Nueva venta' : 'Editar venta';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';

    if (!this.modalInstance) {
      const modalElement = document.getElementById('modalVenta');
      if (modalElement) {
        this.modalInstance = new Modal(modalElement);
      }
    }

    this.modalInstance?.show();
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.isLoading = false;
  }

  // ================== TABLA / FILTROS ==================

  trackById(index: number, item: VentaRs): number {
    return item.id;
  }

  aplicarFiltros(): void {
    const { id, sucursal, cliente, empleado } = this.filtros;

    this.ventasFiltradas = this.ventaList.filter(v => {
      const matchId = id ? v.id.toString().includes(id) : true;
      const matchSucursal = sucursal
        ? v.sucursalNombre.toLowerCase().includes(sucursal.toLowerCase())
        : true;
      const matchCliente = cliente
        ? v.clienteNombre.toLowerCase().includes(cliente.toLowerCase())
        : true;
      const matchEmpleado = empleado
        ? v.empleadoNombre.toLowerCase().includes(empleado.toLowerCase())
        : true;

      return matchId && matchSucursal && matchCliente && matchEmpleado;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      id: '',
      sucursal: '',
      cliente: '',
      empleado: ''
    };
    this.ventasFiltradas = [...this.ventaList];
  }

  // ================== SUBMIT ==================

  onSubmit(): void {
    if (this.modoFormulario === 'C') {
      this.guardarVenta();
    } else if (this.modoFormulario === 'E') {
      this.actualizarVenta();
    }
  }
}
