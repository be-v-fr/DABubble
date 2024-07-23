import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = new Router();
  const mode = route.queryParams['mode'];
  const oobCode = route.queryParams['oobCode'];
  if (mode == 'resetPassword' && oobCode) {
    router.navigate(['/auth/resetPw'], { queryParams: { oobCode } });
    return false;
  }
  router.navigate(['/main-chat/#']);
  return false;
};