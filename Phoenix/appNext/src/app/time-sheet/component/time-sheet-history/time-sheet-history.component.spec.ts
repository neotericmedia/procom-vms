import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetHistoryComponent } from './time-sheet-history.component';

describe('TimeSheetHistoryComponent', () => {
  let component: TimeSheetHistoryComponent;
  let fixture: ComponentFixture<TimeSheetHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
