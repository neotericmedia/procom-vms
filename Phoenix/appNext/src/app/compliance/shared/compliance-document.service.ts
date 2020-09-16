import { IApplicableComplianceTemplate, IApplicableComplianceTemplateDto, IComplianceDocumentLiteDto } from './../shared/compliance-document.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { StateService } from '../../common/state/service/state.service';
import { LoadingSpinnerService } from '../../common/loading-spinner/service/loading-spinner.service';
import { ApiService } from '../../common/services/api.service';
import { WorkflowService } from '../../common/services/workflow.service';
import { CommonService } from '../../common/index';
import { IComplianceDocumentDto, DocHeaderWorkOrderInfo, DocHeaderOrgInfo, DocHeaderUserProfileInfo, IComplianceDocumentHeader, IComplianceDocument, IComplianceDocumentEntityGroup } from '../shared/compliance-document.model';
import { ComplianceDocumentActions } from '../state/compliance-document.action';
import { PhxConstants } from '../../common/model/phx-constants';
import { CommandResponse } from '../../common/model';
import { complianceDocumentState } from './../state/compliance-document.state';

import * as moment from 'moment';

@Injectable()
export class ComplianceDocumentService {
  static isLoadingComplianceDocumentList: {
    [entityTypeId_entityId: string]: boolean
  } = {};
  applicationConstants: any;
  routePrefix: string;
  constructor(private apiService: ApiService, private stateService: StateService, private commonService: CommonService, private loadingSpinnerService: LoadingSpinnerService, private workflowService: WorkflowService) {
    this.routePrefix = 'ComplianceDocument';
  }

  private param(oDataParams) {
    return oDataParams ? `?${oDataParams}` : '';
  }

  private setIsLoadingComplianceDocumentList(entityTypeId: number, entityId: number, isLoading: boolean) {
    ComplianceDocumentService.isLoadingComplianceDocumentList[`${entityTypeId}_${entityId}`] = isLoading;
  }

  private getIsLoadingComplianceDocumentList(entityTypeId: number, entityId: number) {
    return ComplianceDocumentService.isLoadingComplianceDocumentList[`${entityTypeId}_${entityId}`];
  }

  public loadList(entityTypeId: number, entityId: number, oDataParams = null) {
    if (!this.getIsLoadingComplianceDocumentList(entityTypeId, entityId)) {
      this.setIsLoadingComplianceDocumentList(entityTypeId, entityId, true);
      this.apiService.query(`${this.routePrefix}/getListComplianceDocumentsByEntityTypeIdAndEntityId/${entityTypeId}/${entityId}${this.param(oDataParams)}`).then((response: any) => {
        console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - loadList response');
        this.stateService.dispatchOnAction(new ComplianceDocumentActions.ComplianceDocumentLoadList(response.Items));
        this.setIsLoadingComplianceDocumentList(entityTypeId, entityId, false);
      }).catch(() => {
        this.setIsLoadingComplianceDocumentList(entityTypeId, entityId, false);
      });
    }
    console.log('Complience Document: [' + new Date().toISOString().slice(11, -5) + '] - loadList called');
    return this.stateService.select<IComplianceDocumentDto[]>(complianceDocumentState.reduxComplianceDocument.ComplianceDocumentInstance);
  }

  public groupHeadersByEntity(headers: IComplianceDocumentHeader[]) {
    const result = headers.reduce<IComplianceDocumentEntityGroup[]>((entityGroups, header) => {
      let group = entityGroups.find(x => x.EntityTypeId === header.EntityTypeId && x.EntityId === header.EntityId);
      if (group == null) {
        group = {
          EntityTypeId: header.EntityTypeId,
          EntityId: header.EntityId,
          Headers: []
        };
        entityGroups.push(group);
      }
      group.Headers.push(header);
      return entityGroups;
    }, []);

    result.forEach(group => group.Headers.sort((a, b) => this.getSortIndexComplianceDocumentHeader(a, b)));

    result.sort((a, b) => this.getSortIndexEntityType(a.EntityTypeId, b.EntityTypeId));
    return result;
  }

  getAvailableStateActions(entityId: number) {
    return this.workflowService.getAvailableStateActions(PhxConstants.EntityType.ComplianceDocument, entityId, false);
  }

  public getHeadersFromEntityGroups(entityGroups: IComplianceDocumentEntityGroup[]): IComplianceDocumentHeader[] {
    return entityGroups.reduce<IComplianceDocumentHeader[]>((headers, group) => {
      return headers.concat(group.Headers);
    }, []);
  }

  public getComplianceDocumentHeaders(documents: IComplianceDocumentDto[]): IComplianceDocumentHeader[] {
    return documents.reduce<IComplianceDocumentHeader[]>((headers: IComplianceDocumentHeader[], document: IComplianceDocumentDto) => {
      let header = headers.find(x => x.Id === document.ComplianceDocumentHeaderId);
      if (header == null) {
        const templates = this.mapComplianceTemplates(document.ApplicableComplianceTemplates);
        header = {
          Id: document.ComplianceDocumentHeaderId,
          EntityTypeId: document.ComplianceDocumentHeaderToEntityTypeId,
          EntityId: document.ComplianceDocumentHeaderToEntityId,

          ComplianceDocumentRuleId: document.ComplianceDocumentRuleId,
          ComplianceDocumentRuleAreaTypeId: document.ComplianceDocumentRuleAreaTypeId,
          ComplianceDocumentRuleRequiredTypeId: document.ComplianceDocumentRuleRequiredTypeId,
          ComplianceDocumentRuleDisplayName: document.ComplianceDocumentRuleDisplayName,
          ComplianceDocumentRuleExpiryTypeId: document.ComplianceDocumentRuleExpiryTypeId,
          ComplianceDocumentCurrent: null,
          PreviousDocuments: [],
          ApplicableTemplateDocuments: templates,
          HasTemplates: templates.some(x => x.TemplateType === PhxConstants.ComplianceTemplateDocumentType.Template),
          HasSamples: templates.some(x => x.TemplateType === PhxConstants.ComplianceTemplateDocumentType.Sample)
        };
        headers.push(header);
      }

      const complianceDoc = this.mapComplianceDocument(document);
      if (!header.ComplianceDocumentCurrent || complianceDoc.Id > header.ComplianceDocumentCurrent.Id) {
        if (header.ComplianceDocumentCurrent) {
          header.PreviousDocuments.push(header.ComplianceDocumentCurrent);
        }
        header.ComplianceDocumentCurrent = complianceDoc;
      } else {
        header.PreviousDocuments.push(complianceDoc);
      }

      return headers;
    }, []);
  }

  getSortIndexEntityType(a: PhxConstants.EntityType, b: PhxConstants.EntityType) {
    const entityTypeOrder = [
      PhxConstants.EntityType.WorkOrder,
      PhxConstants.EntityType.UserProfile,
      PhxConstants.EntityType.OrganizationClientRole,
      PhxConstants.EntityType.OrganizationIndependentContractorRole,
      PhxConstants.EntityType.OrganizationSubVendorRole,
      PhxConstants.EntityType.OrganizationLimitedLiabilityCompanyRole
    ];

    return entityTypeOrder.indexOf(a) - entityTypeOrder.indexOf(b);
  }

  getSortIndexComplianceDocumentHeader(a: IComplianceDocumentHeader, b: IComplianceDocumentHeader) {
    return a.ComplianceDocumentRuleRequiredTypeId - b.ComplianceDocumentRuleRequiredTypeId || (a.ComplianceDocumentRuleDisplayName > b.ComplianceDocumentRuleDisplayName ? 1 : -1);
  }

  public getFilteredDocumentEntityGroupsForTemplateType(documentEntityGroups: IComplianceDocumentEntityGroup[], templateType: PhxConstants.ComplianceTemplateDocumentType, complianceDocumentHederId?: number) {
    return documentEntityGroups.reduce<IComplianceDocumentEntityGroup[]>((relevantGroups, group) => {
      if (this.isGroupRelevantForTemplates(group, templateType, complianceDocumentHederId)) {
        const reduceGroup = {
          ...group,
          Headers: group.Headers.filter(header => this.isHeaderRelevantForTemplates(header, templateType, complianceDocumentHederId)).map(header => {
            return {
              ...header,
              ApplicableTemplateDocuments: header.ApplicableTemplateDocuments.filter(template => template.TemplateType === templateType)
            };
          })
        };
        relevantGroups.push(reduceGroup);
      }
      return relevantGroups;
    }, []);
  }

  public isGroupRelevantForTemplates(group: IComplianceDocumentEntityGroup, templateType: PhxConstants.ComplianceTemplateDocumentType, complianceDocumentHeaderId?: number) {
    return group.Headers.some(header => this.isHeaderRelevantForTemplates(header, templateType, complianceDocumentHeaderId));
  }
  private isHeaderRelevantForTemplates(header: IComplianceDocumentHeader, templateType: PhxConstants.ComplianceTemplateDocumentType, complianceDocumentHeaderId?: number) {
    if (complianceDocumentHeaderId != null && header.Id !== complianceDocumentHeaderId) {
      return false;
    }
    return header.ApplicableTemplateDocuments.filter(x => x.TemplateType === templateType).length > 0;
  }

  public getTemplateTypeForStateAction(stateAction: PhxConstants.StateAction) {
    return stateAction === PhxConstants.StateAction.ComplianceDocumentViewSample ? PhxConstants.ComplianceTemplateDocumentType.Sample : PhxConstants.ComplianceTemplateDocumentType.Template;
  }

  public getFilteredDocumentEntityGroupsForTemplateAction(stateAction: PhxConstants.StateAction, documentEntityGroups: IComplianceDocumentEntityGroup[], complianceDocumentHederId?: number) {
    const templateType = this.getTemplateTypeForStateAction(stateAction);
    return this.getFilteredDocumentEntityGroupsForTemplateType(documentEntityGroups, templateType, complianceDocumentHederId);
  }

  private mapComplianceDocument(document: IComplianceDocumentDto): IComplianceDocument {
    return {
      Id: document.ComplianceDocumentId,
      ComplianceDocumentStatusId: document.ComplianceDocumentStatusId,
      ComplianceDocumentSnoozeExpiryDate: this.mapDate(document.ComplianceDocumentSnoozeExpiryDate),
      ComplianceDocumentExpiryDate: this.mapDate(document.ComplianceDocumentExpiryDate),
      AvailableStateActions: document.AvailableStateActions,
      Documents: document.Documents
    };
  }

  private mapComplianceTemplates(complianceTemplates: IApplicableComplianceTemplateDto[]): IApplicableComplianceTemplate[] {
    const templates = complianceTemplates
      .filter(x => x.ComplianceTemplateTemplateDocumentPublicId != null)
      .map(x => this.mapComplianceTemplateDocument(x, PhxConstants.ComplianceTemplateDocumentType.Template, x.ComplianceTemplateSampleDocumentPublicId, x.ComplianceTemplateTemplateDocumentName));

    const samples = complianceTemplates
      .filter(x => x.ComplianceTemplateSampleDocumentPublicId != null)
      .map(x => this.mapComplianceTemplateDocument(x, PhxConstants.ComplianceTemplateDocumentType.Sample, x.ComplianceTemplateSampleDocumentPublicId, x.ComplianceTemplateSampleDocumentName));

    return [...templates, ...samples];
  }

  private mapComplianceTemplateDocument(complianceTemplate: IApplicableComplianceTemplateDto, templateType: PhxConstants.ComplianceTemplateDocumentType, documentPublicId: string, documentName: string): IApplicableComplianceTemplate {
    return {
      Id: complianceTemplate.ComplianceTemplateId,
      TemplateType: templateType,
      Name: complianceTemplate.ComplianceTemplateName,
      DocumentPublicId: documentPublicId,
      DocumentName: documentName
    };
  }

  public mapDate(date: string) {
    return !date
      ? null
      : moment(date, PhxConstants.DateFormat.API_Datetime)
          .startOf('day')
          .toDate();
  }

  public clearList() {
    this.stateService.dispatchOnAction(new ComplianceDocumentActions.ComplianceDocumentClearList());
  }

  public executeStateCommand(commandName: string, payload: any, showLoader: boolean = true): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      this.apiService
        .command(commandName, payload, showLoader)
        .then((response: CommandResponse) => {
          if (!response.IsValid) {
            reject(response.ValidationMessages);
          } else {
            resolve(response);
          }
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public updateState(complianceDocument: IComplianceDocumentDto) {
    this.stateService.dispatchOnAction(new ComplianceDocumentActions.ComplianceDocumentUpdateState(complianceDocument));
  }

  public updateAvailableStateActions(entityId: number, availableStateActions: number[]) {
    this.stateService.dispatchOnAction(new ComplianceDocumentActions.ComplianceDocumentUpdateAvailableStateActions(entityId, availableStateActions));
  }

  public loadComplianceDoc(complianceDocumentId: number): Observable<IComplianceDocumentLiteDto> {
    return Observable.fromPromise(this.apiService.query(`${this.routePrefix}/lite/${complianceDocumentId}`));
  }
  public getWorkorderInfo(workOrderId: number): Observable<DocHeaderWorkOrderInfo> {
    const queryStr = `$filter=(WorkOrderId eq ${workOrderId})&$select=WorkOrderFullNumber,WorkerName,ClientName`;
    return Observable.fromPromise(this.apiService.query(`assignment/getSearch?${queryStr}`).then((res: any) => res.Items[0]));
  }
  public getOrgInfo(roleId: number, orgRole: PhxConstants.EntityType): Observable<DocHeaderOrgInfo> {
    let action = '';
    switch (orgRole) {
      case PhxConstants.EntityType.OrganizationIndependentContractorRole:
        action = 'getByOrganizationIndependentContractorRoleId';
        break;
      case PhxConstants.EntityType.OrganizationClientRole:
        action = 'getByOrganizationClientRoleId';
        break;
      case PhxConstants.EntityType.OrganizationInternalRole:
        action = 'getByOrganizationInternalRoleId';
        break;
      case PhxConstants.EntityType.OrganizationSubVendorRole:
        action = 'getByOrganizationSubVendorRoleId';
        break;
      case PhxConstants.EntityType.OrganizationLimitedLiabilityCompanyRole:
        action = 'getByOrganizationLimitedLiabilityCompanyRoleId';
        break;
    }
    return Observable.fromPromise(this.apiService.query(`org/${action}/${roleId}`));
  }
  public getProfileInfo(userProfileId: number): Observable<DocHeaderUserProfileInfo> {
    const queryStr = `$filter=(UserProfileId eq ${userProfileId})&$select=FirstName,LastName`;
    return Observable.fromPromise(this.apiService.query(`Contact/Search?${queryStr}`).then((res: any) => res.Items[0]));
  }
  public getMaxSnoozeExpiryDate(entityTypeId: number, entityId: number): Observable<Date> {
    let maxSnoozeExpiryDate$: Observable<Date> = Observable.of(null);
    if (entityTypeId === this.commonService.ApplicationConstants.EntityType.WorkOrder) {
      const queryStr = `$filter=(WorkOrderId eq ${entityId})&$select=EndDate`;
      maxSnoozeExpiryDate$ = Observable.fromPromise(
        this.apiService.query(`assignment/getSearch?${queryStr}`).then((res: any) => {
          let maxSnoozeExpiryDate: Date = null;
          if (res.Items.length) {
            const m = moment(res.Items[0].EndDate);
            maxSnoozeExpiryDate = m.toDate();
          }
          return maxSnoozeExpiryDate;
        })
      );
    }
    return maxSnoozeExpiryDate$;
  }

  isExpiryDateRequired(action: PhxConstants.StateAction, expiryType: PhxConstants.ComplianceDocumentRuleExpiryType) {
    if (action === PhxConstants.StateAction.ComplianceDocumentApproveSnooze) {
      return true;
    } /* else if (action === PhxConstants.StateAction.ComplianceDocumentEditExpiryDate) {
      return expiryType === PhxConstants.ComplianceDocumentRuleExpiryType.UserDefinedMandatory;
    }*/

    return false;
  }

  isCommentRequired(action: PhxConstants.StateAction) {
    return action === PhxConstants.StateAction.ComplianceDocumentRequestSnooze || action === PhxConstants.StateAction.ComplianceDocumentRequestExemption;
  }
}
