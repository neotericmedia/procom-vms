import { ConcurrencyError } from './../model/concurrency-error';
import { CommandResponse } from './../model/command-response';
import { StateService } from './../state/service/state.service';
import { Injectable, Output, EventEmitter, OnDestroy } from '@angular/core';
import { rootActions } from '../state/root.actions';
import { LoadingSpinnerService } from './../loading-spinner/service/loading-spinner.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { UtilityService } from './utility-service.service';
import { SignalrService } from './signalr.service';
import { environment } from '../../../environments/environment';
import { EventService } from './event.service';
import { Subscription } from 'rxjs/Subscription';
import * as uuidModule from 'uuid';

@Injectable()
export class ApiService implements OnDestroy {
  @Output() OnConcurrencyError: EventEmitter<ConcurrencyError> = new EventEmitter<ConcurrencyError>();

  apiEndPoint: string;
  rawApiEndPoint: string;
  private broadcastEventLogoutSubscription: Subscription;
  private concurrencyNotifyEventSubscription: Subscription;

  constructor(
    private loadingSpinnerService: LoadingSpinnerService,
    private state: StateService,
    private cookieSvc: CookieService,
    private utilitySvc: UtilityService,
    private signalrSvc: SignalrService,
    private http: HttpClient,
    private eventSvc: EventService
  ) {
    const self = this;
    this.apiEndPoint = environment.apiUrl + 'api';
    this.rawApiEndPoint = environment.apiUrl.replace(/\/$/, '');

    this.signalrSvc.onPrivate(
      'HandlerExecuteException',
      (event, data) => {
        self.loadingSpinnerService.hideAll();
      },
      true
    );

    this.signalrSvc.onPrivate(
      'ConcurrencyNotifyEvent',
      (event, data) => {
        if (data.IsOwner) {
          self.OnConcurrencyError.emit(data);
        }
      },
      true
    );

    this.concurrencyNotifyEventSubscription = this.eventSvc.subscribe('ConcurrencyNotifyEvent', (e: any) => {
      self.OnConcurrencyError.emit(e);
    });

    this.broadcastEventLogoutSubscription = this.eventSvc.subscribe('broadcastEvent:logout', () => {
      self.state.dispatch(rootActions.logout);
    });
  }
  ngOnDestroy(): void {
    if (this.concurrencyNotifyEventSubscription) {
      this.concurrencyNotifyEventSubscription.unsubscribe();
    }
    if (this.broadcastEventLogoutSubscription) {
      this.broadcastEventLogoutSubscription.unsubscribe();
    }
  }

  public command(command: string, data: any = null, showLoader: boolean = true): Promise<CommandResponse> {
    if (showLoader) {
      this.loadingSpinnerService.show();
    }
    return new Promise((resolve, reject) => {
      const uuid = uuidModule.v4();
      data = data || {};
      const cmd: ICommand = { ...data, CommandName: command, CommandId: uuid };

      this.signalrSvc.addToOwnerDictionary(uuid);

      this.signalrSvc.onDisconnect(reject);

      this.signalrSvc.onPrivate(cmd.CommandName + '.complete.' + uuid, (commandName, response) => {
        if (response.CommandId === uuid) {
          if (response.IsValid === false) {
            reject(response);
            this.signalrSvc.leave(uuid);
            if (typeof response.unregister === 'function') {
              response.unregister();
            }
            if (showLoader) {
              this.loadingSpinnerService.hideAll();
            }
          } else {
            resolve(response);
            this.signalrSvc.leave(uuid);
            if (typeof response.unregister === 'function') {
              response.unregister();
            }
            if (showLoader) {
              this.loadingSpinnerService.hide();
            }
          }
        }
      });

      this.signalrSvc.onPrivate(cmd.CommandName + '.error.' + uuid, (commandName, response) => {
        if (response.CommandId === uuid) {
          reject(response);
          this.signalrSvc.leave(uuid);
          if (typeof response.unregister === 'function') {
            response.unregister();
          }
          if (showLoader) {
            this.loadingSpinnerService.hideAll();
          }
        }
      });

      this.signalrSvc.join(uuid).then(
        e => {
          this.submitCommand(cmd).catch(err => {
            this.loadingSpinnerService.hideAll();
            console.error(`error executing ${command}`, err);
            reject(err);
          });
        },
        err => {
          // TODO: what to do if we fail to join channel?!
        }
      );
    });
  }
  private submitCommand(cmd: ICommand) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: new HttpHeaders({
          PhoenixValues: this.cookieSvc.getProfileIdString(),
          Authorization: 'Bearer ' + this.cookieSvc.getItem('BearerToken'),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        })
      };
      this.http.post(this.apiEndPoint + '/command', cmd, options).subscribe(
        (response: HttpResponse<any>) => {
          if (response.status === 200) {
            // do something?
          } else if (response.status === 401) {
            // Unauthorized
            const msg = response.body ? response.body.Message : 'Unauthorized Access';
            reject({ msg: msg, status: response.status, response: undefined });
            // redirect to login page?
          }
        },
        response => {
          // if (ConcurrencyNotifyEvent(response.body)) {

          // } else {
          if (response.status === 400) {
            reject({ status: response.status, response: response.error, ModelState: response.error && response.error.ModelState ? response.error.ModelState : null });
          } else {
            const isConcurrencyException = response.status === 500 && ((response.body && response.body.ExceptionMessage === 'Concurrency exception') || (response.error && response.error.ExceptionMessage === 'Concurrency exception'));
            reject({ status: status, response: undefined, isConcurrencyException: isConcurrencyException });
          }
          // }
        }
      );
    });
  }

  // public query<T>(path: string, showLoader: boolean = true, skipErrorIntercept: boolean = false): Promise<T> {

  //   if (showLoader) {
  //     this.loadingSpinnerService.show();
  //   }
  //   return new Promise<T>((resolve, reject) => {

  //     this.$phoenixapi.query(path, {
  //       skipErrorIntercept: skipErrorIntercept
  //     }).then(response => {
  //         if (showLoader) {
  //           this.loadingSpinnerService.hide();
  //         }
  //         resolve(response);
  //       }).catch((err) => {
  //         if (showLoader) {
  //           this.loadingSpinnerService.hideAll();
  //         }
  //         console.error(`error calling ${path}`, err);
  //         reject(err);
  //       });
  //   });
  // }

  public async query<T>(path: string, showLoader: boolean = true, skipErrorIntercept: boolean = false, contentType = 'application/json'): Promise<T> {
    const self = this;
    if (showLoader) {
      self.loadingSpinnerService.show();
    }

    return new Promise<T>((resolve, reject) => {
      // const queryId = uuid.create();
      const headerObj = {
        PhoenixValues: self.cookieSvc.getProfileIdString(),
        Authorization: 'Bearer ' + self.cookieSvc.getItem('BearerToken'),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      };
      switch (contentType) {
        case 'text/html':
          const headersAccept = new HttpHeaders({ ...headerObj, Accept: contentType });
          self.http.get(self.apiEndPoint + '/' + path, { headers: headersAccept, responseType: 'text' }).subscribe(
            (response: any) => {
              if (showLoader) {
                self.loadingSpinnerService.hide();
              }
              resolve(response);
            },
            error => {
              if (showLoader) {
                self.loadingSpinnerService.hideAll();
              }
              console.error(`error calling ${path}`, error);
              reject(error);
            }
          );
          break;
        case 'application/json':
          const headers = new HttpHeaders(headerObj);
          self.http.get(self.apiEndPoint + '/' + path, { headers: headers }).subscribe(
            (response: any) => {
              if (showLoader) {
                self.loadingSpinnerService.hide();
              }
              resolve(response);
            },
            error => {
              if (showLoader) {
                self.loadingSpinnerService.hideAll();
              }
              console.error(`error calling ${path}`, error);
              reject(error);
            }
          );
          break;
        default:
          console.error(`api.service.get does not know how to handle parameter contentType=${contentType}`);
      }
    });
  }

  public onPrivate(eventName: any, callback: any, queueIfDisconnected?: boolean) {
    return this.signalrSvc.onPrivate(eventName, callback, queueIfDisconnected);
  }

  public onPublic(eventName: any, callback: any, queueIfDisconnected?: boolean) {
    return this.signalrSvc.onPublic(eventName, callback, queueIfDisconnected);
  }

  public entitySubscribe(entityType: number, entityId: number, callback: any): Subscription {
    return this.signalrSvc.entitySubscribe(entityType, entityId, callback);
  }

  public urlWithRoom(path: string, commandId: string = null) {
    // return this.$phoenixapi.urlwithroom(path, commandId);
    if (!path) {
      return;
    }

    if (typeof commandId === 'undefined' || commandId === null) {
      commandId = this.utilitySvc.createUuid();
    }
    this.signalrSvc.addToOwnerDictionary(commandId);

    const mainRoot = this.rawApiEndPoint.replace(/\/$/, '') + '/api/';
    let result = path.replace(/^\/|\/$/g, '');

    if (result.indexOf(mainRoot) === -1) {
      result = mainRoot + result;
    }

    const toResolve = result + '?PhoenixValues=' + this.cookieSvc.getProfileIdString() + '&commandId=' + commandId + '&access_token=' + this.cookieSvc.getItem('BearerToken');
    this.signalrSvc.join(commandId).then(e => {}, err => {});

    return toResolve;
  }

  public url(path) {
    // return this.$phoenixapi.url(path);
    if (!path) {
      return;
    }

    const mainRoot = this.rawApiEndPoint.replace(/\/$/, '') + '/api/'; // fix me
    let result = path.replace(/^\/|\/$/g, '');

    if (result.indexOf(mainRoot) === -1) {
      result = mainRoot + result;
    }
    return result + '?PhoenixValues=' + this.cookieSvc.getProfileIdString() + '&access_token=' + this.cookieSvc.getItem('BearerToken');
  }

  public isEmptyObject(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  }

  dataWorkflowPositionRefreshEvent(data) {
    //     if (!this.isEmptyObject(data) && data.Message !== null && data.Message.length > 0) {
    //         if (typeof $rootScope.globalTableState !== 'undefined' && $rootScope.globalTableState !== null) {
    //             var locationPath = $rootScope.$state.$current.name;
    //             angular.forEach($rootScope.globalTableState, function (pageSelection) {
    //                 if (pageSelection.routeName == locationPath) {
    //                     pageSelection.dontSaveCheckboxSelection = true;
    //                 }
    //             });
    //         }
    //         var logErrorMessage = data.Message;
    //         var logErrorSubject = 'The Object was changed by another user.';
    //         if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.Organization) {
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.Organization && data.TargetEntityId > 0) {
    //                 $rootScope.$state.transitionTo('org.edit.details', { organizationId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.Organization && data.TriggerEntityId > 0) {
    //                 $rootScope.$state.transitionTo('org.edit.details', { organizationId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.Organization && data.GroupingEntityId > 0) {
    //                 $rootScope.$state.transitionTo('org.edit.details', { organizationId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else {
    //                 logErrorSubject = 'Organization was deleted';
    //                 $rootScope.$state.transitionTo('org.search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.Assignment) {
    //             //  It is importand to have assignmentId: 0, because it will initiate "AssignmentDataService.setAssignment({})" inside of "app.resolve.AssignmentEntryController"
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.WorkOrderVersion && data.TargetEntityId > 0) {
    //                 $rootScope.$state.transitionTo('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.WorkOrderVersion && data.TriggerEntityId > 0) {
    //                 $rootScope.$state.transitionTo('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else {
    //                 logErrorSubject = 'Work Order was deleted';
    //                 $rootScope.$state.transitionTo('workorder.search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.AccessSubscription) {
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.TargetEntityId > 0) {
    //                 $rootScope.$state.transitionTo('access.subscription.edit', { accessSubscriptionId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.TriggerEntityId > 0) {
    //                 $rootScope.$state.transitionTo('access.subscription.edit', { accessSubscriptionId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.AccessSubscription && data.GroupingEntityId > 0) {
    //                 $rootScope.$state.transitionTo('access.subscription.edit', { accessSubscriptionId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else {
    //                 logErrorSubject = 'Access Subscription was deleted';
    //                 $rootScope.$state.transitionTo('access.subscription.search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfile) {
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.UserProfile && data.TargetEntityId > 0) {
    //                 $rootScope.$state.transitionTo($rootScope.$state.current.name, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.UserProfile && data.TriggerEntityId > 0) {
    //                 $rootScope.$state.transitionTo($rootScope.$state.current.name, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfile && data.GroupingEntityId > 0) {
    //                 if (data.TargetEntityId) {
    //                     $rootScope.$state.transitionTo($rootScope.$state.current.name, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
    //                 }
    //                 else {
    //                     $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: 0, profileId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
    //                 }
    //             }
    //             else {
    //                 var message = 'User Profile was deleted';
    //                 $rootScope.$state.transitionTo('ContactCreate.Search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule) {
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.TargetEntityId > 0) {
    //                 $rootScope.$state.transitionTo('compliancedocument.documentrule.edit.details', { complianceDocumentRuleId: data.TargetEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TriggerEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.TriggerEntityId > 0) {
    //                 $rootScope.$state.transitionTo('compliancedocument.documentrule.edit.details', { complianceDocumentRuleId: data.TriggerEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.GroupingEntityId > 0) {
    //                 $rootScope.$state.transitionTo('compliancedocument.documentrule.edit.details', { complianceDocumentRuleId: data.GroupingEntityId }, { reload: true, inherit: true, notify: true });
    //             }
    //             else {
    //                 logErrorSubject = 'Compliance Document Rule was deleted';
    //                 $rootScope.$state.transitionTo('compliancedocument.ruleareatype.search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TransactionHeader) {
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.TransactionHeader && data.TargetEntityId > 0) {
    //                 // try to refresh edit
    //                 var workOrderId = $rootScope.$state.current.WorkOrderId;
    //                 $rootScope.$state.go('transaction.manual.detail', { transactionHeaderId: data.TargetEntityId }, { reload: true, inherit: true, notify: true })
    //                     .then(function () { /* ok */ })
    //                     .catch(function () {
    //                         // the transaction could not be loaded:
    //                         //  * return to workorder if there is a work order id
    //                         //  * or send to generic transaction search
    //                         if (workOrderId) {
    //                             $rootScope.$state.go('workorder.edit.core', { assignmentId: 0, workOrderId: workOrderId, workOrderVersionId: 0 }, { reload: true, inherit: true, notify: true });
    //                         } else {
    //                             $rootScope.$state.go('transaction.search', {}, { reload: true, inherit: true, notify: true });
    //                         }
    //                     });
    //             }
    //             else {
    //                 logErrorSubject = 'Transaction was deleted';
    //                 $rootScope.$state.transitionTo('transaction.search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.ExpenseClaim) {
    //             //it will be handled by expense claim service in angular 2
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheet) {
    //             //it will be handled by timesheet service in angular 2
    //         }
    //         else if (data && data.GroupingEntityTypeId == ApplicationConstants.EntityType.TimeSheetCapsuleConfiguration) {
    //             //it will be handled by timesheet service in angular 2
    //         }
    //         else if (data && data.EntityIsDeleted) {
    //             if (data.TargetEntityTypeId == ApplicationConstants.EntityType.VmsImportedRecord && data.ReferenceCommandName === 'VmsTimesheetImportRecordTypeUpdate') {
    //                 $rootScope.$state.transitionTo('vms.management', {}, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.Document && data.ReferenceCommandName === 'VmsTimesheetProcessImportRecords') {
    //                 $rootScope.$state.transitionTo('vms.management', {}, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.Document && data.ReferenceCommandName === 'VmsTimesheetMarkImportRecordsDeleted') {
    //                 $rootScope.$state.transitionTo('vms.management', {}, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.CommissionSalesPattern && data.ReferenceCommandName === 'CommissionSaveSalesPattern') {
    //                 $rootScope.$state.transitionTo('commission.patternsales', {}, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.CommissionSalesPattern && data.ReferenceCommandName === 'CommissionDiscardSalesPattern') {
    //                 $rootScope.$state.transitionTo('commission.patternsales', {}, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.PurchaseOrder) {
    //                 //switch(data.ReferenceCommandName) //"PurchaseOrderSave"
    //                 $rootScope.$state.transitionTo('purchaseorder.search', {}, { reload: true, inherit: true, notify: true });
    //             }
    //             else if (data.TargetEntityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule && data.ReferenceCommandName === 'ComplianceDocumentRuleUserActionDiscard') {
    //                 $rootScope.$state.transitionTo('compliancedocument.ruleareatypesearch', {}, { reload: true, inherit: true, notify: true });
    //             }
    //         }
    //         else {
    //             $rootScope.$state.transitionTo($rootScope.$state.current, $rootScope.$state.params, { reload: true, inherit: true, notify: true });
    //         }
    //         $rootScope.$broadcast('ConcurrencyNotifyEvent', data);
    //         //dialogs.notify(logErrorSubject, logErrorMessage, { keyboard: false, backdrop: 'static', windowClass: 'sales-pattern-dlg-errors' }).result.then(function () { });
    //         common.logError(logErrorMessage);
    //     }
  }

  ConcurrencyNotifyEvent(responseError) {
    // let isWorkflowPositionRefreshEvent = false;
    // if (responseError && responseError !== undefined && responseError !== null) {
    //     if (!this.isEmptyObject(responseError.ModelState)) {
    //         _.each(responseError.ModelState, function (responseErrorValue, responseErrorKey) {
    //             if (Object.prototype.toString.call(responseErrorValue) === '[object Array]' && responseErrorKey.indexOf('ConcurrencyNotifyEvent') >= 0) {
    //                 isWorkflowPositionRefreshEvent = true;
    //                 _.each(responseErrorValue, function (errorValue, errorKey) {
    //                     var data = angular.fromJson(errorValue);
    //                     dataWorkflowPositionRefreshEvent(data);
    //                 });
    //             }
    //         });
    //     }
    //     else if (!this.isEmptyObject(responseError.CommandName) && responseError.CommandName === 'ConcurrencyNotifyEvent') {
    //         isWorkflowPositionRefreshEvent = true;
    //         dataWorkflowPositionRefreshEvent(responseError);
    //     }
    // }
    // return isWorkflowPositionRefreshEvent;
  }
}

interface ICommand {
  CommandId: string;
  CommandName: string;
}
