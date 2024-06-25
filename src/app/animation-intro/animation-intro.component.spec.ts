import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationIntroComponent } from './animation-intro.component';

describe('AnimationIntroComponent', () => {
  let component: AnimationIntroComponent;
  let fixture: ComponentFixture<AnimationIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationIntroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimationIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
