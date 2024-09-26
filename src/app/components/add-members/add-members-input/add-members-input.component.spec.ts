import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersInputComponent } from './add-members-input.component';

describe('AddMembersInputComponent', () => {
  let component: AddMembersInputComponent;
  let fixture: ComponentFixture<AddMembersInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMembersInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
