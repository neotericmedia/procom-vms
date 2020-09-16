/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PaymentYtdEarningsSummaryComponent } from './payment-ytd-earnings-summary.component';

describe('PaymentYtdEarningsSummaryComponent', () => {
  let component: PaymentYtdEarningsSummaryComponent;
  let fixture: ComponentFixture<PaymentYtdEarningsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentYtdEarningsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentYtdEarningsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
