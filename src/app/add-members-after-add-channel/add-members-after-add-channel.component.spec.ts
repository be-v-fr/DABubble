import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersAfterAddChannelComponent } from './add-members-after-add-channel.component';

describe('AddMembersAfterAddChannelComponent', () => {
  let component: AddMembersAfterAddChannelComponent;
  let fixture: ComponentFixture<AddMembersAfterAddChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersAfterAddChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMembersAfterAddChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
