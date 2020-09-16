import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetLineManagementCapsuleEditComponent } from './time-sheet-line-management-capsule-edit.component';

describe('TimeSheetLineManagementCapsuleEditComponent', () => {
  let component: TimeSheetLineManagementCapsuleEditComponent;
  let fixture: ComponentFixture<TimeSheetLineManagementCapsuleEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetLineManagementCapsuleEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetLineManagementCapsuleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
