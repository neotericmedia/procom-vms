import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentRatesComponent } from './workorder-payment-rates.component';

describe('WorkorderPayementRatesComponent', () => {
  let component: WorkorderPaymentRatesComponent;
  let fixture: ComponentFixture<WorkorderPaymentRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
