import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceBillingTransactionDocumentsComponent } from './invoice-billing-transaction-documents.component';

describe('InvoiceBillingTransactionDocumentsComponent', () => {
  let component: InvoiceBillingTransactionDocumentsComponent;
  let fixture: ComponentFixture<InvoiceBillingTransactionDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceBillingTransactionDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceBillingTransactionDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
