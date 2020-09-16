import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardPaymentComponent } from './activity-centre-card-payment.component';

describe('ActivityCentreCardPaymentComponent', () => {
  let component: ActivityCentreCardPaymentComponent;
  let fixture: ComponentFixture<ActivityCentreCardPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
