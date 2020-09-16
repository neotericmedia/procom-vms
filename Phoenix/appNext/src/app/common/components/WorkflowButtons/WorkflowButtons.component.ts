// reverted back from changeset 2385
import { PhxDialogCommentComponent } from './../phx-dialog-comment/phx-dialog-comment.component';
import { WorkflowAction, DialogComment, DialogResultType } from './../../model/index';
import { CommonService } from '../../services/common.service';
import { Component, OnInit, Inject, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'workflow-buttons',
  templateUrl: './WorkflowButtons.component.html',
  styleUrls: ['./WorkflowButtons.component.css']
})
export class WBComponent implements OnInit, OnDestroy {
  @ViewChild(PhxDialogCommentComponent) declineReason: PhxDialogCommentComponent;

  @Input() workflowAvailableActions: any[];
  @Input() actionButtons: any[];
  @Input() workflowActionButtons: any[];
  @Input() isValid: boolean = true;
  @Output() clickResult = new EventEmitter<boolean>();
  @Output() callWorkflowCommand = new EventEmitter<any>();

  applicationConstants: any;
  workflowAction: any;

  constructor(
    private apiSvc: ApiService,
    private router: Router,
    private ar: ActivatedRoute,
    private commonService: CommonService) {
    this.applicationConstants = commonService.ApplicationConstants;
  }


  ngOnInit() {
    /*this.getWorkflowButtons();*/

  }

  // getWorkflowButtons(){
  //     this.apiSvc.query('task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/' + this.targetEntityTypeId + '/targetEntityId/' + this.targetEntityId).then(
  //       (wa)=>{
  //         console.log(wa);
  //         this.workflowActions = wa.Items[0];
  //       });
  // }

  editMode(TaskResultId) {
    this.clickResult.emit(TaskResultId);
    /*var params = { "WorkflowPendingTaskId": pendingTask, "WCBSubdivisionVersionId":49}
    this.$phoenixapi.command(command, params).then((res)=>{
      this.router.navigate(['/next', 'payroll', 'wcbsubdivision','new',res.EntityId]);
      console.log('Handle Redirect');
    });*/

  }
  callCommand(o) {
    this.callWorkflowCommand.emit(o);
  }

  executeWorkflowAction(action: any) {
    this.workflowAction = action;

    if (action.TaskRoutingDialogTypeId === this.applicationConstants.TaskRoutingDialogType.Decline) { // test
      this.declineReason.maxLength = action.TaskResultId === this.applicationConstants.TaskResult.ComplianceDocumentRuleActionApprovalDecline ? 4000 : 32000;
      this.declineReason.open();
    } else {
      this.callWorkflowCommand.emit(action);
    }
  }

  declineReasonClosed(event: DialogComment) {
    if (event.ResultType === DialogResultType.OK) {
      this.workflowAction.Comments = event.Comment;
      this.callWorkflowCommand.emit(this.workflowAction);
    }
  }

  ngOnDestroy() {
  }
}

// phoenixapi.query('Payroll/getFederalTaxHeaderByFederalTaxVersionId/' + federalTaxVersionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
