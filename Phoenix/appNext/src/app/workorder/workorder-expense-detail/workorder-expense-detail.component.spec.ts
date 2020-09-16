import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderExpenseDetailComponent } from './workorder-expense-detail.component';

describe('WorkorderExpenseDetailComponent', () => {
  let component: WorkorderExpenseDetailComponent;
  let fixture: ComponentFixture<WorkorderExpenseDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderExpenseDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderExpenseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
