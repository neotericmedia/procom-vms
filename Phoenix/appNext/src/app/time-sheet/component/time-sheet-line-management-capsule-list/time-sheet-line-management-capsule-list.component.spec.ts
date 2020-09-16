import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetLineManagementCapsuleListComponent } from './time-sheet-line-management-capsule-list.component';

describe('TimeSheetLineManagementCapsuleListComponent', () => {
  let component: TimeSheetLineManagementCapsuleListComponent;
  let fixture: ComponentFixture<TimeSheetLineManagementCapsuleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetLineManagementCapsuleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetLineManagementCapsuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
