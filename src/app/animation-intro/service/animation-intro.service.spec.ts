import { TestBed } from '@angular/core/testing';

import { AnimationIntroService } from './animation-intro.service';

describe('AnimationIntroService', () => {
  let service: AnimationIntroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationIntroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
