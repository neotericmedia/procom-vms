import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCentreCardTimesheetComponent } from './activity-centre-card-timesheet.component';

describe('ActivityCentreCardTimesheetComponent', () => {
  let component: ActivityCentreCardTimesheetComponent;
  let fixture: ComponentFixture<ActivityCentreCardTimesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCentreCardTimesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCentreCardTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
