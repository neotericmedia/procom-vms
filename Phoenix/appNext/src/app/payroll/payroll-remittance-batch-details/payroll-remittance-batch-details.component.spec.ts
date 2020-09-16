import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRemittanceBatchDetailsComponent } from './payroll-remittance-batch-details.component';

describe('PayrollRemittanceBatchDetailsComponent', () => {
  let component: PayrollRemittanceBatchDetailsComponent;
  let fixture: ComponentFixture<PayrollRemittanceBatchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollRemittanceBatchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollRemittanceBatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
