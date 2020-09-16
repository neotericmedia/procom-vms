import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleBillingTransactionClearingComponent } from './single-billing-transaction-clearing.component';

describe('SingleBillingTransactionClearingComponent', () => {
  let component: SingleBillingTransactionClearingComponent;
  let fixture: ComponentFixture<SingleBillingTransactionClearingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleBillingTransactionClearingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleBillingTransactionClearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
