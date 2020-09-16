import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingRateComponent } from './workorder-billing-rate.component';

describe('WorkorderBillingRateComponent', () => {
  let component: WorkorderBillingRateComponent;
  let fixture: ComponentFixture<WorkorderBillingRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
