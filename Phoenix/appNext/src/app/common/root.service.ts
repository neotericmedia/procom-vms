import { Injectable } from '@angular/core';
import { SignalrService } from './services/signalr.service';
import { PhxLocalizationService } from './services/phx-localization.service';
import { DialogService } from '.';
import { CommonService } from './services/common.service';
import { PhxConstants } from '../common';
import * as _ from 'lodash';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import { StateService } from './state/state.module';
import { EventService } from './services/event.service';
import { CommonDataService } from './services/commonData.service';

declare var window;

const ApplicationConstants = PhxConstants;

@Injectable()
export class RootService {
  localization = {
    feedbackLabel: 'account.menu.feedbackLabel',
    manageAccountLabel: 'account.menu.manageAccountLabel',
    settingsLabel: 'account.menu.settingsLabel',
    signOutLabel: 'account.menu.signOutLabel',
    menuLabel: 'account.menu.menuLabel',
    editFavoritesLabel: 'account.menu.editFavoritesLabel',
    addToFavoritesLabel: 'account.menu.addToFavoritesLabel'
  };

  isProduction = window.isProduction;
  model = { tasks: [] };
  disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting = false;

  name = ''; // $state.$current.name;

  homeAccountPattern = /(^home(\.|$)|^account(\.|$)|^register(\.|$)|^error(\.|$))|^accountforgot(\.|$)|^reset(\.|$)|^profile-selector(\.|$)|^logout(\.|$)|^view-email-in-browser(\.|$)|^document-view(\.|$)|^unavailable(\.|$)/;
  hideDash = name === '' || this.homeAccountPattern.test(name);

  constructor(
    private signalrSvc: SignalrService,
    private apiSvc: ApiService,
    private localizationSvc: PhxLocalizationService,
    private dialogSvc: DialogService,
    private commonSvc: CommonService,
    private stateSvc: StateService,
    private router: Router,
    private eventSvc: EventService,
    private commonDataSvc: CommonDataService
  ) { }

  redirectToWorkorder(data: any) {
    if (data.ParentEntityId > 0) {
      // $rootScope.$state.transitionTo('workorder.edit', {assignmentId: 0, workOrderId: data.ParentEntityId, workOrderVersionId: 0});
      this.router.navigate(['workorder.edit', { assignmentId: 0, workOrderId: data.ParentEntityId, workOrderVersionId: 0 }]);
    } else {
      // $rootScope.$state.transitionTo('ngtwo.m', { p: "workorder/search" });
      this.router.navigate(['workorder/search']);
    }
  }

  init() {
    this.apiSvc
      .onPrivate(
        'HandlerExecuteException',
        (event, data) => {
          this.dialogSvc
            .notify(this.localizationSvc.translate('common.generic.handlerExecuteExceptionTitle'), '<strong>' + this.localizationSvc.translate('common.generic.handlerExecuteExceptionMessage') + '</strong><br/><br/>' + data.Message, {
              backdrop: 'static'
            });
        },
        true
      )
      .then(unregister => { });

    this.signalrSvc
      .onPublic(
        'WorkflowProcess',
        (event, data) => {
          this.eventSvc.trigger('broadcastEvent:WorkflowProcess', data);
        },
        true
      )
      .then(unregister => { });

      // Follwing block of code needs refactoring as this wasn't properly migrated from AngularJS to Angular
      // Profile related code has been taken out and added to contact component
      // Similar to profile, pieces from this block should be implemented in their respective components to provide component level event handling
      // This is commented out for now (2019-03-08) due to low priority
  /*  this.apiSvc
      .onPublic('NonWorkflowEvent', (event, data) => {
        if (
          // $rootScope.$state.includes('org.edit') &&
          data.EntityTypeId === ApplicationConstants.EntityType.Organization &&
          // && data.EntityId == $rootScope.$state.params.organizationId
          data.ReferenceCommandName === 'OrganizationDelete'
        ) {
          if (data.IsOwner) {
            // unregisterList();
            // $rootScope.$state.transitionTo('ngtwo.m', { p: "organization/search" });
            this.router.navigate(['organization/search']);
          } else {
            // if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }
            this.dialogSvc.notify('Organization update information', data.Message, { backdrop: 'static' }).then((btn) => {
              // unregisterList();
              // $rootScope.$state.transitionTo('ngtwo.m', { p: "organization/search" });
              this.router.navigate(['organization/search']);
            });
          }
        } else if (
          // $rootScope.$state.includes('compliancedocument.documentrule.edit') &&
          data.EntityTypeId === ApplicationConstants.EntityType.ComplianceDocumentRule &&
          // data.EntityId === $rootScope.$state.params.complianceDocumentRuleId &&
          data.ReferenceCommandName === 'ComplianceDocumentRuleDelete'
        ) {
          if (data.IsOwner) {
            // unregisterList();
            this.router.navigate(['compliance/document-rule/search/' + data.CustomId]);
          } else {
            // if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }
            this.dialogSvc.notify('Compliance Document Rule Deleted', data.Message, { backdrop: 'static' }).then((btn) => {
              // unregisterList();
              this.router.navigate(['compliance/document-rule/search/' + data.CustomId]);
            });
          }
        } else if (
          // $rootScope.$state.includes('commission.rate') &&
          data.EntityTypeId === ApplicationConstants.EntityType.CommissionRateHeader
          // && data.EntityId == $rootScope.$state.params.commissionRateHeaderId
        ) {
          if (data.ReferenceCommandName === 'CommissionRateDelete') {
            if (data.IsOwner) {
              // unregisterList();
              // $rootScope.$state.transitionTo('ngtwo.m', { p: "commission/rates-search/" + data.CustomId });
              this.router.navigate(['commission/rates-search/' + data.CustomId]);
            } else {
              this.dialogSvc.notify('Commission Rate update information', data.Message, { backdrop: 'static' }).then((btn) => {
                // unregisterList();
                this.router.navigate(['commission/rates-search/' + data.CustomId]);
              });
            }
          }
        } else if (
          // $rootScope.$state.includes('workorder.edit') &&
          data.EntityTypeId === ApplicationConstants.EntityType.WorkOrder &&
          // data.EntityId == $rootScope.$state.params.workOrderId &&
          data.ReferenceCommandName === 'WorkOrderDelete'
        ) {
          if (data.IsOwner) {
            // unregisterList();
            this.redirectToWorkorder(data);
          } else {
            // if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }
            this.dialogSvc.notify('WorkOrder update information', data.Message, { backdrop: 'static' }).then((btn) => {
              // unregisterList();
              this.redirectToWorkorder(data);
            });
          }
        }

        if (!data.IsOwner) {
          if (
            // $rootScope.$state.is('purchaseorder.edit.details') &&
            data.EntityTypeId === ApplicationConstants.EntityType.PurchaseOrder // && data.EntityId == $rootScope.$state.params.purchaseOrderId
          ) {
            if (data.ReferenceCommandName === 'PurchaseOrderDiscard') {
              this.dialogSvc.notify('Purchase Order update information', data.Message, { backdrop: 'static' }).then((btn) => {
                // unregisterList();
                // $rootScope.$state.transitionTo('purchaseorder.search', {}, { reload: true, inherit: true, notify: true });
                this.router.navigate(['ContactCreate.Search', { reload: true, inherit: true, notify: true }]);
              });
            }
            if (data.ReferenceCommandName === 'PurchaseOrderSave' || data.ReferenceCommandName === 'PurchaseOrderSubmit') {
              this.dialogSvc.notify('Purchase Order update information', data.Message, { backdrop: 'static' }).then((btn) => {
                // unregisterList();
                // $rootScope.$state.transitionTo('purchaseorder.edit.details', { purchaseOrderId: data.EntityId }, { reload: true, inherit: true, notify: true });
                this.router.navigate(['purchaseorder.edit.details', { reload: true, inherit: true, notify: true }]);
              });
            }
          } else if (
            // $rootScope.$state.includes('purchaseorder.search') &&
            data.EntityTypeId === ApplicationConstants.EntityType.PurchaseOrder
          ) {
            if (data.ReferenceCommandName === 'PurchaseOrderDiscard' || (data.ReferenceCommandName === 'PurchaseOrderSave' && data.EntityId === 0)) {
              this.dialogSvc.notify('Purchase Order update information', data.Message, { backdrop: 'static' }).then((btn) => {
                // unregisterList();
                // $rootScope.$state.transitionTo('purchaseorder.search', {}, { reload: true, inherit: true, notify: true });
                this.router.navigate(['purchaseorder.search', { reload: true, inherit: true, notify: true }]);
              });
            }
          }
        }
      })
      .then(unregister => {
        // this.unregisterList.push(unregister);
      });
    // , true);*/

    this.apiSvc.onPrivate(
      'BulkRegistrationInviteEvent',
      (event, data) => {
        // to fix:
        // if (data.CountTotal > 0) {
        //   this.globalSpinnerProgressText = data.CountFinishedWithSuccess + ' of ' + data.CountTotal + ' items processed.';
        // } else {
        //   this.globalSpinnerProgressText = '';
        //   this.activateGlobalSpinner = false;

        if (data.LogWarning !== null && data.LogWarning.length > 0) {
          this.commonSvc.logWarning(data.LogWarning);
        }

        if (data.LogSuccess !== null && data.LogSuccess.length > 0) {
          this.commonSvc.logSuccess(data.LogSuccess);
        }
        // }
      },
      true
    );

    this.signalrSvc
      .onPrivate(
        'ScheduledProcessEvent',
        (event, data) => {
          if (data.LogWarning !== null && data.LogWarning.length > 0) {
            this.commonSvc.logWarning(data.LogWarning);
          }
          if (data.LogError !== null && data.LogError.length > 0) {
            this.commonSvc.logError(data.LogError);
          }
          if (
            data.StateNameToGo !== null &&
            data.StateNameToGo.length > 0 &&
            data.StateNameToCancelRedirection === null && // || !$rootScope.$state.includes(data.StateNameToCancelRedirection)
            data.LogSuccess !== null &&
            data.LogSuccess.length > 0
          ) {
            const stateParamMapping: any = {};

            _.forEach(data.StateParams, (stateParam) => {
              stateParamMapping[stateParam.Name] = stateParam.Value;
            });

            if (data.ResultToDialog) {
              this.dialogSvc.confirm('Scheduled Process is Finished', data.LogSuccess + '\n' + 'The current page will be redirected to the Scheduled Process resulting page. Continue?').then(
                (btn) => {
                  const result = 'Confirmed';
                  const p = 'transaction/vms-preprocess/' + stateParamMapping.organizationIdInternal + '/' + stateParamMapping.organizationIdClient + '/' + stateParamMapping.documentPublicId;
                  // if (!_.includes($rootScope.$state.params.p, p)) {
                  // $rootScope.$state.transitionTo('ngtwo.m', { p: p });
                  this.router.navigate(['/', { p: p }]);
                  // }
                },
                (btn) => {
                  // var result = 'Not Confirmed';
                }
              );
            } else {
              if (data.LogSuccess !== null && data.LogSuccess.length > 0) {
                this.commonSvc.logSuccess(data.LogSuccess);
              }
              const p = Object.assign(stateParamMapping, { reload: true, inherit: true, notify: true });
              // $rootScope.$state.transitionTo(data.StateNameToGo, stateParamMapping, { reload: true, inherit: true, notify: true });
              this.router.navigate([data.StateNameToGo, p]);
            }
          }
        },
        true
      )
      .then(unregister => { });

    this.apiSvc
      .onPrivate(
        'WorkflowMigration_ExistingEntityPushToWorkflow',
        (event, data) => {
          const newLine = '\n<br/>';
          let workflowMigrationResult = newLine + 'Total: ' + data.CountTotal + newLine + 'Success: ' + data.CountSuccess + newLine + 'Exception: ' + data.CountException + newLine + newLine + 'Workflow Migrations By Groups:';
          _.forEach(data.WorkflowMigrationGroupByCommandNames, (group) => {
            workflowMigrationResult =
              workflowMigrationResult +
              newLine +
              newLine +
              'Group Name: "' +
              group.GroupCommandName +
              '"' +
              newLine +
              'Total: ' +
              group.CountTotal +
              newLine +
              'Success: ' +
              group.CountSuccess +
              newLine +
              'Exception: ' +
              group.CountException;
          });
          this.dialogSvc.notify('Workflow Migration Process is Finished', workflowMigrationResult, { backdrop: 'static' }).then((btn) => {
            // unregisterList();
          });
        },
        true
      )
      .then(unregister => { });

    this.eventSvc.subscribe('broadcastEvent:WorkflowProcess', data => {
      const watchConfigOnWorkflowEvent = this.commonDataSvc.getWatchConfigOnWorkflowEvent();
      if (data.IsOwner) {
        if (
          watchConfigOnWorkflowEvent.stateNameGo.length > 0 &&
          watchConfigOnWorkflowEvent.groupingEntityTypeId > 0 &&
          watchConfigOnWorkflowEvent.targetEntityTypeId &&
          watchConfigOnWorkflowEvent.targetEntityId &&
          watchConfigOnWorkflowEvent.groupingEntityTypeId === data.GroupingEntityTypeId &&
          watchConfigOnWorkflowEvent.targetEntityTypeId === data.TargetEntityTypeId &&
          watchConfigOnWorkflowEvent.targetEntityId === data.TargetEntityId
        ) {
          // if (watchConfigOnWorkflowEvent.groupingEntityTypeId === ApplicationConstants.EntityType.Assignment
          //     && watchConfigOnWorkflowEvent.stateIncludesFilter !== 'workorder.edit.compliancedocuments') {
          //     AssignmentDataService.setAssignment({});
          // }

          if (this.router.url.includes(watchConfigOnWorkflowEvent.stateIncludesFilter)) {
            // unregisterFunctionList();

            // to fix: these redirect urls
            // if (this.router.url.includes('payroll.salesTaxDetails')) {
            //     watchConfigOnWorkflowEvent.stateParamMapping.salesTaxHeaderId = data.GroupingEntityId;
            // } else if (this.router.url.includes('org.vmsfee')) {
            //     watchConfigOnWorkflowEvent.stateParamMapping.vmsFeeHeaderId = data.GroupingEntityId;
            // } else if (this.router.url.includes('org.rebate')) {
            //     watchConfigOnWorkflowEvent.stateParamMapping.rebateHeaderId = data.GroupingEntityId;
            // }

            // if (data.TaskResult !== ApplicationConstants.TaskResult.WovActionDelete) {
            if (watchConfigOnWorkflowEvent.functionCallBack && typeof watchConfigOnWorkflowEvent.functionCallBack === 'function') {
              watchConfigOnWorkflowEvent.functionCallBack(data);
            } else {
              this.router.navigate([watchConfigOnWorkflowEvent.stateNameGo, watchConfigOnWorkflowEvent.stateParamMapping]);
            }
            // }
          }
        }
        // else if (watchConfigOnWorkflowEvent.stateNameGo.length > 0 &&
        //     watchConfigOnWorkflowEvent.groupingEntityTypeId > 0 &&
        //     watchConfigOnWorkflowEvent.targetEntityTypeId &&
        //     watchConfigOnWorkflowEvent.targetEntityId &&
        //     watchConfigOnWorkflowEvent.groupingEntityTypeId === data.GroupingEntityTypeId &&
        //     $rootScope.$state.includes('transaction.view') && data.GroupingEntityId === $rootScope.$state.params.transactionHeaderId &&
        //     ($rootScope.$state.includes(watchConfigOnWorkflowEvent.stateIncludesFilter)
        //         // || ($rootScope.$state.includes(watchConfigOnWorkflowEvent.stateNameGo) && data.ReferenceCommandName === "TransactionBillingInvoiceSwitchToTransactionBilling")
        //     )) {
        //     //  http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=16249
        //     //  do not filter 'TransactionBillingInvoiceSwitchToTransactionBilling'
        //     if (data.ReferenceCommandName === 'FinancialTransactionRecordOnTransactionHeaderReversed' ||
        //         data.ReferenceCommandName === 'PaymentTransactionDecisionOnDirectDepositOrCheque'
        //         // || data.ReferenceCommandName === "TransactionBillingInvoiceDecisionAutoRelease"
        //     ) {
        //         return;
        //     }
        //     unregisterFunctionList();
        //     $rootScope.$state.transitionTo(watchConfigOnWorkflowEvent.stateNameGo, watchConfigOnWorkflowEvent.stateParamMapping, { reload: true, inherit: true, notify: true });
        // }
      }
      //  else {
      //     if (disableRefreshScreenBroadcasts_for_WorkflowConcurrencyTesting) { return; }

      //     if ($rootScope.$state.includes('workorder.edit') &&
      //         data.GroupingEntityTypeId === ApplicationConstants.EntityType.Assignment &&
      //         data.TargetEntityTypeId === ApplicationConstants.EntityType.WorkOrderVersion &&
      //         data.TargetEntityId === $rootScope.$state.params.workOrderVersionId &&
      //         data.TaskResult !== ApplicationConstants.TaskResult.WovActionDelete // Handled in wo delete event
      //     ) {
      //         dialogs.notify('This Work Order has been updated', 'The work order will be refreshed to provide the most up to date data', { backdrop: 'static' }).then(function (btn) {
      //             AssignmentDataService.setAssignment({});
      //             unregisterFunctionList();
      //             $rootScope.$state.transitionTo($rootScope.$state.current.name, { assignmentId: 0, workOrderId: 0, workOrderVersionId: $rootScope.$state.params.workOrderVersionId }, { reload: true, inherit: true, notify: true });
      //         });
      //     } else if ($rootScope.$state.includes('transaction.manual') &&
      //         data.GroupingEntityTypeId === ApplicationConstants.EntityType.TransactionHeader &&
      //         data.TargetEntityTypeId === ApplicationConstants.EntityType.TransactionHeader &&
      //         data.TargetEntityId === $rootScope.$state.params.transactionHeaderId) {
      //         dialogs.notify('This Transaction has been updated', 'The transaction will be refreshed to provide the most up to date data', { backdrop: 'static' }).then(function (btn) {
      //             AssignmentDataService.setAssignment({});
      //             unregisterFunctionList();
      //             $rootScope.$state.transitionTo($rootScope.$state.current.name, { transactionHeaderId: $rootScope.$state.params.transactionHeaderId }, { reload: true, inherit: true, notify: true });
      //         });
      //     } else if ($rootScope.$state.includes('transaction.view') &&
      //         data.GroupingEntityTypeId === ApplicationConstants.EntityType.TransactionHeader &&
      //         data.GroupingEntityId === $rootScope.$state.params.transactionHeaderId) {

      //         if ([
      //             'FinancialTransactionRecordOnTransactionHeaderReversed', // (N'40006', N'4',	N'1', N'Financial Record'
      //             // 'TransactionBillingInvoiceSwitchToTransactionBilling',//(N'40056', N'4',	N'1', null
      //             'PaymentTransactionDecisionOnDirectDepositOrCheque'// (N'40075', N'4',	N'1', null
      //             // 'TransactionBillingInvoiceDecisionAutoRelease'//(N'40050', N'4',	N'1', N'Invoice Auto Released'
      //         ].indexOf(data.ReferenceCommandName) < 0) {
      //             return;
      //         }

      //         dialogs.notify('This Transaction has been updated', 'The transaction will be refreshed to provide the most up to date data' +
      //             ' (' + data.ReferenceCommandName + ')', // ToDo Sergey: remove this line when bug will be fixed: http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=21925
      //             { backdrop: 'static' }).then(function (btn) {
      //                 AssignmentDataService.setAssignment({});
      //                 unregisterFunctionList();
      //                 $rootScope.$state.transitionTo($rootScope.$state.current.name, { transactionHeaderId: $rootScope.$state.params.transactionHeaderId }, { reload: true, inherit: true, notify: true });
      //             });
      //     } else if ($rootScope.$state.includes('org.edit') &&
      //         data.GroupingEntityTypeId === ApplicationConstants.EntityType.Organization &&
      //         data.TriggerEntityTypeId === ApplicationConstants.EntityType.Organization && data.TriggerEntityId === $rootScope.$state.params.organizationId) {
      //         dialogs.notify('This Organization has been updated', 'The Organization will be refreshed to provide the most up to date data', { backdrop: 'static' }).then(function (btn) {
      //             unregisterFunctionList();
      //             $rootScope.$state.transitionTo($rootScope.$state.current.name, { organizationId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
      //         });
      //     }
      // };
    });
  }
}
