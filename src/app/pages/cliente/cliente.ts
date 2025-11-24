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
import { CommonModule } from '@angular/common';

//Importamos modelos y servicios
import { ClienteRs } from './model/clienteRs';
import { ClienteService } from './services/cliente.service';
import { ClienteRq } from './model/clienteRq';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss'
})
export class Cliente {

  //variables para maniuplar el Modal
  modalInstance:Modal |null=null;
  modoFormulario:string='';
  titleModal:string='';
  titleBoton='';
  clienteList:ClienteRs[]=[];
  //si en el futuro necesitamos listas selecionables
  //spinner
  isLoading=false;
  //Filtros dentro de la tabla
  clientesFiltrados:ClienteRs[]=[];

  // Id del cliente actualmente seleccionado para edición
  selectedClienteId: number | null = null;

  filtros={
    id:'',
    nombre:'',
    apellidoPaterno:'',
    apellidoMaterno:'',
    telefono:'',
    correo:'',
    createdAt:''
  }
  
  

  //Contenedor de los campos del formulario
  form:FormGroup=new FormGroup({
    //Campos del cliente
    nombre:new FormControl(''),
    apellidoPaterno:new FormControl(''),
    apellidoMaterno:new FormControl(''),
    telefono:new FormControl(''),
    correo:new FormControl(''),
    
  })
  
  constructor(
    private readonly clienteService:ClienteService,
    private readonly formBuilder:FormBuilder
  ){
    //Inyectarservicios
    this.inicializarFormulario();
    this.listarClientes();
  }

  //Logica de Negocio
  listarClientes(){
    console.log('Cargada de clientes');
    //activamos  el spinner
    this.isLoading=true;
     this.clienteService.ListarClientes().subscribe({
    next: (data: ClienteRs[]) => {
      this.clienteList = data;
      this.clientesFiltrados= [...data]; 
      this.isLoading = false;  //Apagamos el spinner
    },
    error: (err) => {
      this.isLoading = false; // Apagamos spinner también si hay error
      console.error('Error al cargar clientes', err);
    },
  });
  }

  //Guardar cliente con spinner y sweet alert
  guardarCliente(){
    if(this.form.valid){
      this.isLoading=true; //activamos el spinner

      const formValue=this.form.value;
      //Mapear los campos en camelCase para el backend
      const clienteData:ClienteRq={
        nombre:formValue.nombre,
        apellidoPaterno:formValue.apellidoPaterno,
        apellidoMaterno:formValue.apellidoMaterno,
        telefono:formValue.telefono,
        correo:formValue.correo,
        
      };

      this.clienteService.GuardarCliente(clienteData).subscribe({
      next: (response) => {
        this.isLoading = false; //  Desactivar spinner
        Swal.fire({
          title: '¡Éxito!',
          text: 'Cliente registrado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.closeModal();
        this.listarClientes(); //  Recargar la lista
      },
      error: (err) => {
        this.isLoading = false; //  Desactivar spinner
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el cliente',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error(' Error al crear cliente', err);
      }
    });
  } else {
    this.form.markAllAsTouched();
    Swal.fire({
      title: 'Formulario incompleto',
      text: 'Por favor completa todos los campos requeridos',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  }
  //Luego capturar los errores que se presenten
      
    }
    //actualizar clientes
    actualizarCliente(){
      if(this.form.valid){
        this.isLoading=true //carga del spinner

        //Campos que vamos actualizar
      const body: ClienteRq = {
        nombre:this.form.value.nombre,
        apellidoPaterno:this.form.value.apellidoPaterno,
        apellidoMaterno:this.form.value.apellidoMaterno,
        telefono:this.form.value.telefono,
        correo:this.form.value.correo,
      };
      if (this.selectedClienteId == null) {
        console.error('No hay cliente seleccionado para actualizar');
        this.isLoading = false;
        return;
      }

      this.clienteService.ActualizarCliente(this.selectedClienteId, body).subscribe({
        next:(response)=>{
          this.isLoading=false;
          Swal.fire({
            title:'Exito',
            text:'Cliente actualizado correctamente',
            icon:'success',
            confirmButtonText:'Aceptar'
          })
          this.closeModal();
          this.listarClientes();
        },
        error:(err)=>{
          this.isLoading=false;
          Swal.fire({
            title:'Error',
            text:'No se pudo actualizar el cliente',
            icon:'error',
            confirmButtonText:'Aceptar'
          })
          console.error('Error al actualizar cliente',err);
        }
      });

      }else{
        this.form.markAllAsTouched();
        Swal.fire({
          title:'Formulario incompleto',
          text:'Por favor completa todos los campos requeridos',
          icon:'warning',
          confirmButtonText:'Aceptar'
        });
      }

    }
    //logica del formulario
    inicializarFormulario(){
      this.form = this.formBuilder.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        apellidoPaterno: ['', [Validators.required, Validators.minLength(3)]],
        // segundo apellido opcional
        apellidoMaterno: ['', [Validators.minLength(3)]],
        // teléfono requerido pero con longitud mínima más flexible
        telefono: ['', [Validators.required, Validators.minLength(7)]],
        correo: ['', [Validators.required, Validators.email]],
      });

    }
    //acceder al formulario
    get f(): {[key: string]: AbstractControl} {
     return this.form.controls;
    }
    //limpiar formulario
    limpiarFormulario(){
      this.form.reset();
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
    abrirNuevoCliente(){
      this.limpiarFormulario();
      this.selectedClienteId = null;
      this.openModal('C');
    }

    //logica para  editar campos del formulario
    abrirEditarCliente(cliente:ClienteRs){
      this.limpiarFormulario();
      this.modoFormulario = 'E';

      // guardamos el id del cliente a actualizar
      this.selectedClienteId = cliente.id;

      //Pre carga datos en el formulario
      this.form.patchValue({
        nombre:cliente.nombre,
        apellidoPaterno:cliente.apellidoPaterno,
        apellidoMaterno:cliente.apellidoMaterno,
        telefono:cliente.telefono,
        correo:cliente.correo,
      });
      // abrir modal en modo edición
      this.openModal('E');
    }
    //Metodo para abrir el modal
      openModal(modo:string){
        this.modoFormulario=modo;
        this.titleModal=modo==='C'?'Nuevo Cliente':'Editar Cliente';
        this.titleBoton=modo==='C'?'Guardar':'Actualizar';

        //Obtener el elemento del modal por su ID solo una vez
        if (!this.modalInstance) {
          const modalElement = document.getElementById('modalCliente');
          if (modalElement) {
            this.modalInstance = new Modal(modalElement);
          }
        }

        // Mostrar el modal si la instancia existe
        this.modalInstance?.show();
      }
      //usamos Track id luego para la actualizacion
      trackById(index:number,item:any){
        return item.id;
      }
      //Metodo para aplicar filtros
      aplicarFiltros(){
        const { id, nombre, apellidoPaterno, apellidoMaterno, telefono, correo } = this.filtros;
        this.clientesFiltrados = this.clienteList.filter(m => {
          const matchId = id
            ? m.id.toString().includes(id)
            : true;
          const matchNombre = nombre
            ? m.nombre.toLowerCase().includes(nombre.toLowerCase())
            : true;
          const matchApellidoPaterno = apellidoPaterno
            ? m.apellidoPaterno.toLowerCase().includes(apellidoPaterno.toLowerCase())
            : true;
          const matchApellidoMaterno = apellidoMaterno
            ? m.apellidoMaterno.toLowerCase().includes(apellidoMaterno.toLowerCase())
            : true;
          const matchTelefono = telefono
            ? m.telefono.toLowerCase().includes(telefono.toLowerCase())
            : true;
          const matchCorreo = correo
            ? m.correo.toLowerCase().includes(correo.toLowerCase())
            : true;

          return matchId && matchNombre && matchApellidoPaterno && matchApellidoMaterno && matchTelefono && matchCorreo;
        });

      }
      //limpiar filtros
      limpiarFiltros(){
        this.filtros={
          id:'',
          nombre:'',
          apellidoPaterno:'',
          apellidoMaterno:'',
          telefono:'',
          correo:'',
          createdAt:''
        };
        this.clientesFiltrados=[...this.clienteList];
      }
      //Manejamos el envio del formulario
      onSubmit(){
        if(this.modoFormulario==='C'){
          //Crear nuevo Cliente
          this.guardarCliente();

        }else if(this.modoFormulario==='E'){
          //Actualizar Cliente
          this.actualizarCliente();
        }
      }
      //Metodo para cerrar el modal
      closeModal(){
        if(this.modalInstance){
          this.modalInstance.hide();
        }
        this.isLoading = false;
      }
      

  }




