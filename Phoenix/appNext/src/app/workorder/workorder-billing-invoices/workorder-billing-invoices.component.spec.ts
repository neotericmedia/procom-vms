import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingInvoicesComponent } from './workorder-billing-invoices.component';

describe('WorkorderBillingInvoicesComponent', () => {
  let component: WorkorderBillingInvoicesComponent;
  let fixture: ComponentFixture<WorkorderBillingInvoicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingInvoicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
