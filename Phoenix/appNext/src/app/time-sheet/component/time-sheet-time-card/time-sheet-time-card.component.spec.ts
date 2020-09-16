import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetTimeCardComponent } from './time-sheet-time-card.component';

describe('TimeSheetTimeCardComponent', () => {
  let component: TimeSheetTimeCardComponent;
  let fixture: ComponentFixture<TimeSheetTimeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetTimeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetTimeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
