import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetNotesAttachmentsComponent } from './time-sheet-notes-attachments.component';

describe('TimeSheetNotesAttachmentsComponent', () => {
  let component: TimeSheetNotesAttachmentsComponent;
  let fixture: ComponentFixture<TimeSheetNotesAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetNotesAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetNotesAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
