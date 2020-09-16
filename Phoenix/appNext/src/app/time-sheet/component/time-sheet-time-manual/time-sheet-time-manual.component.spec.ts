import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetTimeManualComponent } from './time-sheet-time-manual.component';

describe('TimeSheetTimeManualComponent', () => {
  let component: TimeSheetTimeManualComponent;
  let fixture: ComponentFixture<TimeSheetTimeManualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetTimeManualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetTimeManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
