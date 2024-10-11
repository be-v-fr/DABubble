import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { emptyRouteGuard } from './empty-route.guard';

describe('emptyRouteGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => emptyRouteGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
