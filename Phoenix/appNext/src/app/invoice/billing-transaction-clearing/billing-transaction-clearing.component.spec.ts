import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingTransactionClearingComponent } from './billing-transaction-clearing.component';

describe('BillingTransactionClearingComponent', () => {
  let component: BillingTransactionClearingComponent;
  let fixture: ComponentFixture<BillingTransactionClearingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingTransactionClearingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingTransactionClearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
