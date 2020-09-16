import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentInvoiceComponent } from './workorder-payment-invoice.component';

describe('WorkorderPaymentInvoiceComponent', () => {
  let component: WorkorderPaymentInvoiceComponent;
  let fixture: ComponentFixture<WorkorderPaymentInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
