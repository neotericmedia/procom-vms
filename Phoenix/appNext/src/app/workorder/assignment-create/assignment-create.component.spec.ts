import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentCreateComponent } from './assignment-create.component';

describe('AssignmentCreateComponent', () => {
  let component: AssignmentCreateComponent;
  let fixture: ComponentFixture<AssignmentCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
