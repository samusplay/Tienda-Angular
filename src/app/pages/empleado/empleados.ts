
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

import { EmpleadoRq } from './model/empleadoRq';
import { EmpleadoRs } from './model/empleadoRs';
import { EmpleadoService } from './services/empleado.service';

// importamos sucursales para el combo
import { SucursalRs } from '../sucursal/model/sucursalRs';
import { SucursalService } from '../sucursal/services/sucursal.service';
@Component({
  selector: 'app-empleados',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.scss'
})
export class Empleados {

  // ================== MODAL ==================
  modalInstance: Modal | null = null;
  modoFormulario: 'C' | 'E' | '' = '';
  titleModal: string = '';
  titleBoton: string = '';

  // ================== LISTAS ==================
  empleadoList: EmpleadoRs[] = [];
  empleadosFiltrados: EmpleadoRs[] = [];

  // lista de sucursales para el <select>
  sucursales: SucursalRs[] = [];

  // ================== ESTADO ==================
  isLoading = false;
  selectedEmpleadoId: number | null = null;

  // ================== FILTROS TABLA ==================
  filtros = {
    id: '',
    primerNombre: '',
    apellidoPaterno: '',
    cargo: '',
    sucursal: '',
    email: ''
  };

  // ================== FORMULARIO ==================
  form: FormGroup = new FormGroup({
    primerNombre: new FormControl(''),
    segundoNombre: new FormControl(''),
    apellidoPaterno: new FormControl(''),
    apellidoMaterno: new FormControl(''),
    cargo: new FormControl(''),
    idSucursal: new FormControl(null),
    email: new FormControl(''),
    activo: new FormControl(true),
  });

  constructor(
    private readonly empleadoService: EmpleadoService,
    private readonly sucursalService: SucursalService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarEmpleados();
    this.cargarSucursales();
  }

  // ================== FORM ==================

  private inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      primerNombre: ['', [Validators.required, Validators.maxLength(60)]],
      segundoNombre: ['', [Validators.maxLength(60)]],
      apellidoPaterno: ['', [Validators.maxLength(60)]],
      apellidoMaterno: ['', [Validators.maxLength(60)]],
      cargo: ['', [Validators.required, Validators.maxLength(60)]],
      idSucursal: [null, [Validators.required]],   // id de la sucursal
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      activo: [true, [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  limpiarFormulario(): void {
    this.form.reset({
      primerNombre: '',
      segundoNombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      cargo: '',
      idSucursal: null,
      email: '',
      activo: true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ================== CARGAR SUCURSALES ==================

  private cargarSucursales(): void {
    this.sucursalService.ListarSucursales().subscribe({
      next: (data: SucursalRs[]) => {
        // si quieres solo activas:
        this.sucursales = data.filter(s => s.activo);
      },
      error: (err) => {
        console.error('Error al cargar sucursales para el combo', err);
      }
    });
  }

  // ================== LISTAR EMPLEADOS ==================

  listarEmpleados(): void {
    console.log('Cargando empleados...');
    this.isLoading = true;

    this.empleadoService.ListarEmpleados().subscribe({
      next: (data: EmpleadoRs[]) => {
        this.empleadoList = data;
        this.empleadosFiltrados = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar empleados', err);
      }
    });
  }

  // ================== CREAR ==================

  guardarEmpleado(): void {
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
    const empleadoData: EmpleadoRq = new EmpleadoRq({
      primerNombre: formValue.primerNombre,
      segundoNombre: formValue.segundoNombre,
      apellidoPaterno: formValue.apellidoPaterno,
      apellidoMaterno: formValue.apellidoMaterno,
      cargo: formValue.cargo,
      idSucursal: formValue.idSucursal,
      email: formValue.email,
      activo: formValue.activo
    });

    this.empleadoService.CrearEmpleado(empleadoData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'Empleado registrado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarEmpleados();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el empleado',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al crear empleado', err);
      }
    });
  }

  // ================== ACTUALIZAR ==================

  actualizarEmpleado(): void {
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

    if (this.selectedEmpleadoId == null) {
      console.error('No hay empleado seleccionado para actualizar');
      return;
    }

    this.isLoading = true;

    const body: EmpleadoRq = new EmpleadoRq({
      primerNombre: this.form.value.primerNombre,
      segundoNombre: this.form.value.segundoNombre,
      apellidoPaterno: this.form.value.apellidoPaterno,
      apellidoMaterno: this.form.value.apellidoMaterno,
      cargo: this.form.value.cargo,
      idSucursal: this.form.value.idSucursal,
      email: this.form.value.email,
      activo: this.form.value.activo
    });

    this.empleadoService.ActualizarEmpleado(this.selectedEmpleadoId, body).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Éxito',
          text: 'Empleado actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarEmpleados();
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el empleado',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al actualizar empleado', err);
      }
    });
  }

  // ================== MODAL ==================

  abrirNuevoEmpleado(): void {
    this.limpiarFormulario();
    this.selectedEmpleadoId = null;
    this.openModal('C');
  }

  abrirEditarEmpleado(empleado: EmpleadoRs): void {
    this.limpiarFormulario();
    this.modoFormulario = 'E';
    this.selectedEmpleadoId = empleado.id;

    // intentar buscar la sucursal por nombre para precargar el select
    let idSucursalSeleccionada: number | null = null;
    if (empleado.sucursalNombre && this.sucursales.length > 0) {
      const encontrada = this.sucursales.find(s => s.nombre === empleado.sucursalNombre);
      if (encontrada) {
        idSucursalSeleccionada = encontrada.id;
      }
    }

    this.form.patchValue({
      primerNombre: empleado.primerNombre,
      segundoNombre: empleado.segundoNombre,
      apellidoPaterno: empleado.apellidoPaterno,
      apellidoMaterno: empleado.apellidoMaterno,
      cargo: empleado.cargo,
      idSucursal: idSucursalSeleccionada,
      email: empleado.email,
      activo: empleado.activo
    });

    this.openModal('E');
  }

  openModal(modo: 'C' | 'E'): void {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Nuevo empleado' : 'Editar empleado';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';

    if (!this.modalInstance) {
      const modalElement = document.getElementById('modalEmpleado');
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

  trackById(index: number, item: EmpleadoRs): number {
    return item.id;
  }

  aplicarFiltros(): void {
    const { id, primerNombre, apellidoPaterno, cargo, sucursal, email } = this.filtros;

    this.empleadosFiltrados = this.empleadoList.filter(emp => {
      const matchId = id ? emp.id.toString().includes(id) : true;
      const matchPrimerNombre = primerNombre
        ? emp.primerNombre.toLowerCase().includes(primerNombre.toLowerCase())
        : true;
      const matchApellidoPaterno = apellidoPaterno
        ? emp.apellidoPaterno?.toLowerCase().includes(apellidoPaterno.toLowerCase())
        : true;
      const matchCargo = cargo
        ? emp.cargo?.toLowerCase().includes(cargo.toLowerCase())
        : true;
      const matchSucursal = sucursal
        ? emp.sucursalNombre?.toLowerCase().includes(sucursal.toLowerCase())
        : true;
      const matchEmail = email
        ? emp.email?.toLowerCase().includes(email.toLowerCase())
        : true;

      return matchId && matchPrimerNombre && matchApellidoPaterno &&
             matchCargo && matchSucursal && matchEmail;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      id: '',
      primerNombre: '',
      apellidoPaterno: '',
      cargo: '',
      sucursal: '',
      email: ''
    };
    this.empleadosFiltrados = [...this.empleadoList];
  }

  // ================== SUBMIT ==================

  onSubmit(): void {
    if (this.modoFormulario === 'C') {
      this.guardarEmpleado();
    } else if (this.modoFormulario === 'E') {
      this.actualizarEmpleado();
    }
  }

}
