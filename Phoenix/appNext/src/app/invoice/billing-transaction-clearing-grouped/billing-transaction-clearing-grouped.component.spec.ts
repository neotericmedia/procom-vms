import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingTransactionClearingGroupedComponent } from './billing-transaction-clearing-grouped.component';

describe('BillingTransactionClearingGroupedComponent', () => {
  let component: BillingTransactionClearingGroupedComponent;
  let fixture: ComponentFixture<BillingTransactionClearingGroupedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingTransactionClearingGroupedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingTransactionClearingGroupedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
