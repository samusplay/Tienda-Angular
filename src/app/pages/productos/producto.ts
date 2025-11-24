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

import { ProductoRq } from './model/productoRq';
import { ProductoRs } from './model/productoRs';
import { ProductoService } from './services/producto.service';

// importamos sucursales para el combo
import { SucursalRs } from '../sucursal/model/sucursalRs';
import { SucursalService } from '../sucursal/services/sucursal.service';

@Component({
  selector: 'app-productos',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos {
  // ================== MODAL ==================
  modalInstance: Modal | null = null;
  modoFormulario: 'C' | 'E' | '' = '';
  titleModal: string = '';
  titleBoton: string = '';

  // ================== LISTAS ==================
  productoList: ProductoRs[] = [];
  productosFiltrados: ProductoRs[] = [];

  // lista de sucursales para el <select>
  sucursales: SucursalRs[] = [];

  // ================== ESTADO ==================
  isLoading = false;
  selectedProductoId: number | null = null;

  // ================== FILTROS TABLA ==================
  filtros = {
    id: '',
    nombre: '',
    sku: '',
    sucursal: '',
    activo: ''
  };

  // ================== FORMULARIO ==================
  form: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    precio: new FormControl(0),
    sku: new FormControl(''),
    activo: new FormControl(true),
    sucursal: new FormControl(''),
  });

  constructor(
    private readonly productoService: ProductoService,
    private readonly sucursalService: SucursalService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarProductos();
    this.cargarSucursales(); // para llenar el combo al iniciar
  }

  private inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      activo: [true, [Validators.required]],
      sucursal: ['', [Validators.required]] // aquí va el select
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  limpiarFormulario(): void {
    this.form.reset({
      nombre: '',
      precio: 0,
      sku: '',
      activo: true,
      sucursal: ''
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ================== CARGAR SUCURSALES PARA EL SELECT ==================

  private cargarSucursales(): void {
    this.sucursalService.ListarSucursales().subscribe({
      next: (data: SucursalRs[]) => {
        // puedes filtrar solo activas si quieres
        this.sucursales = data.filter(s => s.activo);
      },
      error: (err) => {
        console.error('Error al cargar sucursales para el combo', err);
      }
    });
  }

  // ================== LISTAR PRODUCTOS ==================

  listarProductos(): void {
    console.log('Cargando productos...');
    this.isLoading = true;

    this.productoService.ListarProductos().subscribe({
      next: (data: ProductoRs[]) => {
        this.productoList = data;
        this.productosFiltrados = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar productos', err);
      }
    });
  }

  // ================== CREAR ==================

  guardarProducto(): void {
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
    const productoData: ProductoRq = new ProductoRq({
      nombre: formValue.nombre,
      precio: formValue.precio,
      sku: formValue.sku,
      activo: formValue.activo,
      sucursal: formValue.sucursal
    });

    this.productoService.crearProducto(productoData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Producto registrado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarProductos();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el producto',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al crear producto', err);
      }
    });
  }

  // ================== ACTUALIZAR ==================

  actualizarProducto(): void {
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

    if (this.selectedProductoId == null) {
      console.error('No hay producto seleccionado para actualizar');
      return;
    }

    this.isLoading = true;

    const body: ProductoRq = new ProductoRq({
      nombre: this.form.value.nombre,
      precio: this.form.value.precio,
      sku: this.form.value.sku,
      activo: this.form.value.activo,
      sucursal: this.form.value.sucursal
    });

    this.productoService.ActualizarProducto(this.selectedProductoId, body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Éxito',
          text: 'Producto actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarProductos();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el producto',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al actualizar producto', err);
      }
    });
  }

  // ================== MODAL ==================

  abrirNuevoProducto(): void {
    this.limpiarFormulario();
    this.selectedProductoId = null;
    this.openModal('C');
  }

  abrirEditarProducto(producto: ProductoRs): void {
    this.limpiarFormulario();
    this.modoFormulario = 'E';
    this.selectedProductoId = producto.id;

    this.form.patchValue({
      nombre: producto.nombre,
      precio: producto.precio,
      sku: producto.sku,
      activo: producto.activo,
      // aquí dependes de si en el Rs te devuelves la sucursal,
      // si no, el usuario deberá seleccionarla de nuevo
      sucursal: (producto as any).sucursal ?? ''
    });

    this.openModal('E');
  }

  openModal(modo: 'C' | 'E'): void {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Nuevo producto' : 'Editar producto';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';

    if (!this.modalInstance) {
      const modalElement = document.getElementById('modalProducto');
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

  trackById(index: number, item: ProductoRs): number {
    return item.id;
  }

  aplicarFiltros(): void {
    const { id, nombre, sku } = this.filtros;

    this.productosFiltrados = this.productoList.filter(prod => {
      const matchId = id ? prod.id.toString().includes(id) : true;
      const matchNombre = nombre
        ? prod.nombre.toLowerCase().includes(nombre.toLowerCase())
        : true;
      const matchSku = sku
        ? prod.sku?.toLowerCase().includes(sku.toLowerCase())
        : true;

      return matchId && matchNombre && matchSku;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      id: '',
      nombre: '',
      sku: '',
      sucursal: '',
      activo: ''
    };
    this.productosFiltrados = [...this.productoList];
  }

  // ================== SUBMIT ==================

  onSubmit(): void {
    if (this.modoFormulario === 'C') {
      this.guardarProducto();
    } else if (this.modoFormulario === 'E') {
      this.actualizarProducto();
    }
  }

}
