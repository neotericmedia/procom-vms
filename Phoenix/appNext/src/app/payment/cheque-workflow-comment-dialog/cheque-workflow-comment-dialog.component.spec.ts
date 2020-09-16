import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChequeWorkflowCommentDialogComponent } from './cheque-workflow-comment-dialog.component';

describe('ChequeWorkflowCommentDialogComponent', () => {
  let component: ChequeWorkflowCommentDialogComponent;
  let fixture: ComponentFixture<ChequeWorkflowCommentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChequeWorkflowCommentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChequeWorkflowCommentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
