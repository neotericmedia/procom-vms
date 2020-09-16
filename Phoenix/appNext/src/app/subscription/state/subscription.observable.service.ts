import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { Observable } from '../../../../node_modules/rxjs';
import { ISubscription, IReadOnlyStorage } from './subscription.interface';
import { ApiService, WorkflowService, CommonService, PhxConstants } from '../../common';
import { StateService } from '../../common/state/service/state.service';
import { SubscriptionAction } from './subscription.action';
import { WorkflowAction } from '../../common/model';
import { SubscriptionState } from './subscription.state';
import { Injectable } from '../../../../node_modules/@angular/core';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';


const isDebugMode: boolean = true;
@Injectable()
export class SubscriptionObservableService {
    constructor(private apiService: ApiService,
        private workflowService: WorkflowService,
        private stateService: StateService,
        public commonService: CommonService) {
        console.log(this.constructor.name + '.constructor');
    }

    private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();


    public subscription$ = (component: BaseComponentOnDestroy, subscriptionId: number, showLoader: boolean = true): Observable<ISubscription> => {
        // debugger;
        return this.muteFirst(
            this.getObservableSubscription$(subscriptionId, showLoader).startWith(null),
            this.stateService.select(this.getObservableSubscription_from_Store(subscriptionId))
        ).takeUntil(component.isDestroyed$);
    };

    private getObservableSubscription$ = (subscriptionId: number, showLoader: boolean): Observable<ISubscription> =>
        this.stateService
            .select(this.getObservableSubscription_from_Store(subscriptionId))
            .map(org => !org)
            .filter(needOrg => needOrg)
            .do(() => this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionLoad(subscriptionId)))
            .switchMap(() => this.getObservableSubscription_from_Server$(subscriptionId, showLoader))
            .do((subscription: ISubscription) => {
                this.stateService.dispatchOnAction(new SubscriptionAction.SubscriptionAdd(subscriptionId, subscription));
            })
            .share();

    getObservableSubscription_from_Server$ = (subscriptionId: number, showLoader: boolean): Observable<ISubscription> =>
        Observable.create(observer => {
            Promise.all([
                this.apiService.query('AccessSubscription/getAccessSubscription/' + subscriptionId, showLoader),
                this.workflowService.getAvailableActions(PhxConstants.EntityType.AccessSubscription, subscriptionId, showLoader)
            ]).then((result: Array<any>) => {
                const subscription: ISubscription = result[0];
                const workflowAvailableActions = result[1];
                if (workflowAvailableActions.length > 0) {
                    workflowAvailableActions.forEach((action: WorkflowAction) => {
                        if (action.CommandName.includes('Submit')) {
                            action.checkValidation = true;
                        }
                        action.IsActionButton = true;
                    });
                    subscription.WorkflowAvailableActions = workflowAvailableActions;
                    subscription.WorkflowPendingTaskId = workflowAvailableActions[0].WorkflowPendingTaskId;
                }

                const readOnlyStorage: Readonly<IReadOnlyStorage> = {
                    IsDebugMode: isDebugMode,
                    IsEditable: subscription.AccessSubscriptionStatusId === PhxConstants.AccessSubscriptionStatus.Draft,
                    // || subscription.AccessSubscriptionStatusId === PhxConstants.ProfileStatus.PendingChange,
                    AccessActions: subscription.AccessActions
                };
                observer.next({ ...subscription, ReadOnlyStorage: readOnlyStorage });
                observer.complete();
            })
                .catch(responseError => {
                    observer.next(responseError);
                    observer.complete();
                });
        });

    private getObservableSubscription_from_Store = (subscriptionId: number): string => SubscriptionState.reduxSubscription.getSubscriptionBySubscrptionId(subscriptionId).subscriptionInstance;

    public subscriptionOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<ISubscription> => {
        return this.stateService
            .selectOnAction(getRouterState)
            .switchMap((routerState: IRouterState) => {
                const subscriptionId: number = routerState.params.subscriptionId;
                return subscriptionId ? this.subscription$(component, subscriptionId, showLoader) : Observable.of(null);
            })
            .takeUntil(component.isDestroyed$);
    };

}
