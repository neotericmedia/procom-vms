/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PaymentWireTransferBatchComponent } from './payment-wire-transfer-batch.component';

describe('PaymentDirectDepositBatchComponent', () => {
  let component: PaymentWireTransferBatchComponent;
  let fixture: ComponentFixture<PaymentWireTransferBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentWireTransferBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentWireTransferBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
