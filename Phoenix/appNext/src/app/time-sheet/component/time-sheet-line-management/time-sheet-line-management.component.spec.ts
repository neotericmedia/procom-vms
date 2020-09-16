import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetLineManagementComponent } from './time-sheet-line-management.component';

describe('TimeSheetLineManagementDesktopComponent', () => {
  let component: TimeSheetLineManagementComponent;
  let fixture: ComponentFixture<TimeSheetLineManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetLineManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetLineManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
