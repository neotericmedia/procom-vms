import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRemittanceBatchComponent } from './payroll-remittance-batch.component';

describe('PayrollRemittanceBatchComponent', () => {
  let component: PayrollRemittanceBatchComponent;
  let fixture: ComponentFixture<PayrollRemittanceBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollRemittanceBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollRemittanceBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
