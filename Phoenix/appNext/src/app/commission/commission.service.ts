import { ApiService } from './../common/services/api.service';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import { CommissionRateHeaderUsersCollection, CommissionSalesPattern } from './model';
import { CommonDataService } from '../common/services/commonData.service';
import { LoadingSpinnerService } from '../common';
declare var oreq: any;
@Injectable()
export class CommissionService {
  constructor(
    private apiService: ApiService,
    private commonDataService: CommonDataService,
    private loadingSpinnerService: LoadingSpinnerService
  ) {}

  public getCommissionUserProfileListWithRatesOnly(oDataParams): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code'])
        .url();
    return Observable.fromPromise(this.apiService.query('Commission/getCommissionUserProfileListWithRatesOnly?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '')));
  }

  public getPendingInterestTotal(userProfileId): Promise<any> {
    return this.apiService.query('commission/PendingInterestTotal/' + userProfileId);
  }

  public getCommissionReport(reportCommand) {
    return this.apiService.command('CommissionReport', reportCommand);
  }

  public finalizeCommissionReport(reportCommand: any) {
    return this.apiService.command('CommissionReportFinalize', reportCommand, true);
  }

  public getCommissionTemplateById(commissionTemplateId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query(`template/${commissionTemplateId}`));
  }

  public getCommissionRateVersionId(commissionRateHeaderId: number): Promise<number> {
    return this.apiService.query(`commission/latestVersionId/${commissionRateHeaderId}`);
  }

  public getCommissionRateHeaderUsers(): Observable<CommissionRateHeaderUsersCollection> {
    return Observable.fromPromise(this.apiService.query('commission/getCommissionRateHeaderUsers'));
  }

  public getSalesPattern(salesPatternId: number): Observable<CommissionSalesPattern> {
    return Observable.fromPromise(this.apiService.query(`commission/getSalesPattern/${salesPatternId}`));
  }

  public discardCommissionSalesPattern(command) {
    return this.apiService.command('CommissionDiscardSalesPattern', command, true);
  }

  public saveCommissionSalesPattern(saveCommand) {
    return this.apiService.command('CommissionSaveSalesPattern', saveCommand);
  }

  getListOrganizationInternal(oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code'])
        .url();
    return Observable.fromPromise(this.commonDataService.getListOrganizationInternal());
  }

  getListOrganizationClient1(oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['OrganizationAddresses, OrganizationClientRoles'])
        .withSelect(['Id', 'DisplayName', 'OrganizationAddresses/IsPrimary', 'OrganizationAddresses/SubdivisionId', 'OrganizationClientRoles/IsChargeSalesTax', 'OrganizationClientRoles/ClientSalesTaxDefaultId'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + oDataParams));
  }

  updateTemplate(command) {
    command.WorkflowPendingTaskId = -1;
    return Observable.fromPromise(this.apiService.command('UpdateTemplateBody', command));
  }

  getInternalUserProfileList(oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['CommissionUserProfileId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName', 'CommissionUserProfileStatusId'])
        .url();
    return Observable.fromPromise(this.apiService.query('Commission/getInternalUserProfileList?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '')));
  }

  getCommissionHeaderById(commissionId: number, oDataParams?: any) {
    return Observable.fromPromise(this.apiService.query('commission/getCommissionHeaderById/' + commissionId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  saveCommissionTransaction(saveCommand) {
    return Observable.fromPromise(this.apiService.command('CommissionAdjustmentNew', saveCommand));
  }

  activateRecurring(command) {
    return Observable.fromPromise(this.apiService.command('CommissionAdjustmentHeaderActivate', command));
  }

  deactivateRecurring(command) {
    return Observable.fromPromise(this.apiService.command('CommissionAdjustmentHeaderDeactivate', command));
  }

  getTemplatesByEntityTypeId(entityTypeId) {
    const filter = oreq.filter('StatusId').eq(1);
    const params = oreq
      .request()
      .withFilter(filter)
      .url();
    return Observable.fromPromise(this.apiService.query('template/getTemplatesByEntityTypeId/' + entityTypeId + '?' + params));
  }

  getCommissionRateHeadersByCommissionUserProfile(commissionUserProfileId, oDataParams?: any) {
    return Observable.fromPromise(this.apiService.query('Commission/getCommissionRateHeadersByCommissionUserProfile/' + commissionUserProfileId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  getTemplate(id: number) {
    return Observable.fromPromise(this.apiService.query('template' + id));
  }


  public executeCommissionRateVersionCommand(commandName: string, workflowComments: string, payload: any, oDataParams = null) {
    if (workflowComments != null && workflowComments !== '') {
      payload.Comments = workflowComments;
    }

    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then(r => {
          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }
          resolve(payload.EntityIds[0]);
          // const query = `expenseClaim/${r.EntityId}${this.param(oDataParams)}`;
          // this.apiService.query(query)
          //   .then((response: ExpenseClaim) => {
          //     this.updateExpenseClaimState(response);
          //     this.loadingSpinnerService.hide();
          //     resolve(payload.EntityIds[0]);
          //   })
          //   .catch(ex => {
          //     console.error(query, ex);
          //     this.loadingSpinnerService.hideAll();
          //     reject(ex);
          //   });
        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }
}
