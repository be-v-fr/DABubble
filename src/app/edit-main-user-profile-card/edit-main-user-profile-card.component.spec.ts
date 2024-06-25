import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMainUserProfileCardComponent } from './edit-main-user-profile-card.component';

describe('EditUserProfileCardComponent', () => {
  let component: EditMainUserProfileCardComponent;
  let fixture: ComponentFixture<EditMainUserProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMainUserProfileCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMainUserProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
