// angular
import { Subject } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
// common
import { CommonService, ApiService, WorkflowService, LoadingSpinnerService, PhxConstants } from './../common/index';
import { StateService } from './../common/state/service/state.service';
import { uuid } from './../common/PhoenixCommon.module';
// organization
import { organizationState, OrganizationAction } from './state/index';
import { IOrganization, IOrganizationAddress, IOrganizationClientRole } from './state/organization.interface';

declare var oreq: any;
@Injectable()
export class OrganizationApiService {
  routePrefix: string;
  data: any = {
    organizationsListInternal: [],
    clientList: []
  };
  constructor(private apiService: ApiService, private workflowService: WorkflowService, private commonService: CommonService, private loadingSpinnerService: LoadingSpinnerService, private stateService: StateService) {
    this.routePrefix = 'org';
  }

  public createDocumentLink(publicId) {
    return this.apiService.url(`document/${publicId}/getStreamByPublicId`);
  }

  public organizationInternalRoleDateRollOver(command) {
    return this.apiService.command('OrganizationInternalRoleDateRollOver', command);
  }

  public organizationInviteClientConsultants(command) {
    return this.apiService.command('OrganizationInviteClientConsultants', command);
  }

  public deleteInternalOrganizationImage(id: number, imageType: PhxConstants.DocumentType) {
    const command = {
      Id: id,
      ImageType: imageType,
      CommandName: 'DeleteInternalOrganizationImage'
    };
    return this.apiService.command('DeleteInternalOrganizationImage', command);
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

  public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(oDataParams = null): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code', 'IsTest'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getOrganizationName(organizationIdInternal: number): Observable<any> {
    let oDataParams: string;
    oDataParams = oreq
      .request()
      .withSelect(['LegalName'])
      .withFilter(oreq.filter('Id').eq(organizationIdInternal))
      .url();
    return Observable.fromPromise(this.apiService.query('org/getOrganizations?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '')));
  }

  public getListUserProfileWorker(oDataParams = null): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand(['Contact', 'UserProfileAddresses', 'UserProfileWorkerSourceDeductions', 'UserProfileWorkerOtherEarnings', 'UserProfilePaymentMethods'])
        .withSelect([
          'Id',
          'ContactId',
          'ProfileTypeId',
          'PayeeName',
          'PaymentMethodId',
          'OrganizationId',
          'Contact/Id',
          'Contact/FullName',
          'UserProfileWorkerSourceDeductions/IsApplied',
          'UserProfileWorkerSourceDeductions/SourceDeductionTypeId',
          'UserProfileWorkerSourceDeductions/RatePercentage',
          'UserProfileWorkerOtherEarnings/IsApplied',
          'UserProfileWorkerOtherEarnings/PaymentOtherEarningTypeId',
          'UserProfileWorkerOtherEarnings/RatePercentage',
          'UserProfileAddresses/ProfileAddressTypeId',
          'UserProfileAddresses/SubdivisionId',
          'UserProfilePaymentMethods/PaymentMethodTypeId',
          'UserProfilePaymentMethods/IsSelected',
          'UserProfilePaymentMethods/IsPreferred'
        ])
        .url();
    return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileWorker' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getListOrganizationInternal(isForceRefresh: boolean = false, oDataParams = null): Observable<any> {
    return Observable.create(observer => {
      oDataParams =
        oDataParams ||
        oreq
          .request()
          .withSelect(['Id', 'DisplayName', 'LegalName', 'Code', 'IsTest'])
          .url();
      if (Object.keys(this.data.organizationsListInternal).length === 0 || isForceRefresh) {
        this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole?' + oDataParams).then(
          (response: any) => {
            this.data.organizationsListInternal = response.Items;
            observer.next(this.data.organizationsListInternal);
            observer.complete();
          },
          function(responseError) {
            this.data.organizationsListInternal = [];
            observer.next(this.data.organizationsListInternal);
            observer.complete();
          }
        );
      } else {
        observer.next(this.data.organizationsListInternal);
        observer.complete();
      }
    });
  }

  public getListClient(isForceRefresh: boolean = false, oDataParams = null): Observable<any> {
    return Observable.create(observer => {
      oDataParams =
        oDataParams ||
        oreq
          .request()
          .withSelect(['Id', 'DisplayName', 'LegalName', 'Code'])
          .url();
      if (Object.keys(this.data.clientList).length === 0 || isForceRefresh) {
        this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + oDataParams).then(
          (response: any) => {
            this.data.clientList = response.Items;
            observer.next(this.data.clientList);
            observer.complete();
          },
          function(responseError) {
            this.data.clientList = [];
            observer.next(this.data.clientList);
            observer.complete();
          }
        );
      } else {
        observer.next(this.data.clientList);
        observer.complete();
      }
    });
  }

  public getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId));
  }

  public getByOrganizationId(organizationId: number, colledComponenttName: string, oDataParams = null, isForceRefresh = false): BehaviorSubject<IOrganization> {
    oDataParams = '';
    const state = this.stateService.value;
    const targetValue = state && state.reduxOrganization && state.reduxOrganization.organizations && state.reduxOrganization.organizations[organizationId];
    if (targetValue === null || targetValue === undefined || isForceRefresh) {
      this.apiService.query('org?id=' + organizationId + oDataParams).then(
        (responseSuccess: IOrganization) => {
          this.stateService.dispatchOnAction(new OrganizationAction.OrganizationUpdate(responseSuccess));
        },
        responseError => {
          this.stateService.dispatchOnAction(new OrganizationAction.OrganizationDelete(organizationId));
        }
      );
    }
    return this.stateService.select<IOrganization>(organizationState.reduxOrganization.getOrganizationByOrganizationId(organizationId).organizationInstance);
  }

  public getOrganizationByIdDataOnly(organizationId: number, oDataParams = null) {
    return this.apiService.query(`org?id=${organizationId}&${oDataParams}`);
  }

  private param(oDataParams) {
    return oDataParams ? `?${oDataParams}` : '';
  }

  public getOrganizationODataParams(oDataParams = null) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withExpand([
          'AccessActions',
          'Versions',
          'ParentOrganization',
          'OrganizationAddresses',
          'OrganizationTaxNumbers',

          'OrganizationClientRoles',
          'OrganizationClientRoles/OrganizationClientRoleLOBs',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills',
          'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers',

          'OrganizationInternalRoles',
          'OrganizationInternalRoles/BankAccounts',

          'OrganizationIndependentContractorRoles',
          'OrganizationIndependentContractorRoles/PaymentMethods',

          'OrganizationLimitedLiabilityCompanyRoles',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods',

          'OrganizationSubVendorRoles',
          'OrganizationSubVendorRoles/PaymentMethods',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions'
        ])
        .withSelect([
          'WorkflowPendingTaskId',
          'AccessActions/AccessAction',

          'Id',
          'SourceId',
          'IdOriginal',
          'OrganizationStatusId',
          'IsOriginal',
          'IsOriginalAndStatusIsAtiveOrPendingChange',
          'Code',
          'LegalName',
          'DisplayName',
          // 'IsDraft',
          'ModifiedBy',
          'ParentOrganizationId',
          'IndustryTypeId',
          'SectorTypeId',
          'CountryId',
          'DefaultTaxSubdivisionId',
          'IsOrganizationClientRole',
          'IsOrganizationInternalRole',
          'IsOrganizationIndependentContractorRole',
          'IsOrganizationLimitedLiabilityCompanyRole',
          'IsOrganizationSubVendorRole',
          'ActiveAdvancesCount',
          'ActiveGarnisheesCount',
          'IsWorkflowRunning',
          'Title',

          'Versions/Id',
          'Versions/IsOriginal',
          'Versions/OrganizationStatusId',

          'ParentOrganization/Id',
          'ParentOrganization/Name',
          // 'ParentOrganization/IsDraft',
          'ParentOrganization/LastModifiedDatetime',

          'OrganizationAddresses/Id',
          'OrganizationAddresses/OrganizationId',
          'OrganizationAddresses/IsPrimary',
          // 'OrganizationAddresses/AddressTypeId',
          'OrganizationAddresses/AddressDescription',
          'OrganizationAddresses/CountryId',
          'OrganizationAddresses/CityName',
          'OrganizationAddresses/AddressLine1',
          'OrganizationAddresses/AddressLine2',
          'OrganizationAddresses/SubdivisionId',
          'OrganizationAddresses/PostalCode',
          // 'OrganizationAddresses/IsDraft',

          'OrganizationTaxNumbers/Id',
          'OrganizationTaxNumbers/SalesTaxId',
          'OrganizationTaxNumbers/SalesTaxNumber',
          // 'OrganizationTaxNumbers/IsDraft',
          'OrganizationTaxNumbers/OrganizationId',

          'OrganizationClientRoles/Id',
          'OrganizationClientRoles/IdOriginal',
          'OrganizationClientRoles/OrganizationRoleTypeId',
          'OrganizationClientRoles/OrganizationId',
          'OrganizationClientRoles/OrganizationRoleStatusId',
          'OrganizationClientRoles/IsChargeSalesTax',
          'OrganizationClientRoles/IsChargeableExpenseSalesTax',
          'OrganizationClientRoles/IsBypassZeroUnitTimeSheetApproval',
          'OrganizationClientRoles/IsSuppressZeroAmountInvoiceRelease',
          'OrganizationClientRoles/ClientSalesTaxDefaultId',
          'OrganizationClientRoles/SalesTaxCountryId',
          'OrganizationClientRoles/SalesTaxSubdivisionId',
          'OrganizationClientRoles/StartDate',
          'OrganizationClientRoles/ExpiryDate',
          // 'OrganizationClientRoles/IsDraft',
          'OrganizationClientRoles/OrganizationClientRoleLOBs/Id',
          'OrganizationClientRoles/OrganizationClientRoleLOBs/OrganizationClientRoleId',
          'OrganizationClientRoles/OrganizationClientRoleLOBs/LineOfBusinessId',
          'OrganizationClientRoles/OrganizationClientRoleLOBs/IsSelected',
          // 'OrganizationClientRoles/OrganizationClientRoleLOBs/IsDraft',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/Id',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/OrganizationClientRoleId',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/OrganizationClientRoleAlternateBillStatusId',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillLegalName',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillCode',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/IsActive',
          'OrganizationClientRoles/OrganizationClientRoleAlternateBills/IsSelected',
          // 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/IsDraft',
          'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers/Id',
          'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers/OrganizationClientRoleId',
          'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers/UserProfileInternalId',

          'OrganizationInternalRoles/Id',
          'OrganizationInternalRoles/IdOriginal',
          'OrganizationInternalRoles/OrganizationRoleTypeId',
          'OrganizationInternalRoles/OrganizationRoleStatusId',
          'OrganizationInternalRoles/OrganizationId',
          // 'OrganizationInternalRoles/IsDraft',
          'OrganizationInternalRoles/BankAccounts/Id',
          'OrganizationInternalRoles/BankAccounts/OrganizationInternalRoleId',
          'OrganizationInternalRoles/BankAccounts/BankName',
          'OrganizationInternalRoles/BankAccounts/Description',
          'OrganizationInternalRoles/BankAccounts/GLAccount',
          'OrganizationInternalRoles/BankAccounts/Transit',
          'OrganizationInternalRoles/BankAccounts/AccountNo',
          'OrganizationInternalRoles/BankAccounts/AccountId',
          'OrganizationInternalRoles/BankAccounts/CurrencyId',
          'OrganizationInternalRoles/BankAccounts/OrganizationBankSignatureId',
          'OrganizationInternalRoles/BankAccounts/OrganizationBankStatusId',
          'OrganizationInternalRoles/BankAccounts/IsPrimary',
          'OrganizationInternalRoles/BankAccounts/NextChequeNumber',
          'OrganizationInternalRoles/BankAccounts/NextDirectDepositBatchNumber',
          'OrganizationInternalRoles/BankAccounts/NextWireTransferBatchNumber',
          // 'OrganizationInternalRoles/BankAccounts/IsDraft',

          'OrganizationIndependentContractorRoles/Id',
          'OrganizationIndependentContractorRoles/IdOriginal',
          'OrganizationIndependentContractorRoles/OrganizationRoleTypeId',
          'OrganizationIndependentContractorRoles/OrganizationRoleStatusId',
          'OrganizationIndependentContractorRoles/OrganizationId',
          'OrganizationIndependentContractorRoles/NotificationEmail',
          'OrganizationIndependentContractorRoles/IsNonResident',
          'OrganizationIndependentContractorRoles/BusinessNumber',
          // 'OrganizationIndependentContractorRoles/IsDraft',
          'OrganizationIndependentContractorRoles/PaymentMethods/Id',
          'OrganizationIndependentContractorRoles/PaymentMethods/OrganizationIndependentContractorRoleId',
          'OrganizationIndependentContractorRoles/PaymentMethods/PaymentMethodTypeId',
          'OrganizationIndependentContractorRoles/PaymentMethods/IsSelected',
          'OrganizationIndependentContractorRoles/PaymentMethods/IsPreferred',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankCode',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankBranchCode',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankAccountNumber',
          'OrganizationIndependentContractorRoles/PaymentMethods/ProfileNameBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/NameBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/AccountNumberBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/Address1Beneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/Address2Beneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/CityBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/ProvinceOrStateBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/CountryCodeBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/PostalorZipBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/PayCurrencyBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/WireTransferBankTypeIdBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankIDBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/ABANoBeneficiary',
          'OrganizationIndependentContractorRoles/PaymentMethods/WireTransferBankTypeIdIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankNameIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankIdIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/Address1Intemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/Address2Intemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/CityIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/ProvinceOrStateIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/CountryCodeIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/PostalOrZipIntemediary',
          'OrganizationIndependentContractorRoles/PaymentMethods/WireTransferBankTypeIdReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankNameReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/BankIdReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/Address1Receivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/Address2Receivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/CityReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/ProvinceOrStateReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/CountryCodeReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/PostalOrZipReceivers',
          'OrganizationIndependentContractorRoles/PaymentMethods/PaymentDetailNotes',
          'OrganizationIndependentContractorRoles/PaymentMethods/EmployeeId',

          'OrganizationLimitedLiabilityCompanyRoles/Id',
          'OrganizationLimitedLiabilityCompanyRoles/IdOriginal',
          'OrganizationLimitedLiabilityCompanyRoles/OrganizationRoleTypeId',
          'OrganizationLimitedLiabilityCompanyRoles/OrganizationRoleStatusId',
          'OrganizationLimitedLiabilityCompanyRoles/OrganizationId',
          'OrganizationLimitedLiabilityCompanyRoles/NotificationEmail',
          'OrganizationLimitedLiabilityCompanyRoles/IsNonResident',
          'OrganizationLimitedLiabilityCompanyRoles/EmployerIdentificationNumber',
          // 'OrganizationLimitedLiabilityCompanyRoles/IsDraft',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Id',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/OrganizationLimitedLiabilityCompanyRoleId',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PaymentMethodTypeId',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/IsSelected',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/IsPreferred',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankCode',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankBranchCode',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankAccountNumber',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProfileNameBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/NameBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/AccountNumberBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address1Beneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address2Beneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CityBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProvinceOrStateBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CountryCodeBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PostalorZipBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PayCurrencyBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/WireTransferBankTypeIdBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankIDBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ABANoBeneficiary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/WireTransferBankTypeIdIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankNameIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankIdIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address1Intemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address2Intemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CityIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProvinceOrStateIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CountryCodeIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PostalOrZipIntemediary',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/WireTransferBankTypeIdReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankNameReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankIdReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address1Receivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address2Receivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CityReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProvinceOrStateReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CountryCodeReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PostalOrZipReceivers',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PaymentDetailNotes',
          'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/EmployeeId',

          'OrganizationSubVendorRoles/Id',
          'OrganizationSubVendorRoles/IdOriginal',
          'OrganizationSubVendorRoles/OrganizationRoleTypeId',
          'OrganizationSubVendorRoles/OrganizationRoleStatusId',
          'OrganizationSubVendorRoles/OrganizationId',
          // 'OrganizationSubVendorRoles/IsDraft',
          'OrganizationSubVendorRoles/NotificationEmail',
          'OrganizationSubVendorRoles/IsNonResident',
          'OrganizationSubVendorRoles/BusinessNumber',
          'OrganizationSubVendorRoles/UseADifferentPayeeName',
          'OrganizationSubVendorRoles/PayeeName',
          'OrganizationSubVendorRoles/PaymentMethods/Id',
          'OrganizationSubVendorRoles/PaymentMethods/OrganizationSubVendorRoleId',
          'OrganizationSubVendorRoles/PaymentMethods/PaymentMethodTypeId',
          'OrganizationSubVendorRoles/PaymentMethods/IsSelected',
          'OrganizationSubVendorRoles/PaymentMethods/IsPreferred',
          'OrganizationSubVendorRoles/PaymentMethods/BankCode',
          'OrganizationSubVendorRoles/PaymentMethods/BankBranchCode',
          'OrganizationSubVendorRoles/PaymentMethods/BankAccountNumber',
          'OrganizationSubVendorRoles/PaymentMethods/ProfileNameBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/NameBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/AccountNumberBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/Address1Beneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/Address2Beneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/CityBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/ProvinceOrStateBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/CountryCodeBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/PostalorZipBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/PayCurrencyBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/WireTransferBankTypeIdBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/BankIDBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/ABANoBeneficiary',
          'OrganizationSubVendorRoles/PaymentMethods/WireTransferBankTypeIdIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/BankNameIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/BankIdIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/Address1Intemediary',
          'OrganizationSubVendorRoles/PaymentMethods/Address2Intemediary',
          'OrganizationSubVendorRoles/PaymentMethods/CityIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/ProvinceOrStateIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/CountryCodeIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/PostalOrZipIntemediary',
          'OrganizationSubVendorRoles/PaymentMethods/WireTransferBankTypeIdReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/BankNameReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/BankIdReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/Address1Receivers',
          'OrganizationSubVendorRoles/PaymentMethods/Address2Receivers',
          'OrganizationSubVendorRoles/PaymentMethods/CityReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/ProvinceOrStateReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/CountryCodeReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/PostalOrZipReceivers',
          'OrganizationSubVendorRoles/PaymentMethods/PaymentDetailNotes',
          'OrganizationSubVendorRoles/PaymentMethods/EmployeeId',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/Id',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationSubVendorRoleId',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationSubVendorRoleRestrictionTypeId',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationIdClient',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationIdInternal',
          'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/Name'
        ])
        .url();
    return oDataParams;
  }

  public getLatestId(organizationId: number): Promise<number> {
    return this.apiService.query(`org/latestVersionId/${organizationId}`);
  }

  public getUserProfileInternalList() {
    const filter = oreq
      .filter('ProfileStatusId')
      .eq(PhxConstants.ProfileStatus.Active)
      .or()
      .filter('ProfileStatusId')
      .eq(PhxConstants.ProfileStatus.PendingChange)
      .or()
      .filter('ProfileStatusId')
      .eq(PhxConstants.ProfileStatus.InActive)
      .or()
      .filter('ProfileStatusId')
      .eq(PhxConstants.ProfileStatus.PendingInactive)
      .or()
      .filter('ProfileStatusId')
      .eq(PhxConstants.ProfileStatus.PendingActive);
    const oDataParams = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'ProfileStatusId', 'Contact/Id', 'Contact/FullName'])
      .withFilter(filter)
      .url();

    return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public organizationNewOnQuickAdd(command) {
    return Observable.fromPromise(this.apiService.command('OrganizationCreateOnQuickCreate', command));
  }

  public getProfilesForOrganization(organizationIdInternal: number, tableState, oDataParams): Observable<any> {
    const tableStateParams = tableState && tableState !== undefined ? this.generateRequestObject(tableState).url() : '';
    return Observable.fromPromise(this.apiService.query('UserProfile/getProfilesForOrganization/' + organizationIdInternal + '?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '') + tableStateParams));
  }

  public getSingleGarnisheeDetail(organizationId: number, garnisheeId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/getSingleGarnisheeDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '/garnishee/' + garnisheeId));
  }

  public getListGarnisheePayToGroup() {
    return Observable.fromPromise(this.apiService.query('org/getListGarnisheePayToGroup'));
  }

  public getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId, tableState, oDataParams) {
    const tableStateParams = tableState && tableState !== undefined ? this.generateRequestObject(tableState).url() : '';
    return Observable.fromPromise(
      this.apiService.query('org/getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '') + '&' + tableStateParams)
    );
  }

  public garnisheeNewSave(command) {
    return Observable.fromPromise(this.apiService.command('GarnisheeNew', command));
  }

  public garnisheeSubmit(command) {
    return Observable.fromPromise(this.apiService.command('GarnisheeSubmit', command));
  }

  public refreshActiveAdvancesAndActiveGarnisheesCount(organizationId: number) {
    let oDataParams: string;
    oDataParams = oreq
      .request()
      .withSelect(['ActiveAdvancesCount', 'ActiveGarnisheesCount'])
      .url();
    return Observable.fromPromise(this.apiService.query('org?id=' + organizationId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : '')));
  }

  public getListAdvancesByOriginalAndStatusIsActiveOrPendingChangeOrganization(organizationId: number, tableState, oDataParams) {
    const tableStateParams = tableState && tableState !== undefined ? this.generateRequestObject(tableState).url() : '';
    return Observable.fromPromise(
      this.apiService.query('org/getListAdvancesByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '') + '&' + tableStateParams)
    );
  }

  public advanceNew(command) {
    return Observable.fromPromise(this.apiService.command('AdvanceNewState', command));
  }

  public advanceSubmit(command) {
    return Observable.fromPromise(this.apiService.command('AdvanceSubmit', command));
  }

  public getSingleAdvanceDetailByOriginalAndStatusIsActiveOrPendingChangeOrganization(organizationId: number, advanceId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/getSingleAdvanceDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '/advance/' + advanceId));
  }

  public createOrganization() {
    return this.apiService.command('OrganizationCreateState', {
      OrganizationStatusId: PhxConstants.OrganizationStatus.New,
      Code: null,
      LegalName: null,
      DisplayName: null,
      IndustryTypeId: null,
      SectorTypeId: null,
      CountryId: 124, // Country Canada
      DefaultTaxSubdivisionId: null,
      ParentOrganizationId: null,
      ParentOrganization: null,
      OrganizationAddresses: [
        {
          IsPrimary: true,
          AddressDescription: null,
          CityName: null,
          AddressLine1: null,
          AddressLine2: null,
          CountryId: 124, // Country Canada
          SubdivisionId: null,
          PostalCode: null
        }
      ]
    });
  }

  public reloadHeaderFooterImagesData(orgId: number) {
    return this.getOrganizationByIdDataOnly(
      orgId,
      oreq
        .request()
        .withExpand(['OrganizationInternalRoles'])
        .withSelect([
          'OrganizationInternalRoles/DocumentIdHeader',
          'OrganizationInternalRoles/DocumentHeaderName',
          'OrganizationInternalRoles/DocumentHeaderPublicId',
          'OrganizationInternalRoles/DocumentIdFooter',
          'OrganizationInternalRoles/DocumentFooterName',
          'OrganizationInternalRoles/DocumentFooterPublicId',
          'OrganizationInternalRoles/DocumentIdLandscapeHeader',
          'OrganizationInternalRoles/DocumentLandscapeHeaderName',
          'OrganizationInternalRoles/DocumentLandscapeHeaderPublicId',
          'OrganizationInternalRoles/DocumentIdLandscapeFooter',
          'OrganizationInternalRoles/DocumentLandscapeFooterName',
          'OrganizationInternalRoles/DocumentLandscapeFooterPublicId'
        ])
        .url()
    );
  }

  generateRequestObject(tableState) {
    const searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
    const sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? ' desc ' : '') : null;
    let currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
    const pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
    const isDisabled = tableState && tableState.pagination && tableState.pagination.isDisabled ? tableState.pagination.isDisabled : null;
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

  public getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId));
  }

  getSingleVmsFeeHeaderByVersion(vmsFeeVersionId) {
    return Observable.fromPromise(this.apiService.query('org/getSingleVmsFeeHeaderByVersion/vmsFeeVersion/' + vmsFeeVersionId));
  }

  getSingleRebateHeaderByVersion(rebateVersionId) {
    return Observable.fromPromise(this.apiService.query('org/getSingleRebateHeaderByVersion/rebateVersion/' + rebateVersionId));
  }
}
