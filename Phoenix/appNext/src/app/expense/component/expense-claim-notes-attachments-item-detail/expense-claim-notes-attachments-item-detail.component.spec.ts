import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClaimNotesAttachmentsItemDetailComponent } from './expense-claim-notes-attachments-item-detail.component';

describe('ExpenseClaimNotesAttachmentsItemDetailComponent', () => {
  let component: ExpenseClaimNotesAttachmentsItemDetailComponent;
  let fixture: ComponentFixture<ExpenseClaimNotesAttachmentsItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseClaimNotesAttachmentsItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseClaimNotesAttachmentsItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
