import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCapsuleEditComponent } from './time-sheet-capsule-edit.component';

describe('TimeSheetCapsuleEditComponent', () => {
  let component: TimeSheetCapsuleEditComponent;
  let fixture: ComponentFixture<TimeSheetCapsuleEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCapsuleEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCapsuleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
