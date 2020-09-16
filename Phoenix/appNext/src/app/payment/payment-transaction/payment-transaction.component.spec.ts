import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTransactionComponent } from './payment-transaction.component';

describe('PaymentTransactionComponent', () => {
  let component: PaymentTransactionComponent;
  let fixture: ComponentFixture<PaymentTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
