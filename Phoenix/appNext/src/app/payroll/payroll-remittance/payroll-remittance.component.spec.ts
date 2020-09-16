import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRemittanceComponent } from './payroll-remittance.component';

describe('PayrollRemittanceComponent', () => {
  let component: PayrollRemittanceComponent;
  let fixture: ComponentFixture<PayrollRemittanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollRemittanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollRemittanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
