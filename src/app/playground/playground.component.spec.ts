import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PLAYGROUNDComponent } from './playground.component';

describe('PLAYGROUNDComponent', () => {
  let component: PLAYGROUNDComponent;
  let fixture: ComponentFixture<PLAYGROUNDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PLAYGROUNDComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PLAYGROUNDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
