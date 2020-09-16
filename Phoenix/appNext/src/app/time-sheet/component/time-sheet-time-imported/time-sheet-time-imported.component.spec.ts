import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetTimeImportedComponent } from './time-sheet-time-imported.component';

describe('TimeSheetTimeImportedComponent', () => {
  let component: TimeSheetTimeImportedComponent;
  let fixture: ComponentFixture<TimeSheetTimeImportedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetTimeImportedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetTimeImportedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
