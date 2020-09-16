import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceAddBillingTransactionsComponent } from './invoice-add-billing-transactions.component';

describe('InvoiceAddBillingTransactionsComponent', () => {
  let component: InvoiceAddBillingTransactionsComponent;
  let fixture: ComponentFixture<InvoiceAddBillingTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceAddBillingTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAddBillingTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
