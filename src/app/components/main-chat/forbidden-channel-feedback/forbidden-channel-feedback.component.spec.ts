import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForbiddenChannelFeedbackComponent } from './forbidden-channel-feedback.component';

describe('ForbiddenChannelFeedbackComponent', () => {
  let component: ForbiddenChannelFeedbackComponent;
  let fixture: ComponentFixture<ForbiddenChannelFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForbiddenChannelFeedbackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForbiddenChannelFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
