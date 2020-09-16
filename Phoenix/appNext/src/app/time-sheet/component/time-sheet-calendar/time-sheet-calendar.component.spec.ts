import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCalendarComponent } from './time-sheet-calendar.component';

describe('TimeSheetCalendarDesktopComponent', () => {
  let component: TimeSheetCalendarComponent;
  let fixture: ComponentFixture<TimeSheetCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
