import { Injectable, EventEmitter, Output } from '@angular/core';
import { ApiService, CommonService } from '../../common/index';
import { Observable } from 'rxjs/Observable';


declare var oreq: any;

@Injectable()
export class DocumentRuleService {
  applicationConstants: any;

  @Output() invoiceIdChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private apiService: ApiService,
    private commonService: CommonService,
  ) {
    this.applicationConstants = this.commonService.ApplicationConstants;
  }

  //  SingleResult Observable
  public getByComplianceDocumentRuleId2(complianceDocumentRuleId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('ComplianceDocumentRule?id=' + complianceDocumentRuleId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : '')));
  }

  //  SingleResult
  public getByComplianceDocumentRuleId(complianceDocumentRuleId, oDataParams) {
    return this.apiService.query('ComplianceDocumentRule?id=' + complianceDocumentRuleId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
  }

  // w Observable
  public getListComplianceDocumentRulesOriginal2(oDataParams) {
    return Observable.fromPromise(this.apiService.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginal?'
      + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : '')));
  }

  // old
  public getListComplianceDocumentRulesOriginal(oDataParams) {
    return this.apiService.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginal?'
      + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
  }

  public getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient(oDataParams,
    complianceDocumentRuleAreaTypeId, organizationIdClient) {
    return this.apiService.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient/'
      + complianceDocumentRuleAreaTypeId + '/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
  }

  public getInternalUserProfileList(oDataParams) {
    return this.apiService.query('Commission/getInternalUserProfileList?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
  }

  public complianceDocumentRuleUserActionNew(command) {
    return this.apiService.command('ComplianceDocumentRuleUserActionNew', command);
  }

  public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams) {
    oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
    return this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole'
      + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
  }
}
