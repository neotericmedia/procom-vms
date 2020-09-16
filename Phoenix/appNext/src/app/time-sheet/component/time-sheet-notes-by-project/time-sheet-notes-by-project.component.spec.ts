import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetNotesByProjectComponent } from './time-sheet-notes-by-project.component';

describe('TimeSheetNotesByProjectComponent', () => {
  let component: TimeSheetNotesByProjectComponent;
  let fixture: ComponentFixture<TimeSheetNotesByProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetNotesByProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetNotesByProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
