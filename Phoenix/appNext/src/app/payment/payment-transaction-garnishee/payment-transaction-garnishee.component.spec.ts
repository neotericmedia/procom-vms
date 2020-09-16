import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTransactionGarnisheeComponent } from './payment-transaction-garnishee.component';

describe('PaymentTransactionGarnisheeComponent', () => {
  let component: PaymentTransactionGarnisheeComponent;
  let fixture: ComponentFixture<PaymentTransactionGarnisheeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTransactionGarnisheeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTransactionGarnisheeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
