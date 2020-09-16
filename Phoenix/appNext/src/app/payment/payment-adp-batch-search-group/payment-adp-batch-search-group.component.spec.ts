/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PaymentAdpBatchSearchGroupComponent } from './payment-adp-batch-search-group.component';

describe('PaymentAdpBatchSearchGroupComponent', () => {
  let component: PaymentAdpBatchSearchGroupComponent;
  let fixture: ComponentFixture<PaymentAdpBatchSearchGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentAdpBatchSearchGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentAdpBatchSearchGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
