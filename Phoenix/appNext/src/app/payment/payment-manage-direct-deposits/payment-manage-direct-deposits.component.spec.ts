import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentManageDirectDepositsComponent } from './payment-manage-direct-deposits.component';

describe('PaymentManageDirectDepositsComponent', () => {
  let component: PaymentManageDirectDepositsComponent;
  let fixture: ComponentFixture<PaymentManageDirectDepositsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentManageDirectDepositsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentManageDirectDepositsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
