// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { getRouterState } from '../../common/state/router/reducer';
import { WorkflowService, PhxConstants, CommonService } from '../../common';
import { ApiService } from '../../common/services/api.service';
import { StateService } from '../../common/state/service/state.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { IRouterState } from './../../common/state/router/reducer';
// Commission Rate
import { ICommissionRate } from './commission-rate.interface';
import { CommissionRateAction } from './commission-rate.action';
import { commissionRateState } from './commission-rate.state';
import { CommissionService } from '../commission.service';
import { AvailableStateActions } from '../../common/model';
import * as moment from 'moment';

const isDebugMode: boolean = true;

@Injectable()
export class CommissionRateObservableService {
  showTemplate: boolean;
  entityId: number;
  constructor(private apiService: ApiService, private workflowService: WorkflowService, private stateService: StateService, public commonService: CommonService, public commissionService: CommissionService) {
    console.log(this.constructor.name + '.constructor');
  }

  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

  private getObservableCommsissionRate_from_Server$ = (routerParams: any, showLoader: boolean = true, oDataParams?: any): Observable<ICommissionRate> =>
    Observable.create(observer => {
      Promise.all([
        this.apiService.query('Commission/getCommissionRateHeaderByCommissionRateVersionId/' + routerParams.commissionRateVersionId + (oDataParams || ''), showLoader),
        this.workflowService.getAvailableStateActions(PhxConstants.EntityType.CommissionRateHeader, Number(routerParams.commissionRateHeaderId), showLoader)
      ])
        .then((result: Array<any>) => {
          const commsissionRate: ICommissionRate = result[0];
          let index: number;
          index = commsissionRate.CommissionRateVersions.findIndex(version => version.Id === +routerParams.commissionRateVersionId);
          if (index !== -1) {
            commsissionRate.CommissionRateVersions[index].customStatusId = null;
          }
          const allStateActions: Array<AvailableStateActions> = result[1];
          const filteredStateActions: Array<AvailableStateActions> = allStateActions && allStateActions.length ? allStateActions.filter(id => id.EntityStatusId === commsissionRate.CommissionRateHeaderStatusId) : null;
          const availableStateActions: Array<number> = filteredStateActions && filteredStateActions.length ? filteredStateActions[0].AvailableStateActions || [] : [];
          commsissionRate.ReadOnlyStorage = {
            IsDebugMode: isDebugMode,
            IsEditable: true,
            AccessActions: null,
          };
          observer.next(
            {
              ...commsissionRate,
              AvailableStateActions: availableStateActions,
            }
          );
          observer.complete();
        })
        .catch(responseError => {
          observer.next(responseError);
          observer.complete();
        });
    });

  private getObservableCommissionRate_from_Store = (Id: number): string => {
    const val = commissionRateState.reduxCommissionRate.getCommissionRateByVersionId(Id).commissionRateInstance;
    return commissionRateState.reduxCommissionRate.getCommissionRateByVersionId(Id).commissionRateInstance;
  };

  private getObservableCommissionRate$ = (routerParams: any, showLoader: boolean): Observable<ICommissionRate> => {
    return this.stateService
      .select(this.getObservableCommissionRate_from_Store(routerParams.commissionRateVersionId))
      .map(org => {
        return !org;
      })
      .filter(needOrg => needOrg)
      .do(() => this.stateService.dispatchOnAction(new CommissionRateAction.CommissionRateLoad(routerParams.commissionRateVersionId)))
      .switchMap(() => {
        if (routerParams.commissionRateVersionId > 0) {
          return this.getObservableCommsissionRate_from_Server$(routerParams, showLoader);
        } else if (routerParams.commissionUserProfileId > 0 && routerParams.commissionRoleId > 0 &&
          routerParams.commissionRateTypeId > 0) {
          routerParams.commissionRateVersionId = 0;
          return this.getCommissionRateHeadersByCommissionUserProfile(routerParams.commissionUserProfileId,
            routerParams.commissionRoleId,
            routerParams.commissionRateTypeId,
            routerParams.commissionTemplateId,
          );
        }
      })
      .do((commissionRate: ICommissionRate) => {
        this.stateService.dispatchOnAction(new CommissionRateAction.CommissionRateAdd(routerParams.commissionRateVersionId, commissionRate));
      })
      .share();
  };

  public commissionRate$ = (component: BaseComponentOnDestroy, routerParams: any, showLoader: boolean = true): Observable<ICommissionRate> => {
    return this.muteFirst(this.getObservableCommissionRate$(routerParams, showLoader).startWith(null), this.stateService.select(this.getObservableCommissionRate_from_Store(routerParams.commissionRateVersionId))).takeUntil(
      component.isDestroyed$
    );
  };

  public commissionRateOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<ICommissionRate> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        if (routerState.params.commissionRateVersionId > 0) {
          return routerState.params.commissionRateVersionId ? this.commissionRate$(component, routerState.params, showLoader) : Observable.of(null);
        } else if (
          routerState.params.commissionUserProfileId > 0 && routerState.params.commissionRoleId > 0 &&
          routerState.params.commissionRateTypeId > 0
        ) {
          return this.commissionRate$(component, routerState.params);
        }
      })
      .takeUntil(component.isDestroyed$);
  };

  getCommissionRateHeadersByCommissionUserProfile(commissionUserProfileId, commissionRoleId, commissionRateTypeId, commissionTemplateId): Observable<any> {
    const commissionDataParams = oreq.request()
      .withSelect([
        'CommissionUserProfileId',
        'CommissionUserProfileFirstName',
        'CommissionUserProfileLastName',
        'CommissionUserProfileStatusName',
      ]).url();
    return Observable.create((observer) => {
      this.commissionService.getCommissionRateHeadersByCommissionUserProfile(commissionUserProfileId, commissionDataParams).subscribe((responseSucces: any) => {
        if (responseSucces.Items !== null && responseSucces.Items.length === 1) {
          const commissionRate = {
            Id: 0,
            CommissionRateHeaderStatusId: PhxConstants.CommissionRateHeaderStatus.New,
            CommissionRateRestrictions: [],
            CommissionRateTypeId: commissionRateTypeId,
            CommissionRateVersions: [{
              Id: 0,
              CommissionRateVersionStatusId: PhxConstants.CommissionRateVersionStatus.New,
              EffectiveDate: moment(new Date()).format('YYYY-MM-DD'),
              ScheduledChangeRateApplicationId: PhxConstants.ScheduledChangeRateApplication.AllWorkOrders,
              Percentage: null,
              customStatusId: null
            }],
            CommissionRoleId: commissionRoleId,
            CommissionUserProfileId: commissionUserProfileId,
            Description: null,
            CommissionUserProfileFirstName: responseSucces.Items[0].CommissionUserProfileFirstName,
            CommissionUserProfileLastName: responseSucces.Items[0].CommissionUserProfileLastName,
            CommissionUserProfileStatusName: responseSucces.Items[0].CommissionUserProfileStatusName,
            CommissionUserProfileStatusId: responseSucces.Items[0].CommissionUserProfileStatusId,
            ReadOnlyStorage: {
              IsDebugMode: true,
              IsEditable: true,
              AccessActions: null,
            }
          };
          if (commissionTemplateId > 0) {
            this.commissionService.getTemplate(commissionTemplateId).subscribe((responseSuccesTemplate: any) => {

              commissionRate.Description = responseSuccesTemplate.Entity.Description;

              commissionRate.CommissionRateRestrictions = responseSuccesTemplate.Entity.CommissionRateRestrictions;

              commissionRate.CommissionRateVersions[0].ScheduledChangeRateApplicationId = responseSuccesTemplate.Entity.CommissionRateVersions[0].ScheduledChangeRateApplicationId;
              commissionRate.CommissionRateVersions[0].Percentage = responseSuccesTemplate.Entity.CommissionRateVersions[0].Percentage;
              observer.next(commissionRate);
              observer.complete();
            });
          } else {
            observer.next(commissionRate);
            observer.complete();
          }
        }
      });
    });
  }
}
