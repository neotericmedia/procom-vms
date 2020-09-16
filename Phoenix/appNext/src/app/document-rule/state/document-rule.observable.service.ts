// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { getRouterState } from '../../common/state/router/reducer';
import { WorkflowService, PhxConstants, CommonService } from '../../common';
import { ApiService } from '../../common/services/api.service';
import { StateService } from '../../common/state/service/state.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { WorkflowAction } from '../../common/model/workflow-action';
import { IRouterState } from '../../common/state/router/reducer';
import { filter } from 'lodash';
// document rule
import { IDocumentRule, IReadOnlyStorage, DocumentRuleState, DocumentRuleActions } from '.';

const isDebugMode: boolean = true;

@Injectable()
export class DocumentRuleObservableService {
  constructor(private apiService: ApiService, private workflowService: WorkflowService, private stateService: StateService, public commonService: CommonService) {
    console.log(this.constructor.name + '.constructor');
  }

  // tslint:disable-next-line:max-line-length
  static odataParameters = `&$expand=ComplianceDocumentRuleRequiredSituations%2CComplianceDocumentRuleUserDefinedDocumentTypes%2CComplianceDocumentRuleRestrictions%2CVersions%2CComplianceDocumentRuleProfileVisibilities&$select=IsOriginal%2CIsOriginalAndStatusIsAtiveOrPendingChange%2CId%2COriginalId%2CComplianceDocumentRuleStatusId%2CComplianceDocumentRuleAreaTypeId%2COrganizationIdClient%2CComplianceDocumentRuleEntityTypeId%2CComplianceDocumentRuleRequiredTypeId%2CComplianceDocumentRuleExpiryTypeId%2CIsRequiredReview%2CIsMultipleSubstitutionsAllowed%2CDisplayName%2CDescription%2CComplianceDocumentRuleProfileVisibilities/Id%2CComplianceDocumentRuleProfileVisibilities/ComplianceDocumentRuleProfileVisibilityTypeId%2CComplianceDocumentRuleProfileVisibilities/IsSelected%2CComplianceDocumentRuleRequiredSituations/Id%2CComplianceDocumentRuleRequiredSituations/ComplianceDocumentRuleRequiredSituationTypeId%2CComplianceDocumentRuleRequiredSituations/IsSelected%2CComplianceDocumentRuleUserDefinedDocumentTypes/Id%2CComplianceDocumentRuleUserDefinedDocumentTypes/UserDefinedCodeComplianceDocumentTypeId%2CComplianceDocumentRuleRestrictions/Id%2CComplianceDocumentRuleRestrictions/ComplianceDocumentRuleRestrictionTypeId%2CComplianceDocumentRuleRestrictions/IsInclusive%2CComplianceDocumentRuleRestrictions/LineOfBusinessId%2CComplianceDocumentRuleRestrictions/ClientOrganizationId%2CComplianceDocumentRuleRestrictions/BranchId%2CComplianceDocumentRuleRestrictions/ProfileTypeId%2CComplianceDocumentRuleRestrictions/InternalOrganizationId%2CComplianceDocumentRuleRestrictions/WorksiteId%2CComplianceDocumentRuleRestrictions/OrganizationRoleTypeId%2CComplianceDocumentRuleRestrictions/TaxSubdivisionId%2CComplianceDocumentRuleRestrictions/WorkerEligibilityId%2CComplianceDocumentRuleRestrictions/Name%2CVersions/Id%2CVersions/ComplianceDocumentRuleStatusId%2CVersions/IsOriginal`;

  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

  private get oDataParameters() {
    // tslint:disable-next-line:max-line-length
    return DocumentRuleObservableService.odataParameters;
  }

  getObservableDocumentRule_from_Server$ = (docRuleId: number, showLoader: boolean, oDataParams?: any): Observable<IDocumentRule> =>
    Observable.create(observer => {
      Promise.all([
        this.apiService.query(`ComplianceDocumentRule?id=${docRuleId}${oDataParams ? oDataParams : this.oDataParameters}`, showLoader),
        this.workflowService.getAvailableActions(PhxConstants.EntityType.ComplianceDocumentRule, docRuleId, showLoader)
      ])
        .then((result: Array<any>) => {
          const documentRule: IDocumentRule = result[0];
          const workflowAvailableActions = result[1] as WorkflowAction[];

          if (workflowAvailableActions.length > 0) {
            documentRule.WorkflowAvailableActions = workflowAvailableActions.filter(x => x.Name !== 'Save as a template');
            documentRule.WorkflowPendingTaskId = workflowAvailableActions[0].WorkflowPendingTaskId;

            workflowAvailableActions.forEach((action, index) => {
              if (action.CommandName !== 'ComplianceDocumentRuleUserActionOriginalActivate' && action.CommandName !== 'ComplianceDocumentRuleUserActionOriginalInactivate') {
                action.IsActionButton = true;
              }

              if (action.CommandName === 'ComplianceDocumentRuleUserActionSubmit' || 
              action.CommandName === 'ComplianceDocumentRuleUserActionFinalize' || 
              action.CommandName === 'ComplianceDocumentRuleUserActionApprove') {
                action.checkValidation = true;
              }

            });

          } else {
            documentRule.WorkflowAvailableActions = [];
          }

          const readOnlyStorage: Readonly<IReadOnlyStorage> = {
            IsDebugMode: isDebugMode,
            IsEditable: documentRule.ComplianceDocumentRuleStatusId === PhxConstants.ComplianceDocumentRuleStatus.Draft || documentRule.ComplianceDocumentRuleStatusId === PhxConstants.ComplianceDocumentRuleStatus.New,
            AccessActions: documentRule.AccessActions
          };
          observer.next({ ...documentRule, ReadOnlyStorage: readOnlyStorage });
          observer.complete();
        })
        .catch(responseError => {
          observer.next(responseError);
          observer.complete();
        });
    });

  private getObservableDocumentRule_from_Store = (docRuleId: number): string => DocumentRuleState.reduxDocumentRule.getDocumentRuleByDocumentRuleId(docRuleId).documentRuleInstance;

  private getObservableDocumentRule$ = (docRuleId: number, showLoader: boolean): Observable<IDocumentRule> =>
    this.stateService
      .select(this.getObservableDocumentRule_from_Store(docRuleId))
      .map(org => !org)
      .filter(needOrg => needOrg)
      .do(() => this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleLoad(docRuleId)))
      .switchMap(() => this.getObservableDocumentRule_from_Server$(docRuleId, showLoader))
      .do((documentRule: IDocumentRule) => {
        this.stateService.dispatchOnAction(new DocumentRuleActions.DocumentRuleAdd(docRuleId, documentRule));
      })
      .share();

  public documentRule$ = (component: BaseComponentOnDestroy, docRuleId: number, showLoader: boolean = true): Observable<IDocumentRule> => {
    return this.muteFirst(this.getObservableDocumentRule$(docRuleId, showLoader).startWith(null), this.stateService.select(this.getObservableDocumentRule_from_Store(docRuleId))).takeUntil(component.isDestroyed$);
  };

  public profileOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<IDocumentRule> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        const complianceDocumentRuleId: number = routerState.params.documentRuleId;
        return complianceDocumentRuleId ? this.documentRule$(component, complianceDocumentRuleId, showLoader) : Observable.of(null);
      }).takeUntil(component.isDestroyed$);
  };
}
