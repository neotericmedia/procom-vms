import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCapsuleSelectComponent } from './time-sheet-capsule-select.component';

describe('TimeSheetCapsuleCreateComponent', () => {
  let component: TimeSheetCapsuleSelectComponent;
  let fixture: ComponentFixture<TimeSheetCapsuleSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCapsuleSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCapsuleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
