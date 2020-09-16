import { WindowRefService } from '../../../common/index';
import { WorkflowAction } from '../../../common/model/index';
import { DialogService } from '../../../common/services/dialog.service';
import { TimeSheet } from '../../model/index';
import { TimeSheetUtil } from '../../time-sheet.util';
import { TimeSheetService } from '../../service/time-sheet.service';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';

export class TimeSheetActionBaseComponent {

  timeSheet: TimeSheet;
  validationMessages: any;

  constructor(
    protected timeSheetService: TimeSheetService,
    protected windowRef: WindowRefService,
    protected uiService: TimeSheetUiService,
    protected dialogService: DialogService
  ) {
  }

  // getWorkflowButtonCssClass(action: WorkflowAction): string {
  //   if (
  //     action.CommandName.includes('Submit') ||
  //     action.CommandName.includes('Approve') ||
  //     action.CommandName.includes('Accept')) {
  //     return 'primary';
  //   } else {
  //     return '';
  //   }
  // }

  // callWorkflowCommand(action: WorkflowAction) {

  //   if (!action) {
  //     return;
  //   }

  //   let preValidationStatus = false;
  //   preValidationStatus = this.preValidateWorkflowAction(action);

  //   if (preValidationStatus) {
  //     this.continueWorkflowExecution(action);
  //   }
  // }

  // continueWorkflowExecution(action: WorkflowAction) {
  //   throw new Error('Not implemented!');
  //   // this.timeSheetService.executeWorkflowCommand(action, this.timeSheet).then(x => {
  //   //   this.validationMessages = null;

  //   // }).catch(err => {
  //   //   this.validationMessages = err;
  //   // });
  // }

  // preValidateWorkflowAction(action: WorkflowAction): boolean {
  //   const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(this.timeSheet.TimeSheetDays);

  //   switch (action.CommandName) {
  //     case 'SubmitTimeSheet':

  //       // Validation errors on TimeSheet Days
  //       this.timeSheetService.setDayValidation(this.timeSheet);
  //       if (this.timeSheet.Errors.showErrors) {

  //         this.windowRef.nativeWindow.scrollTo(0, 0);

  //         return false;

  //       }

  //       // Hours entered on a holiday
  //       if (timeSheetDaysList.filter(x => (x.Date.getDay() % 6 === 0 || x.IsHoliday === true) && TimeSheetUtil.timeSheetDetailsAsList(x.TimeSheetDetails).filter(y => y.UnitAmount > 0).length > 0 && Object.keys(x.TimeSheetDetails).length > 0).length > 0) {
  //         // show confirm dialog
  //         const message = this.uiService.getMessage('submitHoursHoliday');

  //         this.dialogService.confirm(message.title, message.body).then((button) => {
  //           this.continueWorkflowExecution(action);
  //         })
  //           .catch((e) => {
  //             console.log(e);
  //           });

  //         return false;
  //       }

  //       // Zero hours on a timesheet
  //       if (timeSheetDaysList.filter(x => Object.keys(x.TimeSheetDetails).length > 0).length === 0) {
  //         // show confirm dialog
  //         const message = this.uiService.getMessage('submitZeroHours');

  //         this.dialogService.confirm(message.title, message.body).then((button) => {
  //           this.continueWorkflowExecution(action);
  //         })
  //           .catch((e) => {
  //             console.log(e);
  //           });

  //         return false;
  //       }

  //       // no erros, still show confirm dialog
  //       const messageNoerror = this.uiService.getMessage('submitNoError');
  //       this.dialogService.confirm(messageNoerror.title, messageNoerror.body).then((button) => {
  //         this.continueWorkflowExecution(action);
  //       })
  //         .catch((e) => {
  //           console.log(e);
  //         });

  //       return false;

  //     case 'SetTimeSheetIndividualClientApproverToApproved':
  //     case 'ChangeTimeSheetStatusToSupportingDocumentAccepted':
  //     case 'AcceptAndApproveTimeSheetBackOfficeReview':
  //       // Hours entered on a holiday
  //       if (timeSheetDaysList.filter(x => (x.Date.getDay() % 6 === 0 || x.IsHoliday === true) && TimeSheetUtil.timeSheetDetailsAsList(x.TimeSheetDetails).filter(y => y.UnitAmount > 0).length > 0 && Object.keys(x.TimeSheetDetails).length > 0).length > 0) {
  //         // show confirm dialog
  //         const message = this.uiService.getMessage('approveHoliday');

  //         this.dialogService.confirm(message.title, message.body).then((button) => {
  //           this.continueWorkflowExecution(action);
  //         })
  //           .catch((e) => {
  //             console.log(e);
  //           });

  //         return false;
  //       }

  //       return true;

  //     default: return true;
  //   }
  // }
}
