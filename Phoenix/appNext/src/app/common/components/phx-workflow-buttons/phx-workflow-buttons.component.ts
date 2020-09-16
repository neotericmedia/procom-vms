import { PhxDialogCommentComponent } from './../phx-dialog-comment/phx-dialog-comment.component';
import { WorkflowAction, DialogComment, DialogResultType } from './../../model/index';
import { CommonService } from '../../services/common.service';
import { Component, OnInit, Inject, OnDestroy, Input, Output, EventEmitter, ViewChild, HostListener, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

export enum ButtonBarSortDirection {
  RightToLeft = 1,
  LeftToRight = 2
}

@Component({
  selector: 'app-phx-workflow-buttons',
  templateUrl: './phx-workflow-buttons.component.html',
  styleUrls: ['./phx-workflow-buttons.component.less']
})
export class PhxWorkflowButtonsComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild(PhxDialogCommentComponent) declineReason: PhxDialogCommentComponent;

  @Input() disabled: boolean = false;
  @Input() valid: boolean = false;
  @Input() isButtonBar: boolean = false;
  @Input() isMobileCenter: boolean = false;
  @Input() isMobileFab: boolean = false;
  @Output() callWorkflowCommand = new EventEmitter<WorkflowAction>();


  @Input() buttonSortDirection = null; // fix me
  @Input() openDefaultDeclineDialog: boolean = true; // fix me
  // function should return empty string or 'primary' or 'danger' or 'secondary'
  @Input() getActionButtonCssClass: Function;


  _workflowAvailableActions: WorkflowAction[];
  get workflowAvailableActions(): WorkflowAction[] {
    return this._workflowAvailableActions;
  }

  @Input('workflowAvailableActions')
  set workflowAvailableActions(value: WorkflowAction[]) {
    this._workflowAvailableActions = value;
    if (value != null) {
      // sorting buttons in reverse to match button order
      this.workflowActionLinks = value
        .filter(item => { return item.Name && item.Name !== ''; })
        .sort((a, b) => a.DisplayButtonOrder - b.DisplayButtonOrder);
      if (this.buttonSortDirection === ButtonBarSortDirection.RightToLeft) {
        this.workflowActionButtons = value
          .filter((action) => action.IsActionButton === true)
          .sort((a, b) => a.DisplayButtonOrder - b.DisplayButtonOrder);
      } else {
        this.workflowActionButtons = value
          .filter((action) => action.IsActionButton === true)
          .sort((a, b) => b.DisplayButtonOrder - a.DisplayButtonOrder);
      }
    } else {
      this.workflowActionLinks = [];
      this.workflowActionButtons = [];
    }
  }

  workflowActionButtons: WorkflowAction[];
  workflowActionLinks: WorkflowAction[];
  workflowAction: WorkflowAction = <WorkflowAction>{ Name: '' };

  applicationConstants: any;
  isFabOpen: boolean = false;
  @HostListener('window:resize', ['$event']) onResize(event) {
    if (this.isFabOpen) {
      this.isFabOpen = false;
    }
  }

  constructor(
    private router: Router,
    private ar: ActivatedRoute,
    private commonService: CommonService,
  ) {
    this.applicationConstants = commonService.ApplicationConstants;
  }

  ngOnInit() {

    this.repaintActionButtons();
  }

  ngOnChanges() {
    this.repaintActionButtons();
  }

  repaintActionButtons() {
    if (this.getActionButtonCssClass && this.workflowActionButtons) {
      this.workflowActionButtons.forEach(item => {
        (<any>item).CssClass = this.getActionButtonCssClass(item);
      });
    }
  }

  executeWorkflowAction(action: WorkflowAction) {
    this.workflowAction = action;
    if (action.TaskRoutingDialogTypeId === this.applicationConstants.TaskRoutingDialogType.Decline) {
      this.declineReason.open();
    } else {
      this.callWorkflowCommand.emit(action);
    }
    if (this.isMobileFab && this.isFabOpen) {
      this.toggleFab();
    }
  }

  declineReasonClosed(event: DialogComment) {
      if (event.ResultType === DialogResultType.OK) {
          this.workflowAction.Comments = event.Comment;
          this.callWorkflowCommand.emit(this.workflowAction);
      }
  }

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  ngOnDestroy() {
  }
}

