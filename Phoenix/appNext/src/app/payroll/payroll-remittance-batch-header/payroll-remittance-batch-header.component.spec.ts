import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollRemittanceBatchHeaderComponent } from './payroll-remittance-batch-header.component';

describe('PayrollRemittanceBatchHeaderComponent', () => {
  let component: PayrollRemittanceBatchHeaderComponent;
  let fixture: ComponentFixture<PayrollRemittanceBatchHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollRemittanceBatchHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollRemittanceBatchHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
