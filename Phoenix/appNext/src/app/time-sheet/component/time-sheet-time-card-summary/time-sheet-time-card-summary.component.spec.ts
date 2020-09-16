import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetTimeCardSummaryComponent } from './time-sheet-time-card-summary.component';

describe('TimeSheetTimeCardSummaryComponent', () => {
  let component: TimeSheetTimeCardSummaryComponent;
  let fixture: ComponentFixture<TimeSheetTimeCardSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetTimeCardSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetTimeCardSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
