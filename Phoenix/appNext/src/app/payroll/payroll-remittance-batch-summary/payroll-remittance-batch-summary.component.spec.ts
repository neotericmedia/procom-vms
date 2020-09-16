import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRemittanceBatchSummaryComponent } from './payroll-remittance-batch-summary.component';

describe('PayrollRemittanceBatchSummaryComponent', () => {
  let component: PayrollRemittanceBatchSummaryComponent;
  let fixture: ComponentFixture<PayrollRemittanceBatchSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollRemittanceBatchSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollRemittanceBatchSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
