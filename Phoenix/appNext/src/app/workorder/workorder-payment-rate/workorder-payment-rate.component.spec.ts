import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentRateComponent } from './workorder-payment-rate.component';

describe('WorkorderPayementRateComponent', () => {
  let component: WorkorderPaymentRateComponent;
  let fixture: ComponentFixture<WorkorderPaymentRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
