import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderBillingRatesComponent } from './workorder-billing-rates.component';

describe('WorkorderBillingRatesComponent', () => {
  let component: WorkorderBillingRatesComponent;
  let fixture: ComponentFixture<WorkorderBillingRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderBillingRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderBillingRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
