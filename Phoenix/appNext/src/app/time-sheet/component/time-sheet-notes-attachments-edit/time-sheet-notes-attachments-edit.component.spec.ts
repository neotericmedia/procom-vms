import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetNotesAttachmentsEditComponent } from './time-sheet-notes-attachments-edit.component';

describe('TimeSheetNotesAttachmentsEditComponent', () => {
  let component: TimeSheetNotesAttachmentsEditComponent;
  let fixture: ComponentFixture<TimeSheetNotesAttachmentsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSheetNotesAttachmentsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetNotesAttachmentsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
