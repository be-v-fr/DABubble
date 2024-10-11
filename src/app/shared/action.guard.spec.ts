import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { actionGuard } from './action.guard';

describe('actionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => actionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
