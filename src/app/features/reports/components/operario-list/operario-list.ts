import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Operario } from '../../models/operario.model';
import { OperarioService } from '../../services/operario.service';

@Component({
  selector: 'app-operario-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './operario-list.html',
  styleUrl: './operario-list.scss'
})
export class OperarioListComponent implements OnChanges {

  @Input()
  operariosIniciales: Operario[] = [];

  @Output()
  operariosChange = new EventEmitter<Operario[]>();

  textoBusqueda = '';

  operarios: Operario[] = [];

  operariosSeleccionados: Operario[] = [];

  buscando = false;

  constructor(
    private operarioService: OperarioService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['operariosIniciales']) {

      this.operariosSeleccionados = [
        ...this.operariosIniciales
      ];

    }

  }

  buscar(): void {

    const texto = this.textoBusqueda.trim();

    if (!texto) {

      this.operarios = [];

      return;
    }

    this.buscando = true;

    this.operarioService
      .buscarOperarios(texto)
      .subscribe({

        next: (resultado) => {

          this.operarios = resultado;

          this.buscando = false;

        },

        error: (error) => {

          console.error(
            'Error buscando operarios:',
            error
          );

          this.operarios = [];

          this.buscando = false;

        }

      });

  }


  seleccionarOperario(operario: Operario): void {

    const yaSeleccionado =
      this.operariosSeleccionados.some(
        (o: Operario) =>
          o.id_Operario === operario.id_Operario
      );

    if (yaSeleccionado) {
      return;
    }

    this.operariosSeleccionados.push(operario);

    this.emitirOperarios();

    this.textoBusqueda = '';

    this.operarios = [];

  }


  eliminarOperario(index: number): void {

    this.operariosSeleccionados.splice(index, 1);

    this.emitirOperarios();

  }


  private emitirOperarios(): void {

    this.operariosChange.emit([
      ...this.operariosSeleccionados
    ]);

  }

}