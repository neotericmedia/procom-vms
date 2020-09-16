import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingTaxesComponent } from './workorder-billing-taxes.component';

describe('WorkorderBillingTaxesComponent', () => {
  let component: WorkorderBillingTaxesComponent;
  let fixture: ComponentFixture<WorkorderBillingTaxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingTaxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
