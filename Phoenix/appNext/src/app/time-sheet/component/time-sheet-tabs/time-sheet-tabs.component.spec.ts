import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetTabsComponent } from './time-sheet-tabs.component';

describe('TimeSheetTabsComponent', () => {
  let component: TimeSheetTabsComponent;
  let fixture: ComponentFixture<TimeSheetTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
