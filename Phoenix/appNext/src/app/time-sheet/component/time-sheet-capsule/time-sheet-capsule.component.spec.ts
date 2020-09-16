import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetCapsuleComponent } from './time-sheet-capsule.component';

describe('TimeSheetCapsuleComponent', () => {
  let component: TimeSheetCapsuleComponent;
  let fixture: ComponentFixture<TimeSheetCapsuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetCapsuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetCapsuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
