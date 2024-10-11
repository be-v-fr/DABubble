import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Custom route guard that handles the redirect from an empty route. 
 * Authentication and corresponding redirection is handled elsewhere
 * (see app.component.ts and home.component.ts).
 * 
 * @param route - The activated route snapshot containing route information, including query parameters.
 * @param state - The current router state.
 */
export const emptyRouteGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  router.navigate(['/new']);
  return false;
};
