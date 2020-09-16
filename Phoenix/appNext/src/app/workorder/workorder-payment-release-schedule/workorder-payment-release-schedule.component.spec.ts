import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderPaymentReleaseScheduleComponent } from './workorder-payment-release-schedule.component';

describe('WorkorderPaymentReleaseScheduleComponent', () => {
  let component: WorkorderPaymentReleaseScheduleComponent;
  let fixture: ComponentFixture<WorkorderPaymentReleaseScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkorderPaymentReleaseScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderPaymentReleaseScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
