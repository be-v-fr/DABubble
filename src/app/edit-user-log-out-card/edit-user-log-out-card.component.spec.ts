import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserLogOutCardComponent } from './edit-user-log-out-card.component';

describe('EditUserLogOutCardComponent', () => {
  let component: EditUserLogOutCardComponent;
  let fixture: ComponentFixture<EditUserLogOutCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserLogOutCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditUserLogOutCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
