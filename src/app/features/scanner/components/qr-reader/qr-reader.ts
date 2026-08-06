import {
  Component,
  AfterViewInit,
  EventEmitter,
  Output,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-qr-reader',
  standalone: true,
  templateUrl: './qr-reader.html',
  styleUrl: './qr-reader.scss'
})
export class QrReaderComponent implements AfterViewInit, OnDestroy {

  @Output()
  codigoLeido = new EventEmitter<string>();

  private qrScanner?: Html5Qrcode;

  @ViewChild('reader')
  reader!: ElementRef<HTMLDivElement>;
  estado = 'Iniciando cámara...';

  ngAfterViewInit() {
    setTimeout(() => {
      this.iniciarScanner();
    }, 300);
  }

  async iniciarScanner() {
    console.log("reader existe:", document.getElementById("reader"));
    this.qrScanner = new Html5Qrcode("reader");
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        this.estado = "No se encontró cámara";
        return;
      }

      const cameraId = cameras[cameras.length - 1].id;
      this.estado = "Apunte al código QR";
      await this.qrScanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: 250
        },

        (decodedText) => {
          this.codigoLeido.emit(decodedText);
          this.detener();
        },
        () => { }
      );
    } catch (error) {
      console.error(error);
      this.estado = "No fue posible acceder a la cámara.";
    }
  }

  async detener() {
    if (this.qrScanner?.isScanning) {
      await this.qrScanner.stop();
      await this.qrScanner.clear();
    }
  }

  ngOnDestroy() {
    this.detener();
  }
}