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

import { InventarioRq } from './model/inventario-rq';
import { InventarioRs } from './model/inventario-rs';
import { InventarioActualizarRq } from './model/inventario-actualizar-rq';
import { InventarioService } from './services/inventario.service';

// combos
import { SucursalRs } from '../sucursal/model/sucursalRs';
import { SucursalService } from '../sucursal/services/sucursal.service';

import { ProductoRs } from '../productos/model/productoRs';
import { ProductoService } from '../productos/services/producto.service';
@Component({
  selector: 'app-inventario',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss'
})
export class Inventario {
   // ================== MODAL ==================
  modalInstance: Modal | null = null;
  modoFormulario: 'C' | 'E' | '' = '';
  titleModal = '';
  titleBoton = '';

  // ================== LISTAS ==================
  inventarioList: InventarioRs[] = [];
  inventariosFiltrados: InventarioRs[] = [];

  sucursales: SucursalRs[] = [];
  productos:    ProductoRs[] = [];

  // ================== ESTADO ==================
  isLoading = false;
  selectedInventarioId: number | null = null;

  // ================== FILTROS TABLA ==================
  filtros = {
    id: '',
    sucursal: '',
    producto: ''
  };

  // ================== FORMULARIO ==================
  form: FormGroup = new FormGroup({
    idSucursal: new FormControl<number | null>(null),
    idProducto: new FormControl<number | null>(null),
    stock:      new FormControl<number | null>(null)
  });

  constructor(
    private readonly inventarioService: InventarioService,
    private readonly sucursalService: SucursalService,
    private readonly productoService: ProductoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarInventario();
    this.cargarSucursales();
    this.cargarProductos();
  }

  // ================== FORM ==================

  private inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      idSucursal: [null, [Validators.required]],
      idProducto: [null, [Validators.required]],
      stock:      [0,   [Validators.required, Validators.min(0)]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  limpiarFormulario(): void {
    this.form.reset({
      idSucursal: null,
      idProducto: null,
      stock: 0
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

  private cargarProductos(): void {
    this.productoService.ListarProductos().subscribe({
      next: (data: ProductoRs[]) => {
        this.productos = data.filter(p => p.activo);
      },
      error: err => {
        console.error('Error al cargar productos', err);
      }
    });
  }

  // ================== LISTAR INVENTARIO ==================

  listarInventario(): void {
    console.log('Cargando inventario...');
    this.isLoading = true;

    this.inventarioService.ListarInventario().subscribe({
      next: (data: InventarioRs[]) => {
        this.inventarioList = data;
        this.inventariosFiltrados = [...data];
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        console.error('Error al cargar inventario', err);
      }
    });
  }

  // ================== CREAR ==================

  guardarInventario(): void {
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
    const body: InventarioRq = new InventarioRq({
      idSucursal: formValue.idSucursal!,
      idProducto: formValue.idProducto!,
      stock:      formValue.stock!
    });

    this.inventarioService.CrearInventario(body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Inventario registrado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarInventario();
      },
      error: err => {
        this.isLoading = false;

        const msgBackend = err?.error?.message as string | undefined;

        Swal.fire({
          title: 'Error',
          text: msgBackend || 'No se pudo registrar el inventario',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });

        console.error('Error al crear inventario', err);
      }
    });
  }

  // ================== ACTUALIZAR ==================

  actualizarInventario(): void {
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

    if (this.selectedInventarioId == null) {
      console.error('No hay inventario seleccionado para actualizar');
      return;
    }

    this.isLoading = true;

    const formValue = this.form.value;
    const body: InventarioActualizarRq = new InventarioActualizarRq({
      idInventario: this.selectedInventarioId,
      idSucursal:   formValue.idSucursal!,
      idProducto:   formValue.idProducto!,
      stock:        formValue.stock!
    });

    this.inventarioService.ActualizarInventario(body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Éxito',
          text: 'Inventario actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarInventario();
      },
      error: err => {
        this.isLoading = false;

        const msgBackend = err?.error?.message as string | undefined;

        Swal.fire({
          title: 'Error',
          text: msgBackend || 'No se pudo actualizar el inventario',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });

        console.error('Error al actualizar inventario', err);
      }
    });
  }

  // ================== MODAL ==================

  abrirNuevoInventario(): void {
    this.limpiarFormulario();
    this.selectedInventarioId = null;
    this.openModal('C');
  }

  abrirEditarInventario(item: InventarioRs): void {
    this.limpiarFormulario();
    this.modoFormulario = 'E';
    this.selectedInventarioId = item.idInventario;

    this.form.patchValue({
      idSucursal: item.idSucursal,
      idProducto: item.idProducto,
      stock: item.stock
    });

    this.openModal('E');
  }

  openModal(modo: 'C' | 'E'): void {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Nuevo inventario' : 'Editar inventario';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';

    if (!this.modalInstance) {
      const modalElement = document.getElementById('modalInventario');
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

  trackById(index: number, item: InventarioRs): number {
    return item.idInventario;
  }

  aplicarFiltros(): void {
    const { id, sucursal, producto } = this.filtros;

    this.inventariosFiltrados = this.inventarioList.filter(v => {
      const matchId = id ? v.idInventario.toString().includes(id) : true;
      const matchSucursal = sucursal
        ? v.sucursalNombre.toLowerCase().includes(sucursal.toLowerCase())
        : true;
      const matchProducto = producto
        ? v.productNombre.toLowerCase().includes(producto.toLowerCase())
        : true;

      return matchId && matchSucursal && matchProducto;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      id: '',
      sucursal: '',
      producto: ''
    };
    this.inventariosFiltrados = [...this.inventarioList];
  }

  // ================== SUBMIT ==================

  onSubmit(): void {
    if (this.modoFormulario === 'C') {
      this.guardarInventario();
    } else if (this.modoFormulario === 'E') {
      this.actualizarInventario();
    }
  }

}
