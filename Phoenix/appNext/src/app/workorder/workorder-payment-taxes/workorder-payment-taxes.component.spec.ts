import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentTaxesComponent } from './workorder-payment-taxes.component';

describe('WorkorderPaymentTaxesComponent', () => {
  let component: WorkorderPaymentTaxesComponent;
  let fixture: ComponentFixture<WorkorderPaymentTaxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentTaxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
