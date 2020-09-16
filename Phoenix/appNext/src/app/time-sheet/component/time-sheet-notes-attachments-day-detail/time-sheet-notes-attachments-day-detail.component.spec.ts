import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetNotesAttachmentsDayDetailComponent } from './time-sheet-notes-attachments-day-detail.component';

describe('TimeSheetNotesAttachmentsDayDetailComponent', () => {
  let component: TimeSheetNotesAttachmentsDayDetailComponent;
  let fixture: ComponentFixture<TimeSheetNotesAttachmentsDayDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetNotesAttachmentsDayDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetNotesAttachmentsDayDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
