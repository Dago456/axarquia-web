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

interface CameraOption {
  id: string;
  label: string;
  tipo: 'frontal' | 'trasera' | 'otra';
}

@Component({
  selector: 'app-qr-reader',
  standalone: true,
  templateUrl: './qr-reader.html',
  styleUrl: './qr-reader.scss'
})
export class QrReaderComponent implements AfterViewInit, OnDestroy {

  @Output()
  codigoLeido = new EventEmitter<string>();

  @ViewChild('reader')
  reader!: ElementRef<HTMLDivElement>;

  private qrScanner?: Html5Qrcode;

  cameras: CameraOption[] = [];

  cameraSeleccionada = '';

  estado = 'Iniciando cámara...';

  escaneando = false;

  flashDisponible = false;
  flashActivo = false;

  private iniciando = false;

  // =========================================================
  // INICIO
  // =========================================================

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.iniciarScanner();
    }, 300);

  }

  // =========================================================
  // INICIAR SCANNER
  // =========================================================

  async iniciarScanner(): Promise<void> {

    if (this.iniciando) {
      return;
    }

    this.iniciando = true;

    try {

      this.estado = 'Solicitando acceso a la cámara...';

      this.qrScanner = new Html5Qrcode('reader');

      const devices =
        await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {

        this.estado =
          'No se encontró ninguna cámara disponible.';

        return;
      }

      console.log(
        '📷 Cámaras detectadas:',
        devices
      );

      this.cameras =
        devices.map(device => {

          const label =
            device.label ||
            'Cámara';

          const labelLower =
            label.toLowerCase();

          let tipo: CameraOption['tipo'] =
            'otra';

          if (
            labelLower.includes('front') ||
            labelLower.includes('facetime') ||
            labelLower.includes('user') ||
            labelLower.includes('frontal')
          ) {

            tipo = 'frontal';

          } else if (
            labelLower.includes('back') ||
            labelLower.includes('rear') ||
            labelLower.includes('environment') ||
            labelLower.includes('trasera') ||
            labelLower.includes('wide') ||
            labelLower.includes('principal')
          ) {

            tipo = 'trasera';

          }

          return {
            id: device.id,
            label,
            tipo
          };

        });

      // =====================================================
      // ELEGIR CÁMARA INICIAL
      // =====================================================

      const camaraInicial =
        this.seleccionarCamaraInicial();

      this.cameraSeleccionada =
        camaraInicial.id;

      await this.iniciarCamara(
        camaraInicial.id
      );

    } catch (error) {

      console.error(
        '❌ Error iniciando cámara:',
        error
      );

      this.estado =
        'No fue posible acceder a la cámara.';

    } finally {

      this.iniciando = false;

    }

  }

  // =========================================================
  // SELECCIONAR CÁMARA INICIAL
  // =========================================================

  private seleccionarCamaraInicial(): CameraOption {

    /*
     * Primero intentamos encontrar una cámara
     * claramente identificada como trasera.
     */

    const trasera =
      this.cameras.find(
        camera => camera.tipo === 'trasera'
      );

    if (trasera) {
      return trasera;
    }

    /*
     * Si el navegador no proporciona nombres útiles,
     * intentamos usar facingMode=environment.
     *
     * Pero como estamos trabajando con múltiples
     * cámaras físicas, el selector seguirá estando
     * disponible para el usuario.
     */

    const otra =
      this.cameras.find(
        camera => camera.tipo === 'otra'
      );

    if (otra) {
      return otra;
    }

    return this.cameras[0];

  }

  // =========================================================
  // INICIAR UNA CÁMARA
  // =========================================================

  private async iniciarCamara(
    cameraId: string
  ): Promise<void> {

    if (!this.qrScanner) {
      return;
    }

    try {

      this.estado =
        'Iniciando cámara...';

      this.escaneando = false;

      /*
       * Si ya había una cámara funcionando,
       * primero la detenemos.
       */

      if (this.qrScanner.isScanning) {

        await this.qrScanner.stop();

      }

      /*
       * Configuración del lector.
       */

      const config = {

        fps: 10,

        qrbox: {
          width: 250,
          height: 250
        },

        aspectRatio: 1.0

      };

      await this.qrScanner.start(

        cameraId,

        config,

        (decodedText) => {

          console.log(
            '✅ QR detectado:',
            decodedText
          );

          this.codigoLeido.emit(
            decodedText
          );

          this.detener();

        },

        () => {
          // No hacemos nada con errores
          // de lectura individuales.
        }

      );

      this.cameraSeleccionada =
        cameraId;

      this.escaneando = true;

      this.estado =
        'Apunte al código QR';

      /*
       * Comprobamos si esta cámara permite
       * utilizar el flash.
       */

      this.comprobarFlash();

    } catch (error) {

      console.error(
        '❌ Error iniciando cámara:',
        error
      );

      this.escaneando = false;

      this.estado =
        'No fue posible iniciar esta cámara.';

    }

  }

  // =========================================================
  // CAMBIAR CÁMARA
  // =========================================================

  async cambiarCamara(
    event: Event
  ): Promise<void> {

    const select =
      event.target as HTMLSelectElement;

    const cameraId =
      select.value;

    if (!cameraId) {
      return;
    }

    this.flashActivo = false;

    await this.iniciarCamara(
      cameraId
    );

  }

  // =========================================================
  // FLASH
  // =========================================================

  private comprobarFlash(): void {

    try {

      if (!this.qrScanner ||
          !this.qrScanner.isScanning) {

        this.flashDisponible = false;

        return;
      }

      const capabilities =
        this.qrScanner
          .getRunningTrackCapabilities();

      this.flashDisponible =
        !!capabilities &&
        'torch' in capabilities;

      console.log(
        '🔦 Flash disponible:',
        this.flashDisponible
      );

    } catch (error) {

      console.warn(
        'No se pudo comprobar el flash:',
        error
      );

      this.flashDisponible = false;

    }

  }

  async alternarFlash(): Promise<void> {

    if (
      !this.qrScanner ||
      !this.qrScanner.isScanning ||
      !this.flashDisponible
    ) {
      return;
    }
  
    try {
  
      const nuevoEstado = !this.flashActivo;
  
      const constraints: MediaTrackConstraints & {
        torch?: boolean;
      } = {
        advanced: [
          {
            torch: nuevoEstado
          } as MediaTrackConstraintSet & {
            torch?: boolean;
          }
        ]
      };
  
      await this.qrScanner.applyVideoConstraints(
        constraints
      );
  
      this.flashActivo = nuevoEstado;
  
      console.log(
        '🔦 Flash:',
        this.flashActivo
          ? 'ENCENDIDO'
          : 'APAGADO'
      );
  
    } catch (error) {
  
      console.error(
        '❌ No se pudo cambiar el flash:',
        error
      );
  
      this.flashActivo = false;
  
    }
  
  }

  // =========================================================
  // DETENER
  // =========================================================

  async detener(): Promise<void> {

    try {

      this.flashActivo = false;

      this.escaneando = false;

      if (
        this.qrScanner &&
        this.qrScanner.isScanning
      ) {

        await this.qrScanner.stop();

      }

      if (this.qrScanner) {

        this.qrScanner.clear();

      }

    } catch (error) {

      console.error(
        'Error deteniendo cámara:',
        error
      );

    }

  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.detener();

  }

}