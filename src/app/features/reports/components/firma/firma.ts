import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-firma',
  standalone: true,
  templateUrl: './firma.html',
  styleUrl: './firma.scss'
})
export class FirmaComponent implements AfterViewInit {

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  @Input()
  firma: string | null = null;

  @Output()
  firmaChange = new EventEmitter<string | null>();

  private ctx!: CanvasRenderingContext2D;

  private dibujando = false;

  ngAfterViewInit(): void {

    const canvas = this.canvas.nativeElement;

    const contexto = canvas.getContext('2d');

    if (!contexto) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }

    this.ctx = contexto;

    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#000000';

    console.log('Canvas de firma listo');

  }

  empezar(event: PointerEvent): void {

    event.preventDefault();

    const canvas = this.canvas.nativeElement;

    canvas.setPointerCapture(event.pointerId);

    const posicion = this.obtenerPosicion(event);

    this.dibujando = true;

    this.ctx.beginPath();

    this.ctx.moveTo(
      posicion.x,
      posicion.y
    );

  }

  dibujar(event: PointerEvent): void {

    if (!this.dibujando) {
      return;
    }

    event.preventDefault();

    const posicion = this.obtenerPosicion(event);

    this.ctx.lineTo(
      posicion.x,
      posicion.y
    );

    this.ctx.stroke();

  }

  terminar(event: PointerEvent): void {

    if (!this.dibujando) {
      return;
    }

    event.preventDefault();

    this.dibujando = false;

    this.ctx.closePath();

    this.guardarFirma();

  }

  limpiarFirma(): void {

    const canvas = this.canvas.nativeElement;

    this.ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    this.firmaChange.emit(null);

  }

  private obtenerPosicion(
    event: PointerEvent
  ): { x: number; y: number } {

    const canvas = this.canvas.nativeElement;

    const rect = canvas.getBoundingClientRect();

    const escalaX =
      canvas.width / rect.width;

    const escalaY =
      canvas.height / rect.height;

    return {

      x:
        (event.clientX - rect.left)
        * escalaX,

      y:
        (event.clientY - rect.top)
        * escalaY

    };

  }

  private guardarFirma(): void {

    const canvas = this.canvas.nativeElement;

    const imagen =
      canvas.toDataURL('image/png');

    this.firmaChange.emit(imagen);

  }

}