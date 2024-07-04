import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMainUserAvatarComponent } from './edit-main-user-avatar.component';

describe('EditMainUserAvatarComponent', () => {
  let component: EditMainUserAvatarComponent;
  let fixture: ComponentFixture<EditMainUserAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMainUserAvatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMainUserAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
