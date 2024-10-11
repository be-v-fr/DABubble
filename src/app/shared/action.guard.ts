import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Custom route guard that handles query parameters for password reset or email verification.
 * It intercepts routes, checks for specific query parameters, and navigates to appropriate routes accordingly
 * to prevent the standard route direction to the login form or home / new message view.
 * 
 * @param route - The activated route snapshot containing route information, including query parameters.
 * @param state - The current router state.
 */
export const actionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const mode = route.queryParams['mode'];
  const oobCode = route.queryParams['oobCode'];
  if (oobCode) {
    switch (mode) {
      case 'resetPassword':
        router.navigate(['/auth/resetPw'], { queryParams: { oobCode } });
        break;
      case 'verifyAndChangeEmail':
        router.navigate(['/auth/changeEmail'], { queryParams: { oobCode } });
    }
  }
  return false;
};
