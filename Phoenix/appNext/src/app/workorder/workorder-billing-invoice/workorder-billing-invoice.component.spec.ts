import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingInvoiceComponent } from './workorder-billing-invoice.component';

describe('WorkorderBillingInvoiceComponent', () => {
  let component: WorkorderBillingInvoiceComponent;
  let fixture: ComponentFixture<WorkorderBillingInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
