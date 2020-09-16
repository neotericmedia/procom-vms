import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentCreateSetupComponent } from './assignment-create-setup.component';

describe('AssignmentCreateSetupComponent', () => {
  let component: AssignmentCreateSetupComponent;
  let fixture: ComponentFixture<AssignmentCreateSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentCreateSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentCreateSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
