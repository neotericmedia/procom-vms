import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDirectDepositSearchComponent } from './payment-direct-deposit-search.component';

describe('PaymentDirectDepositSearchComponent', () => {
  let component: PaymentDirectDepositSearchComponent;
  let fixture: ComponentFixture<PaymentDirectDepositSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentDirectDepositSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDirectDepositSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
