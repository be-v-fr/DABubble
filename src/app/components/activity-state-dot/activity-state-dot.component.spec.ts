import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityStateDotComponent } from './activity-state-dot.component';

describe('ActivityStateDotComponent', () => {
  let component: ActivityStateDotComponent;
  let fixture: ComponentFixture<ActivityStateDotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityStateDotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityStateDotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
