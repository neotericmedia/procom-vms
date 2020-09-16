import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedWorkordersComponent } from './associated-workorders.component';

describe('AssociatedWorkordersComponent', () => {
  let component: AssociatedWorkordersComponent;
  let fixture: ComponentFixture<AssociatedWorkordersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssociatedWorkordersComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedWorkordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
