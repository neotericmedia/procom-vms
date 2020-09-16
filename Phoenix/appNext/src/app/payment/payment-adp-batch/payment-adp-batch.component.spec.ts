/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PaymentADPBatchComponent } from './payment-adp-batch.component';

describe('PaymentAdpBatchComponent', () => {
  let component: PaymentADPBatchComponent;
  let fixture: ComponentFixture<PaymentADPBatchComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentADPBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentADPBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
