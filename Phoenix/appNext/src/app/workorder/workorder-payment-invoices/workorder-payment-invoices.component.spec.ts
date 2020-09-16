import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentInvoicesComponent } from './workorder-payment-invoices.component';

describe('WorkorderPaymentInvoicesComponent', () => {
  let component: WorkorderPaymentInvoicesComponent;
  let fixture: ComponentFixture<WorkorderPaymentInvoicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentInvoicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
