import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = new Router();
  const mode = route.queryParams['mode'];
  const oobCode = route.queryParams['oobCode'];
  if (oobCode) {
    switch (mode) {
      case 'resetPassword': router.navigate(['/auth/resetPw'], { queryParams: { oobCode } }); break;
      case 'verifyAndChangeEmail': router.navigate(['auth/changeEmail'], { queryParams: { oobCode } });
    }
    return false;
  }
  router.navigate(['/new']);
  return false;
};