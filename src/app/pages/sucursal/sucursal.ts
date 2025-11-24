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
import { SucursalRq } from './model/sucursalRq';
import { SucursalRs } from './model/sucursalRs';
import { SucursalService } from './services/sucursal.service';

@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sucursal.html',
  styleUrls: ['./sucursal.scss']
})
//Este mismo nombre debe ir en layout.routes.ts
export class Sucursal {

  // variables para manipular el Modal
  modalInstance: Modal | null = null;
  modoFormulario: 'C' | 'E' | '' = '';
  titleModal: string = '';
  titleBoton: string = '';

  // listado principal y listado filtrado
  clienteList: SucursalRs[] = [];
  clientesFiltrados: SucursalRs[] = [];

  // spinner
  isLoading = false;

  // Id de la Sucursal seleccionada para edición
  selectedSucursalId: number | null = null;

  // filtros de la tabla
  filtros = {
    id: '',
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    activo: ''
  };

  // Formulario reactivo
  form: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    direccion: new FormControl(''),
    ciudad: new FormControl(''),
    telefono: new FormControl(''),
    activo: new FormControl(true),
  });

  constructor(
    private readonly sucursalService: SucursalService, // 👈 nombre en camelCase
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarSucursales();
  }

  // ===================== FORMULARIO =====================

  private inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(150)]],
      ciudad: ['', [Validators.required, Validators.maxLength(80)]],
      telefono: ['', [Validators.required, Validators.maxLength(30)]],
      activo: [true, [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  limpiarFormulario(): void {
    this.form.reset({
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      activo: true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ===================== LISTAR =====================

  listarSucursales(): void {
    console.log('Cargando sucursales...');
    this.isLoading = true;

    this.sucursalService.ListarSucursales().subscribe({
      next: (data: SucursalRs[]) => {
        this.clienteList = data;
        this.clientesFiltrados = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar sucursales', err);
      }
    });
  }

  // ===================== CREAR =====================

  guardarSucursal(): void {
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
    const sucursalData: SucursalRq = {
      nombre: formValue.nombre,
      direccion: formValue.direccion,
      ciudad: formValue.ciudad,
      telefono: formValue.telefono,
      activo: formValue.activo,
    };

    this.sucursalService.CrearSucursal(sucursalData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Sucursal registrada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarSucursales();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar la Sucursal',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al crear Sucursal', err);
      }
    });
  }

  // ===================== ACTUALIZAR =====================

  actualizarSucursal(): void {
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

    if (this.selectedSucursalId == null) {
      console.error('No hay Sucursal seleccionada para actualizar');
      return;
    }

    this.isLoading = true;

    const body: SucursalRq = {
      nombre: this.form.value.nombre,
      direccion: this.form.value.direccion,
      ciudad: this.form.value.ciudad,
      telefono: this.form.value.telefono,
      activo: this.form.value.activo,
    };

    this.sucursalService.ActualizarSucursal(this.selectedSucursalId, body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Éxito',
          text: 'Sucursal actualizada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarSucursales();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar la Sucursal',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al actualizar la Sucursal', err);
      }
    });
  }

  // ===================== MODAL =====================

  abrirNuevaSucursal(): void {
    this.limpiarFormulario();
    this.selectedSucursalId = null;
    this.openModal('C');
  }

  abrirEditarSucursal(sucursal: SucursalRs): void {
    this.limpiarFormulario();
    this.modoFormulario = 'E';
    this.selectedSucursalId = sucursal.id;

    this.form.patchValue({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      ciudad: sucursal.ciudad,
      telefono: sucursal.telefono,
      activo: sucursal.activo
    });

    this.openModal('E');
  }

  openModal(modo: 'C' | 'E'): void {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Nueva Sucursal' : 'Editar Sucursal';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';

    if (!this.modalInstance) {
      const modalElement = document.getElementById('modalSucursal');
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

  // ===================== TABLA / FILTROS =====================

  trackById(index: number, item: SucursalRs): number {
    return item.id;
  }

  aplicarFiltros(): void {
    const { id, nombre, direccion, ciudad, telefono } = this.filtros;

    this.clientesFiltrados = this.clienteList.filter(sucursal => {
      const matchId = id ? sucursal.id.toString().includes(id) : true;
      const matchNombre = nombre
        ? sucursal.nombre.toLowerCase().includes(nombre.toLowerCase())
        : true;
      const matchDireccion = direccion
        ? sucursal.direccion?.toLowerCase().includes(direccion.toLowerCase())
        : true;
      const matchCiudad = ciudad
        ? sucursal.ciudad?.toLowerCase().includes(ciudad.toLowerCase())
        : true;
      const matchTelefono = telefono
        ? sucursal.telefono?.includes(telefono)
        : true;

      return matchId && matchNombre && matchDireccion && matchCiudad && matchTelefono;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      id: '',
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      activo: ''
    };
    this.clientesFiltrados = [...this.clienteList];
  }

  // ===================== SUBMIT =====================

  onSubmit(): void {
    if (this.modoFormulario === 'C') {
      this.guardarSucursal();
    } else if (this.modoFormulario === 'E') {
      this.actualizarSucursal();
    }
  }
}
