import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSeparatorComponent } from './time-separator.component';

describe('TimeSeparatorComponent', () => {
  let component: TimeSeparatorComponent;
  let fixture: ComponentFixture<TimeSeparatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSeparatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeSeparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
