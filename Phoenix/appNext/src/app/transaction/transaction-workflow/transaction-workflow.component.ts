// angular
import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// common
import { PhxConstants, ApiService, CommonService, LoadingSpinnerService, CodeValueService } from '../../common/index';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import {
  PhxDialogComponentConfigModel,
  PhxDialogComponentConfigModelDate,
  PhxDialogComponentConfigModelComment,
  PhxDialogComponentEventEmitterInterface,
  PhxDialogComponentConfigModelDropdown
} from '../../common/components/phx-dialog/phx-dialog.component.model';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { TransactionAction } from '../state';
import { forEach, values } from 'lodash';

@Component({
  selector: 'app-transaction-workflow',
  templateUrl: './transaction-workflow.component.html'
})
export class TransactionWorkflowComponent extends BaseComponentActionContainer {
  static lineNumber: number;
  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  @Output() commandExecuted = new EventEmitter<any>();
  codeValueGroups: any;
  @Output() commandValidation = new EventEmitter<any>();

  private modelvalMessages: Array<any> = [];
  private validationMessages: Array<any>;
  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private codeValueService: CodeValueService
  ) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  public onClickStateAction(action: PhxConstants.StateAction, transaction: any) {
    const map = {
      [PhxConstants.StateAction.TransactionHeaderAddTransactionLine]: () => {
        this.commandExecuteByApi(transaction, action, 'Line Added Successfully');
      },
      [PhxConstants.StateAction.TransactionHeaderDiscard]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Transaction Action',
          BodyMessage: 'Are you sure you want to discard this Transaction?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Discard Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Discarded');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderDiscardTransactionLine]: () => {
        this.commandExecuteByApi(transaction, action);
      },
      [PhxConstants.StateAction.TransactionHeaderSave]: () => {
        this.commandExecuteByApi(transaction, action, 'Saved Successfully');
      },
      [PhxConstants.StateAction.TransactionHeaderSubmit]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Transaction Action',
          BodyMessage: 'Are you sure you want to submit this Transaction?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Submit Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Submitted');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderReverseTransaction]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Transaction Only',
          BodyMessage: 'Enter the reversal reason:',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, this.phxDialogComponentConfigModel, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDropdown: {
            Label: 'Reversal Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            PlaceHolder: ' Reasons',
            DropDownList: this.codeValueService.getCodeValues(this.codeValueGroups.TransactionHeaderReversalReason, true)
          },
          ObjectDate: null,
          ObjectComment: {
            Label: 'Reversal Message',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000,
            PlaceHolder: ' Write reversal reason here...'
          }
        };
        this.phxDialogComponent.open();
      },

      [PhxConstants.StateAction.TransactionHeaderReverseTransactionAndUnsubmitTimeSheet]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Transaction and Unsubmit Timesheet',
          BodyMessage: 'Enter the reversal reason:',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDropdown: {
            Label: 'Reversal Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            PlaceHolder: ' Reasons',
            DropDownList: this.codeValueService.getCodeValues(this.codeValueGroups.TransactionHeaderReversalReason, true)
          },
          ObjectDate: null,
          ObjectComment: {
            Label: 'Reversal Message',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000,
            PlaceHolder: ' Write reversal reason here...'
          }
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderReverseTransactionAndSendTimeSheetToException]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Transaction and send Timesheet to Timesheet Exception',
          BodyMessage: 'Enter the reversal reason:',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDropdown: {
            Label: 'Reversal Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            PlaceHolder: ' Reasons',
            DropDownList: this.codeValueService.getCodeValues(this.codeValueGroups.TransactionHeaderReversalReason, true)
          },
          ObjectDate: null,
          ObjectComment: {
            Label: 'Reversal Message',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000,
            PlaceHolder: ' Write reversal reason here...'
          }
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderReverseTransactionAndUnsubmitExpenseClaim]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Transaction and UnSubmit Expense Claim',
          BodyMessage: 'Enter the reversal reason:',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDropdown: {
            Label: 'Reversal Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            PlaceHolder: ' Reasons',
            DropDownList: this.codeValueService.getCodeValues(this.codeValueGroups.TransactionHeaderReversalReason, true)
          },
          ObjectDate: null,
          ObjectComment: {
            Label: 'Reversal Message',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000,
            PlaceHolder: ' Write reversal reason here'
          }
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderReverseTransactionAndSendExpenseClaimToException]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Transaction and Return Expense Claim',
          BodyMessage: 'Enter the reversal reason:',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDropdown: {
            Label: 'Reversal Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            PlaceHolder: ' Reasons',
            DropDownList: this.codeValueService.getCodeValues(this.codeValueGroups.TransactionHeaderReversalReason, true)
          },
          ObjectDate: null,
          ObjectComment: {
            Label: 'Reversal Message',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000,
            PlaceHolder: ' Write reversal reason here...'
          }
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderReverseTransactionAndAdvance]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Advance Transaction',
          BodyMessage: 'This "Advance" Transaction will be Reversed. Continue?',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: false,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDate: null,
          ObjectComment: null,
          ObjectDropdown: null
        };
        this.phxDialogComponent.open();
      },
      [PhxConstants.StateAction.TransactionHeaderReverseTransactionAndAdjustment]: () => {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Reverse Adjustment Transaction',
          BodyMessage: 'Enter the reversal reason:',
          Buttons: [
            {
              Id: 1,
              SortOrder: 2,
              CheckValidation: true,
              Name: 'Reverse Transaction',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.commandExecuteByDialog(transaction, action, callBackObj.config, 'Transaction Reversed');
              }
            },
            { Id: 2, SortOrder: 1, CheckValidation: false, Name: 'Cancel', Class: 'btn-default' }
          ],
          ObjectDropdown: {
            Label: 'Reversal Reason',
            Value: '',
            IsRequared: true,
            HelpBlock: null,
            AdditionalNote: 'TransactionHeaderActionReverseAdjustment',
           PlaceHolder: ' Reasons',
           DropDownList: [{ id: 7, text: 'Incorrect Tax' }, { id: 8, text: 'Incorrect PO' }, { id: 9, text: 'Incorrect Payroll Burden' }]
          },
          ObjectDate: null,
          ObjectComment: {
            Label: 'Reversal Message',
            HelpBlock: '',
            Value: '',
            IsRequared: true,
            LengthMin: 1,
            LengthMax: 1000,
           PlaceHolder: ' Write reversal reason here...'
          }
        };
        this.phxDialogComponent.open();
      }
    };
    map[action]();
  }

  private commandExecuteByDialog(transaction: any, stateAction: PhxConstants.StateAction, model: PhxDialogComponentConfigModel, messageOnSuccessResponse?: string) {
    this.phxDialogComponent.close();
    this.commandExecuteByApi(transaction, stateAction, messageOnSuccessResponse, model.ObjectComment, model.ObjectDropdown).then(x => this.commandExecuted.emit(x));
  }

  private commandExecuteByApi(
    transaction: any,
    stateAction: PhxConstants.StateAction,
    messageOnSuccessResponse?: string,
    phxDialogComponentConfigModelComment?: PhxDialogComponentConfigModelComment,
    phxDialogComponentConfigModelDropdown?: PhxDialogComponentConfigModelDropdown
  ) {
    this.phxDialogComponent.close();
    this.validationMessages = null;
    const transactionId = transaction.Id;
    let commandBody: any = null;
    const commandName = PhxConstants.StateAction[stateAction];

    if (
      stateAction === PhxConstants.StateAction.TransactionHeaderSave ||
      stateAction === PhxConstants.StateAction.TransactionHeaderAddTransactionLine ||
      stateAction === PhxConstants.StateAction.TransactionHeaderSubmit
    ) {
      commandBody = {
        CommandName: commandName,
        TransactionHeader: transaction,
        EntityIds: [transaction.Id]
      };
    } else if (stateAction === PhxConstants.StateAction.TransactionHeaderDiscardTransactionLine) {
      commandBody = {
        CommandName: commandName,
        TransactionHeaderId: transaction.Id,
        EntityIds: [transaction.Id],
        TransactionLineNumber: TransactionWorkflowComponent.lineNumber
      };
    } else if (stateAction === PhxConstants.StateAction.TransactionHeaderDiscard) {
      commandBody = {
        CommandName: commandName,
        TransactionHeaderId: transaction.Id,
        EntityIds: [transaction.Id],
      };
    } else if (
      stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransaction ||
      stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransactionAndUnsubmitTimeSheet ||
      stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransactionAndSendTimeSheetToException ||
      stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransactionAndUnsubmitExpenseClaim ||
      stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransactionAndSendExpenseClaimToException
    ) {
      const transactionReverseDialogConfig = {
        title: stateAction,
        header: 'Enter the reversal reason:',
        commentHeader: 'Reversal Message',
        buttonNameForCancel: 'Cancel',
        buttonNameForSave: 'Reverse Transaction',
        reverseReasonOptions: this.codeValueService.getCodeValues(this.codeValueGroups.TransactionHeaderReversalReason, true)
      };

      const commentdata = phxDialogComponentConfigModelComment != null && phxDialogComponentConfigModelComment.Value != null ? phxDialogComponentConfigModelComment.Value : null;
      const reverseReasonText = transactionReverseDialogConfig.reverseReasonOptions.find(i => i.id === Number(phxDialogComponentConfigModelDropdown.Value)).code;
      const comment = 'Reversal Reason: ' + reverseReasonText + '\n Message: ' + commentdata;
      commandBody = { CommandName: commandName, EntityIds: [transaction.Id], Comment: comment };
    } else if (stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransactionAndAdvance) {
      const comment = null;
      commandBody = { CommandName: commandName, EntityIds: [transaction.Id], Comment: comment };
    } else if (stateAction === PhxConstants.StateAction.TransactionHeaderReverseTransactionAndAdjustment) {
      const transactionReverseDialogConfig = {
        title: stateAction,
        header: 'Enter the reversal reason:',
        commentHeader: 'Reversal Message',
        buttonNameForCancel: 'Cancel',
        buttonNameForSave: 'Reverse Transaction',
        reverseReasonOptions: [{ id: 7, text: 'Incorrect Tax' }, { id: 8, text: 'Incorrect PO' }, { id: 9, text: 'Incorrect Payroll Burden' }]
      };
      const commentdata = phxDialogComponentConfigModelComment != null && phxDialogComponentConfigModelComment.Value != null ? phxDialogComponentConfigModelComment.Value : null;
      const reverseReasonText = transactionReverseDialogConfig.reverseReasonOptions.find(i => i.id === Number(phxDialogComponentConfigModelDropdown.Value)).text;
      const comment = 'Reversal Reason: ' + reverseReasonText + '\n Message: ' + commentdata;
      commandBody = { CommandName: commandName, EntityIds: [transaction.Id], Comment: comment };
    } else {
      alert('Action is not supported');
    }
    const p = new Promise((resolve, reject) => {
      this.apiService
        .command(commandBody.CommandName, commandBody)
        .then(responseSuccessOnExecuteCommand => {
          this.modelvalMessages = [];
          this.commandValidation.emit(this.modelvalMessages);

          if (messageOnSuccessResponse && messageOnSuccessResponse.length > 0) {
            this.commonService.logSuccess(messageOnSuccessResponse);
          }

          if (stateAction === PhxConstants.StateAction.TransactionHeaderDiscard) {
            const navigateTo = (assignmentId: number, workOrderId: number, workOrderVersionId: number) => {
              const navigatePath = `/next/workorder/${assignmentId}/${workOrderId}/${workOrderVersionId}/core`;
              this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
                console.error(`app-transaction: error navigating to Work Order: ${workOrderId}`, err);
              });
            };

            navigateTo(transaction.AssignmentId, transaction.WorkOrderId, transaction.WorkOrderVersionId);
          } else {
            // const navigationTo = (transactionIdNavigateTo: number, tabNavigationName: any) => {
            //   const navigatePath = `/next/transaction/${transactionIdNavigateTo}/${tabNavigationName}`;
            //   this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
            //     console.error(`app-transaction: error navigating to ${transactionIdNavigateTo} , ${tabNavigationName}`, err);
            //   });
            // };

            // navigationTo(transactionId, 'detail');

            this.stateService.dispatchOnAction(new TransactionAction.TransactionDelete(transactionId));
          }
        })
        .catch(responseExceptionOnExecuteCommand => {
          console.error(stateAction, commandBody, responseExceptionOnExecuteCommand);
          this.validationMessages = responseExceptionOnExecuteCommand;
          this.parseValidationMessages(transactionId, transaction);
          reject(responseExceptionOnExecuteCommand);
        });
    });

    return p;
  }

  private parseValidationMessages(transactionId: number, transaction) {
    this.modelvalMessages = [];
    const result = {};
    let checkInvalid = true;
    if (this.validationMessages) {
      Object.keys(this.validationMessages).forEach(item => {
        if (item === 'ValidationMessages' && Object.keys(this.validationMessages[item]).length) {
          checkInvalid = false;
          const val = values(this.validationMessages['ValidationMessages']);
          forEach(val, value => {
            this.modelvalMessages.push(value.Message);
          });
        }
        if (checkInvalid) {
          if (item === 'ModelState' && Object.keys(this.validationMessages[item]).length) {
            const val = values(this.validationMessages['ModelState']);
            forEach(val, value => {
              for (let index = 0; index < value.length; index++) {
                const msg = value[index];
                this.modelvalMessages.push(msg);
              }
            });
          } else {
            this.commonService.logError(String(this.validationMessages['Message']));
          }
        }
      });
      if (this.modelvalMessages.length > 0) {
        this.commonService.logError('Your Submission has ' + this.modelvalMessages.length + ' validation message(s)');
        this.commandValidation.emit(this.modelvalMessages);
      }
      this.stateService.dispatchOnAction(new TransactionAction.TransactionValidationErrorAdd(transactionId, this.validationMessages));
    } else {
      this.stateService.dispatchOnAction(new TransactionAction.TransactionValidationErrorDelete(transactionId));
    }
  }
}
