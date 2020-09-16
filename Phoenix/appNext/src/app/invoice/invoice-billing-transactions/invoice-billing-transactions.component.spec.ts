import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicebillingTransactionsComponent } from './invoice-billing-transactions.component';

describe('InvoicebillingTransactionsComponent', () => {
  let component: InvoicebillingTransactionsComponent;
  let fixture: ComponentFixture<InvoicebillingTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicebillingTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicebillingTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
