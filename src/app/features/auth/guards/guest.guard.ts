import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/*
 * Evita que un operario ya autenticado vuelva a ver
 * la pantalla de login.
 */
export const guestGuard: CanActivateFn = () => {

    const authService = inject(AuthService);

    const router = inject(Router);

    if (authService.estaAutenticado()) {

        router.navigate(['/dashboard']);

        return false;

    }

    return true;

};
