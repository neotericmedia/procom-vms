import { TimesheetModuleResourceKeys } from './../../timesheet-module-resource-keys';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { NavigationService } from './../../../common/services/navigation.service';
import { PhxLocalizationService } from '../../../common/services/phx-localization.service';
import { UrlData } from '../../../common/services/urlData.service';
import { DialogService } from '../../../common/services/dialog.service';
import { ApiService, CommonService, WindowRefService } from './../../../common/index';
import { WorkflowAction, PhxInterceptPanelButtonModel, PhxInterceptPanelType, PhxConstants, StateAction, StateActionDisplayType, StateActionButtonStyle } from '../../../common/model/index';

import { TimeSheetService } from './../../service/time-sheet.service';
import { TimeSheetUiService } from './../../service/time-sheet-ui.service';
import { TimeSheet, TimeSheetDetailConflictType, TimeSheetLineManagement } from '../../model/index';
import { TimeSheetUtil } from './../../time-sheet.util';

import { TimeSheetActionBaseComponent } from '../shared/time-sheet-action-base.component';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class TimeSheetComponent extends TimeSheetActionBaseComponent implements OnInit, OnDestroy {
  private alive: boolean = true;
  private timesheetId: number;
  private unregisterList = [];

  stateActions: StateAction[];
  StateActionDisplayType = StateActionDisplayType;

  timeSheet: TimeSheet;
  timeSheetSubscription: Subscription;

  entityEventSubscription: Subscription;

  isDetailsSaving: boolean = false;
  validationMessages: {};

  lineManagement: TimeSheetLineManagement;
  lineManagementSubscription: Subscription;
  timeSheetWorkOrderConflicts: any;
  hasProjectConflict: boolean = false;
  hasRateTypeConflict: boolean = false;
  hasRateUnitConflict: boolean = false;
  rateTypeConflictIds: Array<number> = [];
  conflictButton: PhxInterceptPanelButtonModel = {
    ActionEventName: 'continue',
    DisplayText: 'common.generic.continu',
    ClassName: 'btn btn-primary',
    IsDisabled: false
  };

  PhxInterceptPanelType: typeof PhxInterceptPanelType = PhxInterceptPanelType;

  constructor(
    protected timeSheetService: TimeSheetService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private apiService: ApiService,
    private commonService: CommonService,
    private localizationService: PhxLocalizationService,
    private urlData: UrlData,
    protected windowRef: WindowRefService,
    protected uiService: TimeSheetUiService,
    protected dialogService: DialogService
  ) {
    super(timeSheetService, windowRef, uiService, dialogService);
  }

  ngOnInit() {
    this.applyLocalization();

    this.route.params.subscribe(params => {
      const id = +params['TimeSheetId'];
      if (this.timeSheetSubscription) {
        this.timeSheetSubscription.unsubscribe();
      }

      this.timeSheetSubscription = this.timeSheetService
        .getTimeSheetById(id, null, true)
        .takeWhile(() => this.alive)
        .subscribe(timeSheet => {
          this.timeSheet = timeSheet;

          if (this.timeSheet) {
            this._initStateActions();

            if (!this.lineManagementSubscription) {
              this.lineManagementSubscription = this.timeSheetService
                .getLineManagementByAssignmentIdFromState(this.timeSheet.AssignmentId)
                .takeWhile(() => this.alive)
                .subscribe(lm => {
                  if (lm && lm.capsuleStyleList) {
                    this.lineManagement = lm;
                  }
                });
            }

            let conflicts = [];
            const hasSave = this.timeSheet && this.timeSheet.AvailableStateActions && !!this.timeSheet.AvailableStateActions.find(x => x === this.commonService.ApplicationConstants.StateAction.TimesheetSaveTimesheetDetail);
            if (hasSave) {
              conflicts = this.timeSheetService.getTimeSheetWorkorderConflicts(this.timeSheet);
            }

            if (conflicts && conflicts.length > 0) {
              this.timeSheetWorkOrderConflicts = conflicts;

              this.timeSheetWorkOrderConflicts.forEach(conflictDay => {
                conflictDay.forEach(conflict => {
                  if (conflict.conflictTypes.indexOf(TimeSheetDetailConflictType.projectId) > -1) {
                    this.hasProjectConflict = true;
                  }

                  if (conflict.conflictTypes.indexOf(TimeSheetDetailConflictType.rateTypeId) > -1) {
                    this.hasRateTypeConflict = true;

                    if (this.rateTypeConflictIds.indexOf(conflict.timeSheetDetail.RateTypeId) === -1) {
                      this.rateTypeConflictIds.push(conflict.timeSheetDetail.RateTypeId);
                    }
                  }

                  if (conflict.conflictTypes.indexOf(TimeSheetDetailConflictType.rateUnitId) > -1) {
                    this.hasRateUnitConflict = true;
                  }
                });
              });
            } else {
              this.timeSheetWorkOrderConflicts = null;
              this.hasProjectConflict = false;
              this.hasRateTypeConflict = false;
              this.rateTypeConflictIds = [];
              this.hasRateUnitConflict = false;
            }
          }
        });

      this.timeSheetService
        .isTimeSheetSaving()
        .takeWhile(() => this.alive)
        .subscribe(isDetailsSaving => {
          this.isDetailsSaving = isDetailsSaving;
        });

      this.timeSheetService
        .getTimeSheetHeaders()
        .takeWhile(() => this.alive)
        .subscribe(headers => {
          if (this.timesheetId !== id) {
            this.timesheetId = id;
            this.navigationService.setTitle('timesheet', [this.timesheetId]);
          }
        });
      if (this.entityEventSubscription && !this.entityEventSubscription.closed) {
        this.entityEventSubscription.unsubscribe();
      }
      this.entityEventSubscription = this.apiService.entitySubscribe(this.commonService.ApplicationConstants.EntityType.TimeSheet, this.timesheetId, data => {
        this.timeSheetService.workflowUpdated();
        if (data.IsOwner === false) {
          this.commonService.logInfo(this.localizationService.translate('timesheet.messages.concurrencyMessage'));
          this.timeSheetService.getTimeSheetById(this.timesheetId, null, true, false);
        }
        if (data && data.unregister && typeof data.unregister === 'function') {
          this.unregisterList.push(data.unregister);
        }
      });
    });
  }
  clearTimeSheetErrors() {
    this.timeSheetService.clearTimeSheetError(this.timeSheet.Id, 'TimeSheetDays', null);
  }

  applyLocalization() {
    this.conflictButton.DisplayText = this.localizationService.translate(this.conflictButton.DisplayText);
  }

  getTimeSheetWorkorderConflicts() {
    this.timeSheetService.getTimeSheetWorkorderConflicts(this.timeSheet);
  }

  updateDetailsWithConflict() {
    this.timeSheetService.updateDetailsWithConflict(this.timeSheet, this.lineManagement);
  }

  onConflictContinue(actionEventName: string) {
    this.conflictButton.IsDisabled = true;
    this.updateDetailsWithConflict();
  }

  ngOnDestroy() {
    this.alive = false;
    this.urlData.clearUrl();
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
    if (this.entityEventSubscription && !this.entityEventSubscription.closed) {
      this.entityEventSubscription.unsubscribe();
    }
  }

  _initStateActions() {
    this.stateActions = [
      {
        displayText: this.localizationService.translate(TimesheetModuleResourceKeys.stateHandlers.submit),
        commandName: 'TimesheetSubmit',
        actionId: this.commonService.ApplicationConstants.StateAction.TimesheetSubmit,
        disabledFn: () => this.isDetailsSaving || !this.timeSheet.IsPreviousSubmitted,
        onClick: (action, componentOption, actionOption) => {
          this.validationMessages = {};
          this.timeSheetService.validateCommand(action.commandName, this.timeSheet, this.dialogService).then(result => {
            if (result) {
              this.timeSheetService.executeCommand(action.commandName, null, this.timeSheet).catch(error => {
                this.commonService.logError('Error submitting Timesheet');
                this.validationMessages = this.parseValidationMessages(error.ModelState);
              });
            }
          });
        },
        style: StateActionButtonStyle.PRIMARY
      },
      {
        displayText: this.localizationService.translate(TimesheetModuleResourceKeys.stateHandlers.approve),
        commandName: 'TimesheetApprove',
        actionId: this.commonService.ApplicationConstants.StateAction.TimesheetApprove,
        onClick: (action, componentOption, actionOption) => {
          this.validationMessages = {};
          this.timeSheetService.validateCommand(action.commandName, this.timeSheet, this.dialogService).then(result => {
            if (result) {
              this.timeSheetService.executeCommand(action.commandName, null, this.timeSheet).catch(error => {
                this.commonService.logError('Error approving Timesheet');
                this.validationMessages = this.parseValidationMessages(error.ModelState);
              });
            }
          });
        },
        style: StateActionButtonStyle.PRIMARY
      },
      {
        displayText: this.localizationService.translate(TimesheetModuleResourceKeys.stateHandlers.decline),
        showDeclinedCommentDialog: true,
        commandName: 'TimesheetDecline',
        actionId: this.commonService.ApplicationConstants.StateAction.TimesheetDecline,
        onClick: (action, componentOption, actionOption) => {
          this.validationMessages = {};
          this.timeSheetService.validateCommand(action.commandName, this.timeSheet, this.dialogService).then(result => {
            if (result) {
              this.timeSheetService.executeCommand(action.commandName, actionOption && actionOption.comment, this.timeSheet).catch(error => {
                this.commonService.logError('Error declining Timesheet');
                this.validationMessages = this.parseValidationMessages(error.ModelState);
              });
            }
          });
        }
      },
      {
        displayText: this.localizationService.translate(TimesheetModuleResourceKeys.stateHandlers.recall),
        commandName: 'TimesheetRecall',
        actionId: this.commonService.ApplicationConstants.StateAction.TimesheetRecall,
        onClick: (action, componentOption, actionOption) => {
          this.validationMessages = {};
          this.timeSheetService.validateCommand(action.commandName, this.timeSheet, this.dialogService).then(result => {
            if (result) {
              this.timeSheetService.executeCommand(action.commandName, actionOption && actionOption.comment, this.timeSheet).catch(error => {
                this.commonService.logError('Error recalling Timesheet');
                this.validationMessages = this.parseValidationMessages(error.ModelState);
              });
            }
          });
        }
      },
      {
        displayText: this.localizationService.translate(TimesheetModuleResourceKeys.stateHandlers.unsubmit),
        commandName: 'TimesheetUnsubmitTimesheetAndReverseTransactionState',
        actionId: this.commonService.ApplicationConstants.StateAction.TimesheetUnsubmitTimesheetAndReverseTransactionState,
        onClick: (action, componentOption, actionOption) => {
          this.validationMessages = {};
          this.timeSheetService.validateCommand(action.commandName, this.timeSheet, this.dialogService).then(result => {
            if (result) {
              this.timeSheetService.executeCommand(action.commandName, actionOption && actionOption.comment, this.timeSheet).catch(error => {
                this.commonService.logError('Error unsubmitting Timesheet');
                this.validationMessages = this.parseValidationMessages(error.ModelState);
              });
            }
          });
        }
      }
    ];
  }
  parseValidationMessages(messages: any) {
    const result = {};
    if (messages) {
      Object.keys(messages).forEach(item => {
        if (item !== 'Procom.Phoenix.CQL') {
          result[item] = messages[item];
        }
      });
      return Object.assign({}, { ModelState: result });
    } else {
      // this.expenseClaimService.clearItemsValidationErrors(this.expenseClaim.Id);
      return {};
    }
  }
}
