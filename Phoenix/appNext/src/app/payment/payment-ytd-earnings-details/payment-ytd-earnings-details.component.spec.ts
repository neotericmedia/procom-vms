/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PaymentYtdEarningsDetailsComponent } from './payment-ytd-earnings-details.component';

describe('PaymentYtdEarningsDetailsComponent', () => {
  let component: PaymentYtdEarningsDetailsComponent;
  let fixture: ComponentFixture<PaymentYtdEarningsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentYtdEarningsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentYtdEarningsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
