import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClaimNotesAttachmentsComponent } from './expense-claim-notes-attachments.component';

describe('ExpenseClaimNotesAttachmentsComponent', () => {
  let component: ExpenseClaimNotesAttachmentsComponent;
  let fixture: ComponentFixture<ExpenseClaimNotesAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseClaimNotesAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseClaimNotesAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
