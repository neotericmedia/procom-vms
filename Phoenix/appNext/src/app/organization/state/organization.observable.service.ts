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
import { IRouterState } from './../../common/state/router/reducer';
// organization
import { IOrganization, IReadOnlyStorage } from './organization.interface';
import { OrganizationAction } from './organization.action';
import { organizationState } from './organization.state';
import { AvailableStateActions } from '../../common/model';

const isDebugMode: boolean = true;

@Injectable()
export class OrganizationObservableService {
  constructor(private apiService: ApiService, private workflowService: WorkflowService, private stateService: StateService, public commonService: CommonService) {
    console.log(this.constructor.name + '.constructor');
  }
  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

  // // If you don't want distinctUntilChanged on b but also don't want updates when a changes, I think this is an alternative:
  private muteFirst_ba = (first$: Observable<IOrganization>, second$: Observable<IOrganization>): Observable<IOrganization> => second$.withLatestFrom(first$, (b, a) => b);

  private getObservableOrganization_from_Server$ = (organizationId: number, showLoader: boolean, oDataParams?: any): Observable<IOrganization> =>
    Observable.create(observer => {
      const completeObserver = (org = null) => {
        this.stateService.dispatchOnAction(new OrganizationAction.OrganizationAdd(organizationId, org));
        observer.next(org);
        observer.complete();
      };
      Promise.all([this.apiService.query('org?id=' + organizationId + (oDataParams || ''), showLoader), this.workflowService.getAvailableStateActions(PhxConstants.EntityType.Organization, organizationId)])
        .then((result: Array<any>) => {
          // debugger;
          const organization: IOrganization = result[0];
          const allStateActions: Array<AvailableStateActions> = result[1];
          const filteredStateActions: Array<AvailableStateActions> = allStateActions && allStateActions.length ? allStateActions.filter(id => id.EntityStatusId === organization.OrganizationStatusId) : null;
          const availableStateActions: Array<number> = filteredStateActions && filteredStateActions.length ? filteredStateActions[0].AvailableStateActions || [] : [];

          const readOnlyStorage: Readonly<IReadOnlyStorage> = {
            IsDebugMode: isDebugMode,
            IsEditable: availableStateActions.some(id => id === PhxConstants.StateAction.OrganizationSave),
            IsComplianceDraftStatus: organization.OrganizationStatusId === PhxConstants.OrganizationStatus.ComplianceDraft || organization.OrganizationStatusId === PhxConstants.OrganizationStatus.RecalledCompliance,
            AccessActions: organization.AccessActions
          };

          const org: IOrganization = {
            ...organization,
            AvailableStateActions: availableStateActions,
            ReadOnlyStorage: readOnlyStorage
          };
          completeObserver(org);
        })
        .catch(responseError => {
          console.log(`====apiService.ResponseError==== ${this.constructor.name}.getObservableOrganization_from_Server: apiService.query('org?id='${organizationId}) : `, responseError);
          completeObserver();
        });
    });

  private getObservableOrganization_from_Store = (organizationId: number): string => organizationState.reduxOrganization.getOrganizationByOrganizationId(organizationId).organizationInstance;

  private getIsLoading_from_store = (Id: number): boolean => {
    return this.stateService.select<boolean>(organizationState.reduxOrganization.isLoading(Id)).value;
  };

  private getObservableOrganization$ = (organizationId: number, showLoader: boolean): Observable<IOrganization> =>
    this.stateService
      .select(this.getObservableOrganization_from_Store(organizationId))
      .filter(org => !org && !this.getIsLoading_from_store(organizationId))
      .do(() => this.stateService.dispatchOnAction(new OrganizationAction.OrganizationLoad(organizationId)))
      .switchMap(() => this.getObservableOrganization_from_Server$(organizationId, showLoader))
      .share();

  // https://medium.com/@m3po22/stop-using-ngrx-effects-for-that-a6ccfe186399
  public organization$ = (component: BaseComponentOnDestroy, organizationId: number, showLoader: boolean = true): Observable<IOrganization> => {
    return this.muteFirst(this.getObservableOrganization$(organizationId, showLoader).startWith(null), this.stateService.select(this.getObservableOrganization_from_Store(organizationId))).takeUntil(component.isDestroyed$);
  };

  public organizationOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<IOrganization> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        const organizationId: number = routerState.params.organizationId;
        return organizationId ? this.organization$(component, organizationId, showLoader) : Observable.of(null);
      })
      .takeUntil(component.isDestroyed$);
  };

  public isExistsOrganizationLegalName(name: string, organizationId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/isExistsOrganizationLegalName?name=' + name + (organizationId ? '&organizationId=' + organizationId : ''), false));
  }

  public isExistsOrganizationCode(code: string, organizationId: number): Observable<any> {
    return Observable.fromPromise(this.apiService.query('org/isExistsOrganizationCode?code=' + code + (organizationId ? '&organizationId=' + organizationId : ''), false));
  }
}
