import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainUserProfileCardComponent } from './main-user-profile-card.component';

describe('MainUserProfileCardComponent', () => {
  let component: MainUserProfileCardComponent;
  let fixture: ComponentFixture<MainUserProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainUserProfileCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainUserProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
