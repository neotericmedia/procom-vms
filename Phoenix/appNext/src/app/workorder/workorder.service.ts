import { CodeValueService } from './../common/services/code-value.service';
import { CodeValueGroups } from './../common/model/phx-code-value-groups';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, PhxConstants } from '../common';
import { CommonDataService } from '../common/services/commonData.service';
import { SignalrService } from '../common/services/signalr.service';
import { find } from 'lodash';
import { IWorkOrder, IBillingInfo, IPaymentInfo, IPaymentSalesTax, IBillingSalesTax } from './state';
import { SalesTaxVersionRate } from '../expense/model';
import { IOrganizationClientRole } from '../organization/state';

@Injectable()
export class WorkorderService {
  constructor(private apiService: ApiService, private commonDataService: CommonDataService, private signalrService: SignalrService, private codeValueService: CodeValueService) {}

  public getBranchList(): Observable<any> {
    let oDataParams: string;
    oDataParams = oreq
      .request()
      .withSelect(['Id', 'Name'])
      .url();
    return Observable.fromPromise(this.apiService.query('branch/list?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '')));
  }

  public getWorkorder(Id: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('assignment/getByWorkOrderId/' + Id));
  }

  getListOrganizationInternal() {
    return Observable.fromPromise(this.commonDataService.getListOrganizationInternal());
  }

  getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  getListUserProfileWorker(oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['Contact'])
        .withSelect(['Id', 'ProfileTypeId', 'ContactId', 'Contact/Id', 'Contact/FullName', 'OrganizationId', 'UserProfileIdOrgRep'])
        .url();
    const query = 'UserProfile/getListUserProfileWorker' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '');
    return new Promise((resolve, reject) => {
      this.apiService
        .query(query, false)
        .then((result: any) => {
          if (result && result.Items && result.Items.length > 0) {
            resolve(result);
          } else {
            resolve([]);
          }
        })
        .catch(err => reject(err));
    });
  }

  getSalesPatterns(oDataParams) {
    return Observable.fromPromise(this.apiService.query('commission/getAllSalesPatterns' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), false));
  }

  getListUserProfileInternal(oDataParams?: any) {
    const internalDataParams = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'ProfileStatusId', 'Contact/Id', 'Contact/FullName', 'ProfileTypeId', 'OrganizationId'])
      .url();
    oDataParams = oDataParams || internalDataParams;
    return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), false));
  }
  workOrderVersionCommissionPicker(command) {
    return Observable.fromPromise(this.apiService.command('WorkOrderVersionCommissionPicker', command, false));
  }

  getWorkorderSummary() {
    const self = this;
    return new Promise(resolve => {
      self.signalrService.onPrivate('WorkOrderVersionCommissionPicker', (event, data) => {
        resolve(data);
      });
    });
  }

  public getProfilesListOrganizationalByUserProfileType(organizationId, userProfileType, oDataParams = null) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['Contact'])
        .withSelect(['Id', 'ProfileStatusId', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName'])
        .url();
    return Observable.fromPromise(this.apiService.query('UserProfile/' + userProfileType + '/UserProfiles?organizationId=' + organizationId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : ''), false));
  }

  public getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId, oDataParams) {
    return Observable.fromPromise(
      this.apiService.query('org/getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), false)
    );
  }

  public getPaymentReleaseScheduleDetail(paymentReleaseScheduleId, tableState) {
    const oDataParams = this.generateRequestObject(tableState).url();
    return Observable.fromPromise(this.apiService.query('Payment/getPaymentReleaseScheduleDetail/' + paymentReleaseScheduleId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getProfilesListByOrganizationId(organizationId, oDataParams = null) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['Contact'])
        .withSelect(['Id', 'ProfileStatusId', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName'])
        .url();
    return Observable.fromPromise(this.apiService.query('UserProfile/' + 0 + '/UserProfiles?organizationId=' + organizationId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : ''), false));
  }

  public getSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId) {
    if (subdivisionIdSalesTax && subdivisionIdSalesTax > 0 && organizationId && organizationId > 0) {
      const oDataParams = oreq
        .request()
        .withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'IsApplied', 'HasNumberAssigned'])
        .url();
      return Observable.fromPromise(
        this.apiService.query(
          'SalesTaxVersionRate/getSalesTaxVersionRatesBySubdivisionAndOrganization/subdivision/' + subdivisionIdSalesTax + '/Organization/' + organizationId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''),
          false
        )
      );
    }
  }

  generateRequestObject(tableState) {
    const searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
    const sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? ' desc ' : '') : null;
    let currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
    const pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
    currentPage--;
    let oDataParams = oreq.request();
    if (Object.keys(searchObj).length > 0) {
      oDataParams = oDataParams.withFilter(oreq.filter().smartTableObjectConverter(searchObj));
    }
    if (sortObj) {
      oDataParams = oDataParams.withOrderby(sortObj);
    }
    if (!(tableState && tableState.pagination && tableState.pagination.isDisabled === true)) {
      oDataParams = oDataParams
        .withTop(pageSize)
        .withSkip(currentPage * pageSize)
        .withInlineCount();
    } else {
      oDataParams = oDataParams.withInlineCount();
    }
    return oDataParams;
  }

  public getListOrganizationClient(oDataParams = null): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand()
        // ['OrganizationAddresses, OrganizationClientRoles, OrganizationClientRoles/OrganizationClientRoleAlternateBills ']).
        .withSelect()
        // ['Id', 'DisplayName', 'OrganizationAddresses/IsPrimary', 'OrganizationAddresses/SubdivisionId', 'OrganizationClientRoles/IsChargeSalesTax',
        //       'OrganizationClientRoles/ClientSalesTaxDefaultId', 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/Id',
        //       'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillCode', 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillLegalName',
        //       'OrganizationClientRoles/UsesThirdPartyImport', 'OrganizationClientRoles/IsBillSalesTaxAppliedOnExpenseImport', 'OrganizationClientRoles/IsPaySalesTaxAppliedOnExpenseImport'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getProfilesListOrganizational(organizationId, oDataParams): Observable<any> {
    // debugger;
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['Contact'])
        .withSelect(['Id', 'ProfileStatusId', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName'])
        .url();
    return Observable.fromPromise(
      this.apiService.query('UserProfile/' + PhxConstants.UserProfileType.Organizational + '/UserProfiles?organizationId=' + organizationId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : ''), false)
    );
  }

  public getListOrganizationSupplier(oDataParams): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListSupplierOrganizationsOriginal?' + oDataParams));
  }

  public getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId));
  }

  public setOdataParamsForGetListUserProfileWorker(oDataParams = null): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['Contact'])
        .withSelect(['Id', 'ContactId', 'ProfileStatusId', 'ProfileTypeId', 'Contact/Id', 'Contact/FullName'])
        .url();
    return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileWorker' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), false));
  }

  public getTransactionList(workOrderId: number, tableState, oDataParams): Observable<any> {
    // We do custom sort by code in sortAndFilter().
    delete tableState.sort;
    const tableStateParams = tableState && tableState !== undefined ? this.generateRequestObject(tableState).url() : '';
    return Observable.fromPromise(this.apiService.query('transactionHeader/getAllByWorkOrderId/' + workOrderId + '?' + (oDataParams ? oDataParams + '&' : '') + tableStateParams));
  }

  getWCBCodesBySubdivisionId(subdivisionId, organizationIdInternal, oDataParams?: any) {
    return Observable.fromPromise(this.apiService.query('Payroll/getWCBCodesBySubdivisionId/' + subdivisionId + '/' + organizationIdInternal + '/' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId(subdivisionId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('Payroll/getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId/' + subdivisionId + '/' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }
  getWorkOrderPurchaseOrderLinesByWorkOrderId(workOrderId, oDataParams = null) {
    return Observable.fromPromise(this.apiService.query('purchaseorder/getWorkOrderPurchaseOrderLinesByWorkOrderId/' + workOrderId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getPurchaseOrderLineByOrganizationIdClient(organizationIdClient, oDataParams) {
    return Observable.fromPromise(this.apiService.query('purchaseorder/getPurchaseOrderLineByOrganizationIdClient/' + organizationIdClient + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getByPurchaseOrderLineId(purchaseOrderLineId: number, oDataParams: any): Observable<any> {
    return Observable.fromPromise(this.apiService.query('purchaseorder/getByPurchaseOrderLineId/' + purchaseOrderLineId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getByWorkOrderId(workOrderId: number, oDataParams: any): Observable<any> {
    return Observable.fromPromise(this.apiService.query('assignment/getByWorkOrderId/' + workOrderId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getByPurchaseOrderId(purchaseOrderId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('purchaseorder?id=' + purchaseOrderId));
  }

  public workOrderPurchaseOrderLineStatusToActivate(command) {
    return Observable.fromPromise(this.apiService.command('WorkOrderPurchaseOrderLineStatusToActivate', command));
  }

  public PONewlineSave(command) {
    return Observable.fromPromise(this.apiService.command('PurchaseOrderLineSave', command));
  }

  public updateTemplateBody(command) {
    command.WorkflowPendingTaskId = -1;
    return Observable.fromPromise(this.apiService.command('UpdateTemplateBody', command));
  }

  public getApplicationConfigurationByTypeId(typeid, oDataParams) {
    return Observable.fromPromise(this.apiService.query('config/getApplicationConfigurationByTypeId/' + typeid + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId(subdivisionId, oDataParams) {
    return this.apiService.query('Payroll/getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId/' + subdivisionId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''));
  }

  getAts(atsSourceId, atsPlacementId) {
    // return this.apiService.query('assignment/getAts/atsSourceId/' + atsSourceId + '/atsPlacementId/' + atsPlacementId);
    return Observable.fromPromise(this.apiService.query('assignment/getAts/atsSourceId/' + atsSourceId + '/atsPlacementId/' + atsPlacementId));
  }

  getTemplatesByEntityTypeId(entityTypeId): Observable<any> {
    const filter = oreq.filter('StatusId').eq(1);
    const params = oreq
      .request()
      .withFilter(filter)
      .url();
    return Observable.fromPromise(this.apiService.query('template/getTemplatesByEntityTypeId/' + entityTypeId + '?' + params));
  }

  workOrderNew(command) {
    return Observable.fromPromise(this.apiService.command('AssignmentCreateState', command));
  }

  getByOrganizationId(organizationId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('org?id=' + organizationId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : '')));
  }

  getByWorkOrderVersionId(workOrderVersionId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('assignment/getByWorkOrderVersionId/' + workOrderVersionId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  getDuplicateAtsWorkOrder(atsSourceId, atsPlacementId) {
    const path = 'getSearch';
    const oDataQuery = oreq
      .request()
      .withSelect(['WorkOrderFullNumber', 'WorkerName', 'StartDate', 'EndDate', 'WorkOrderStatus', 'AssignmentId', 'WorkOrderId', 'WorkOrderVersionId'])
      .withFilter(
        oreq
          .filter('AtsSourceId')
          .eq(atsSourceId)
          .and()
          .filter('AtsPlacementId')
          .eq(atsPlacementId)
          .and()
          .filter('WorkOrderStatusId')
          .ne(PhxConstants.WorkOrderStatus.Cancelled)
        // .and().filter('WorkOrderStatusId').ne(PhxConstants.WorkOrderStatus.Discarded)
      )
      .url();
    return Observable.fromPromise(this.apiService.query('assignment/' + path + '?' + oDataQuery));
  }

  public templateNew(command) {
    command.WorkflowPendingTaskId = -1;
    return Observable.fromPromise(this.apiService.command('TemplateNew', command));
  }

  public updateTemplateSettings(command) {
    command.WorkflowPendingTaskId = -1;
    return Observable.fromPromise(this.apiService.command('UpdateTemplateSettings', command));
  }

  public get(id) {
    if (id && !isNaN(id)) {
      return Observable.fromPromise(this.apiService.query('template/' + id));
    } else {
      return Observable.fromPromise(this.apiService.query('template'));
    }
  }

  downloadT4(workOrderVersionId: any, year: any) {
    return this.apiService.url('report/getPdfStreamForT4Slip/' + workOrderVersionId + '/' + year) + '&wmode=transparent';
  }

  downloadT4A(workOrderVersionId: any, year: any) {
    return this.apiService.url('report/getPdfStreamForT4ASlip/' + workOrderVersionId + '/' + year) + '&wmode=transparent';
  }

  getWorker(assignment, listUserProfileWorker) {
    let worker = null;
    if (assignment.UserProfileIdWorker > 0) {
      worker = find(listUserProfileWorker, function(w) {
        return w.Id === assignment.UserProfileIdWorker;
      });
      if (typeof worker !== 'undefined') {
        assignment.workerProfileTypeId = worker.ProfileTypeId;
        assignment.workerContactId = worker.ContactId;
      } else {
        // dialogs.notify('Wrong Worker User Profile', 'Worker User Profile with id "' + assignment.UserProfileIdWorker + '" is broken or does not exists', { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
        assignment.workerProfileTypeId = null;
        worker = null;
      }
    } else {
      assignment.workerProfileTypeId = null;
      assignment.workerContactId = null;
    }
    return worker;
  }

  getWorkOrderVersionsOrdered(workOrder: IWorkOrder) {
    const workOrderId = workOrder ? workOrder.WorkOrderId : null;
    const assignment = workOrder ? workOrder.RootObject : null;
    const workOrderRaw = assignment && assignment.WorkOrders && assignment.WorkOrders.length ? assignment.WorkOrders.find(w => w.Id === workOrderId) : null;
    const workOrderVersions = workOrderRaw ? workOrderRaw.WorkOrderVersions : [];
    return workOrderVersions.sort((a, b) => {
      if (a.Id < b.Id) {
        return 1;
      }
      if (a.Id > b.Id) {
        return -1;
      }
      return 0;
    });
  }

  public getSubdivisionIdByWorksiteId(worksiteId: number) {
    return worksiteId ? this.codeValueService.getParentId(CodeValueGroups.Worksite, worksiteId) : null;
  }

  public getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker(subdivisionIdSalesTax: number, profileId: number) {
    const oDataParams = oreq
      .request()
      .withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'IsApplied', 'HasNumberAssigned'])
      .url();
    return Observable.fromPromise(
      this.apiService.query(
        'SalesTaxVersionRate/getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker/Subdivision/' + subdivisionIdSalesTax + '/Profile/' + profileId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''),
        false
      )
    );
  }

  /*
    converted from AssignmentCommonFunctionalityService.js -- getPaymentSalesTaxes
  */
  async getPaymentSalesTaxes(paymentInfo: IPaymentInfo, userProfileIdWorker: number, workerProfileTypeId: number): Promise<Array<IPaymentSalesTax>> {
    const paymentSalesTaxes: Array<IPaymentSalesTax> = [];
    const subdivisionIdSalesTax = paymentInfo ? paymentInfo.SubdivisionIdSalesTax : null;
    const organizationIdSupplier = paymentInfo ? paymentInfo.OrganizationIdSupplier : null;
    if (subdivisionIdSalesTax) {
      let responseSalesTaxVersionRates: any;
      if (organizationIdSupplier) {
        responseSalesTaxVersionRates = await this.getSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationIdSupplier).toPromise();
      } else if (userProfileIdWorker && workerProfileTypeId === PhxConstants.ProfileType.WorkerCanadianSP) {
        responseSalesTaxVersionRates = await this.getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker(subdivisionIdSalesTax, userProfileIdWorker).toPromise();
      }
      const salesTaxVersionRates: Array<SalesTaxVersionRate> = (responseSalesTaxVersionRates ? responseSalesTaxVersionRates.Items : null) || [];
      salesTaxVersionRates.forEach((rate: SalesTaxVersionRate) => {
        paymentSalesTaxes.push(<IPaymentSalesTax>{
          Id: rate.Id,
          SalesTaxId: rate.SalesTaxId,
          IsApplied: rate.HasNumberAssigned,
          ratePercentage: rate.RatePercentage,
          hasNumber: rate.HasNumberAssigned
        });
      });
    }
    return paymentSalesTaxes;
  }

  /*
    converted from AssignmentCommonFunctionalityService.js -- getBillingSalesTaxes
  */
  async getBillingSalesTaxes(billingInfo: IBillingInfo, organizationIdInternal: number, isAppliedCalc: boolean = true): Promise<Array<IBillingSalesTax>> {
    const promises = [];
    if (billingInfo.SubdivisionIdSalesTax && billingInfo.OrganizationIdClient && organizationIdInternal) {
      promises.push(this.getSalesTaxVersionRatesBySubdivisionAndOrganization(billingInfo.SubdivisionIdSalesTax, organizationIdInternal).toPromise());
      if (isAppliedCalc) {
        promises.push(this.getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(billingInfo.OrganizationIdClient, null).toPromise());
      }
    }
    const data = await Promise.all(promises);
    const billingSalesTaxes: Array<IBillingSalesTax> = [];
    const responseSalesTaxVersionRates = data ? data[0] : null;
    const responseOrganizationClientRoles = data ? data[1] : null;
    const salesTaxVersionRates: Array<SalesTaxVersionRate> = (responseSalesTaxVersionRates ? responseSalesTaxVersionRates.Items : null) || [];
    const organizationClientRoles: Array<IOrganizationClientRole> = (responseOrganizationClientRoles ? responseOrganizationClientRoles.Items : null) || [];
    const isApplied = !organizationClientRoles.length || organizationClientRoles.some((role: IOrganizationClientRole) => role.IsChargeSalesTax);
    salesTaxVersionRates.forEach((rate: SalesTaxVersionRate) => {
      billingSalesTaxes.push(<IBillingSalesTax>{
        Id: rate.Id,
        SalesTaxId: rate.SalesTaxId,
        IsApplied: isApplied && rate.HasNumberAssigned,
        ratePercentage: rate.RatePercentage,
        hasNumber: rate.HasNumberAssigned
      });
    });
    return billingSalesTaxes;
  }
}
