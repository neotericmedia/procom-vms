import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ChequeWorkflowComment } from '../share/cheque-workflow-comment';
import { WorkflowAction } from '../../common/model/index';
import { ChequeStateActions } from '../share/cheque-workflow-actions';
import { CommonService } from '../../common/index';

@Component({
  selector: 'app-cheque-workflow-comment-dialog',
  templateUrl: './cheque-workflow-comment-dialog.component.html',
  styleUrls: ['./cheque-workflow-comment-dialog.component.less']
})
export class ChequeWorkflowCommentDialogComponent implements OnInit, OnChanges {
  @ViewChild('dialogCommentModal') modal: any;

  @Input() subTitle: string = '';
  @Input() action: WorkflowAction;
  @Output() save: EventEmitter<{ selectedRows: any, chequeWorkflowComment: ChequeWorkflowComment }> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  title: string = '';
  dateLabel: string = 'Date';
  reasonLabel: string = 'Reason';
  isReasonVisible: boolean = true;
  codeValueGroups: any;

  public model: ChequeWorkflowComment; // fix me
  private selectedRows: any;

  constructor(
    private commonService: CommonService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.action) {
      this.setupDialog();
    }
  }

  public open(selectedRows: any, model: ChequeWorkflowComment) {
    this.selectedRows = selectedRows;
    this.model = Object.assign({}, model);
    this.modal.show();
  }

  setupDialog() {
    if (!this.action) {
      this.title = '';
      this.reasonLabel = '';
      this.dateLabel = '';
      this.isReasonVisible = false;
      return;
    }

    switch (this.action.Id) {
      case ChequeStateActions.PaymentCancelCheques:
        this.title = 'Cancel Cheques';
        this.dateLabel = 'Cancellation Date';
        this.reasonLabel = 'Reason for Cancellation';
        this.isReasonVisible = true;
        break;
      case ChequeStateActions.PaymentMarkAsNSF:
        this.title = 'Mark Cheques as NSF';
        this.dateLabel = 'NSF Date';
        this.reasonLabel = 'Reason for NSF Cheque';
        this.isReasonVisible = true;
        break;
      case ChequeStateActions.PaymentStopPayment:
        this.title = 'Stop Payment for Cheques';
        this.dateLabel = 'Stop Payment Date';
        this.reasonLabel = 'Reason for Stop Payment';
        this.isReasonVisible = true;
        break;
      case ChequeStateActions.PaymentClearCheques:
        this.title = 'Clear Cheques';
        this.dateLabel = 'Clearing Date';
        this.reasonLabel = '';
        this.isReasonVisible = false;
        break;
    }
  }

  saveClicked() {
    this.modal.hide();
    this.save.emit({
      selectedRows: this.selectedRows,
      chequeWorkflowComment: this.model
    });
  }

  cancelClicked() {
    this.modal.hide();
    this.cancel.emit();
  }

}
