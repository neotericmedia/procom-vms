import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentManageWireTransfersComponent } from './payment-manage-wire-transfers.component';

describe('PaymentManageWireTransfersComponent', () => {
  let component: PaymentManageWireTransfersComponent;
  let fixture: ComponentFixture<PaymentManageWireTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentManageWireTransfersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentManageWireTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
