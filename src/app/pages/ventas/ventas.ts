import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
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

// combos
import { SucursalRs } from '../sucursal/model/sucursalRs';
import { SucursalService } from '../sucursal/services/sucursal.service';

import { ClienteRs } from '../cliente/model/clienteRs';
import { ClienteService } from '../cliente/services/cliente.service';

import { EmpleadoRs } from '../empleado/model/empleadoRs';
import { EmpleadoService } from '../empleado/services/empleado.service';

@Component({
  selector: 'app-ventas',
  standalone:true,
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
  form: FormGroup = new FormGroup({
    idSucursal: new FormControl<number | null>(null),
    idCliente: new FormControl<number | null>(null),
    idEmpleado: new FormControl<number | null>(null),
    total: new FormControl<number | null>(null)
  });

  constructor(
    private readonly ventaService: VentaService,
    private readonly sucursalService: SucursalService,
    private readonly clienteService: ClienteService,
    private readonly empleadoService: EmpleadoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarVentas();
    this.cargarSucursales();
    this.cargarClientes();
    this.cargarEmpleados();
  }

  // ================== FORM ==================

  private inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      idSucursal: [null, [Validators.required]],
      idCliente: [null, [Validators.required]],
      idEmpleado: [null, [Validators.required]],
      total: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  limpiarFormulario(): void {
    this.form.reset({
      idSucursal: null,
      idCliente: null,
      idEmpleado: null,
      total: 0
    });
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

    const formValue = this.form.value;
    const body: VentaRq = new VentaRq({
      idSucursal: formValue.idSucursal!,
      idCliente: formValue.idCliente!,
      idEmpleado: formValue.idEmpleado!,
      total: formValue.total!
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

    const formValue = this.form.value;
    const body: VentaActualizarRq = new VentaActualizarRq({
      idSucursal: formValue.idSucursal!,
      idCliente: formValue.idCliente!,
      idEmpleado: formValue.idEmpleado!,
      total: formValue.total!
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

  // buscar sucursal por nombre
  const sucursal = this.sucursales.find(
    s => s.nombre.toLowerCase() === venta.sucursalNombre.toLowerCase()
  );

  // buscar cliente por nombre completo
  const cliente = this.clientes.find(c => {
    const nombreCompletoCliente = `${c.nombre} ${c.apellidoPaterno ?? ''} ${c.apellidoMaterno ?? ''}`
      .trim()
      .toLowerCase();

    return nombreCompletoCliente === venta.clienteNombre.toLowerCase();
  });

  // buscar empleado por nombre completo
  const empleado = this.empleados.find(e => {
    const nombreCompletoEmpleado = `${e.primerNombre} ${e.apellidoPaterno ?? ''} ${e.apellidoMaterno ?? ''}`
      .trim()
      .toLowerCase();

    return nombreCompletoEmpleado === venta.empleadoNombre.toLowerCase();
  });

  this.form.patchValue({
    idSucursal: sucursal?.id ?? null,
    idCliente: cliente?.id ?? null,
    idEmpleado: empleado?.id ?? null,
    total: venta.total
  });

  this.openModal('E');
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
