import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRemittanceBatchWorkflowComponent } from './payroll-remittance-batch-workflow.component';

describe('PayrollRemittanceBatchWorkflowComponent', () => {
  let component: PayrollRemittanceBatchWorkflowComponent;
  let fixture: ComponentFixture<PayrollRemittanceBatchWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollRemittanceBatchWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollRemittanceBatchWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
