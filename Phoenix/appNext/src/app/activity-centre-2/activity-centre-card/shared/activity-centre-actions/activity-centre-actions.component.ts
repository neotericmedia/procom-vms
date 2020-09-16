import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants, CommonService, LoadingSpinnerService, DialogService, PhxLocalizationService } from '../../../../common';
import { CardBase, TimeSheetActionCommand, ActivityCentreModuleResourceKeys } from '../../../model';
import { ActivityCentreService } from '../../../shared/activity-centre.service';
import { TimeSheetUiService } from '../../../../time-sheet/service/time-sheet-ui.service';
import { BaseComponentOnDestroy } from '../../../../common/state/epics/base-component-on-destroy';
import { TimeSheetConfirmationMessage } from '../../../../time-sheet/model';

@Component({
  selector: 'app-activity-centre-actions',
  templateUrl: './activity-centre-actions.component.html',
  styleUrls: ['./activity-centre-actions.component.less']
})
export class ActivityCentreActionsComponent extends BaseComponentOnDestroy {
  @Input() card: CardBase;
  @Output() actionExecuted = new EventEmitter<TimeSheetActionCommand>();
  phxConstants: typeof PhxConstants;

  constructor(
    private acs: ActivityCentreService,
    private commonService: CommonService,
    private loader: LoadingSpinnerService,
    private uiService: TimeSheetUiService,
    private localizationService: PhxLocalizationService,
    private dialogService: DialogService
  ) {
    super();
    this.phxConstants = PhxConstants;
  }

  executeCommand(commandId: number) {
    const actions = {
      [PhxConstants.StateAction.TimesheetApprove]: () => {
        const command: TimeSheetActionCommand = {
          CommandName: 'TimesheetApprove',
          LastModifiedDatetime: new Date(Date.now()),
          TimeSheetId: this.card.EntityId
        };

        const message = !this.card.HasUnitsOnHolidayWeekend
          ? {
            title: this.localizationService.translate(ActivityCentreModuleResourceKeys.confirmations.confirmTitle),
            body: this.localizationService.translate(ActivityCentreModuleResourceKeys.confirmations.approveTimeSheetBody)
          }
          : this.uiService.getMessage('approveHoliday');
        this.dialogService
          .confirm(message.title, message.body, {
            windowClass: 'modal-dialog modal-lg'
          })
          .then(button => {
            this.loader.show();
            this.acs
              .timeSheetApprove(command)
              .takeUntil(this.isDestroyed$)
              .subscribe(
                res => {
                  if (res.IsValid) {
                    this.commonService.logSuccess(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.successApproveSingular));
                  } else {
                    // TODO: Ensure that the resource key has been added
                    this.commonService.logWarning(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.failedApprovalSingular));
                  }

                  this.actionExecuted.emit(command);
                  this.loader.hide();
                },
                err => {
                  // TODO: Ensure that the resource key has been added
                  this.commonService.logWarning(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.failedApprovalSingular));
                  this.loader.hide();
                  // this.actionExecuted.emit(command);
                }
              );
          })
          .catch(e => {
            console.log(e);
          });
      },
      [PhxConstants.StateAction.TimesheetDecline]: () => {
        const command: TimeSheetActionCommand = {
          CommandName: 'TimesheetDecline',
          LastModifiedDatetime: new Date(Date.now()),
          TimeSheetId: this.card.EntityId
        };

        const message: TimeSheetConfirmationMessage = {
          title: this.localizationService.translate(ActivityCentreModuleResourceKeys.actionBar.decline),
          body: this.localizationService.translate('common.phxWorkflowButtons.declineHelpblock', (this.localizationService.translate(ActivityCentreModuleResourceKeys.actionBar.decline)))
        };

        this.dialogService
          .comment(message.title,
            message.body,
            this.localizationService.translate('common.phxWorkflowButtons.declineReasonLabel', message.title.toLowerCase()), 4000,
            this.localizationService.translate(ActivityCentreModuleResourceKeys.actionBar.decline), {
              windowClass: 'modal-dialog modal-lg'
            })
          .then((comment: string) => {
            this.loader.show();
            command.Comment = comment;

            if (comment) {
              if (comment.length < 3) {
                this.commonService.logWarning(ActivityCentreModuleResourceKeys.messages.declineReasonLength);
                this.loader.hide();
                return;
              }
            } else {
              return;
            }

            this.acs.timeSheetDecline(command).takeUntil(this.isDestroyed$).subscribe(res => {

              if (res.IsValid) {
                this.commonService.logSuccess(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.successDeclineSingular));
              } else {
                // TODO: Ensure that the resource key has been added
                this.commonService.logWarning(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.failedDeclineSingular));
              }

              this.actionExecuted.emit(command);
              this.loader.hide();
            }, err => {
              // TODO: Ensure that the resource key has been added
              this.commonService.logWarning(this.localizationService.translate(ActivityCentreModuleResourceKeys.messages.failedDeclineSingular));
              this.loader.hide();
              this.actionExecuted.emit(command);
            });
          }).catch(e => {
            console.log(e);
          });
      }
    };

    if (actions.hasOwnProperty(commandId)) {
      actions[commandId]();
    } else {
      this.commonService.logWarning('The action yet has to be implemented');
    }
  }
}
