import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidatedBillingTransactionClearingComponent } from './consolidated-billing-transaction-clearing.component';

describe('ConsolidatedBillingTransactionClearingComponent', () => {
  let component: ConsolidatedBillingTransactionClearingComponent;
  let fixture: ComponentFixture<ConsolidatedBillingTransactionClearingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsolidatedBillingTransactionClearingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidatedBillingTransactionClearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
