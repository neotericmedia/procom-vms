import { Injectable, EventEmitter, Output } from '@angular/core';
import { ApiService, CommonService } from '../../common/index';
import { Observable } from 'rxjs/Observable';

declare var oreq: any;

@Injectable()
export class DocumentRuleService {
  applicationConstants: any;

  @Output() invoiceIdChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private apiService: ApiService, private commonService: CommonService) {
    this.applicationConstants = this.commonService.ApplicationConstants;
  }

  //  SingleResult Observable
  public getByComplianceDocumentRuleId2(complianceDocumentRuleId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('ComplianceDocumentRule?id=' + complianceDocumentRuleId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : '')));
  }

  //  SingleResult
  public getByComplianceDocumentRuleId(complianceDocumentRuleId, oDataParams) {
    return this.apiService.query('ComplianceDocumentRule?id=' + complianceDocumentRuleId + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : ''));
  }

  // w Observable
  public getListComplianceDocumentRulesOriginal2(oDataParams) {
    return Observable.fromPromise(this.apiService.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginal?' + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : '')));
  }

  // old
  public getListComplianceDocumentRulesOriginal(oDataParams) {
    return this.apiService.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginal?' + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : ''));
  }

  public getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient(oDataParams, complianceDocumentRuleAreaTypeId, organizationIdClient) {
    return this.apiService.query(
      'ComplianceDocumentRule/getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient/' +
      complianceDocumentRuleAreaTypeId +
      '/' +
      organizationIdClient +
      '?' +
      (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '')
    );
  }

  public getInternalUserProfileList(oDataParams) {
    return this.apiService.query('Commission/getInternalUserProfileList?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : ''));
  }

  public complianceDocumentRuleUserActionNew(command) {
    return this.apiService.command('ComplianceDocumentRuleUserActionNew', command);
  }

  public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  getListOrganizationInternal(oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code'])
        .url();
     return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole?' + oDataParams));
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

  

  public getListUserDefinedCodeComplianceDocumentTypesByTableState(tableState, oDataParams) {
    const tableStateParams = this.generateRequestObject(tableState).url();
    return Observable.fromPromise(this.apiService.query('ComplianceDocumentRule/getListUserDefinedCodeComplianceDocumentTypes' + '?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '') + '&' + tableStateParams));
  }

  public getListUserDefinedCodeComplianceDocumentTypes(oDataParams) {
    return Observable.fromPromise(this.apiService.query('ComplianceDocumentType/complianceDocumentTypes?' + (oDataParams && oDataParams !== undefined ? '&' + oDataParams : '')));
  }

  public complianceDocumentRuleUserActionSave(command) {
    return this.apiService.command('ComplianceDocumentRuleUserActionSave', command);
  }

  public complianceDocumentRuleUserActionSubmit(command) {
    return this.apiService.command('ComplianceDocumentRuleUserActionSubmit', command);
  }

  public userDefinedCodeComplianceDocumentTypeNew(command) {
    return this.apiService.command('UserDefinedCodeComplianceDocumentTypeNew', command);
  }

  public userDefinedCodeComplianceDocumentTypeSave(command) {
    return this.apiService.command('UserDefinedCodeComplianceDocumentTypeSave', command);
  }

  public userDefinedCodeComplianceDocumentTypeDiscard(command) {
    return this.apiService.command('UserDefinedCodeComplianceDocumentTypeDiscard', command);
  }

  public userDefinedCodeComplianceDocumentTypeSubmit(command) {
    return this.apiService.command('UserDefinedCodeComplianceDocumentTypeSubmit', command);
  }

  public userDefinedCodeComplianceDocumentTypeActivate(command) {
    return this.apiService.command('UserDefinedCodeComplianceDocumentTypeActivate', command);
  }

  public userDefinedCodeComplianceDocumentTypeInactivate(command) {
    return this.apiService.command('UserDefinedCodeComplianceDocumentTypeInactivate', command);
  }

  public executeAction(action: string, command: {
    CommandName: string,
    Comments?: string,
    ComplianceDocumentRuleId: number,
    WorkflowPendingTaskId: number,
  }) {
    return this.apiService.command(action, command);
  }
}
