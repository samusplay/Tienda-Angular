import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sucursal',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './sucursal.html',
  styleUrl: './sucursal.scss'
})
//Este mismo nombre debe ir en layout.routes.ts
export class Sucursal {

}
