import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetLineManagementCapsuleComponent } from './time-sheet-line-management-capsule.component';

describe('TimeSheetLineManagementCapsuleComponent', () => {
  let component: TimeSheetLineManagementCapsuleComponent;
  let fixture: ComponentFixture<TimeSheetLineManagementCapsuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetLineManagementCapsuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetLineManagementCapsuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
