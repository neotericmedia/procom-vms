// https://github.com/markerikson/redux/blob/structuring-reducers-page/docs/recipes/reducers/09-ImmutableUpdatePatterns.md
// https://github.com/angular-redux/example-app/blob/master/src/app/animals/api/reducer.ts
import { ReducerUtility } from '../../common/state/service/reducer.utility';
import { SubscriptionAction } from './subscription.action';
import { ISubscription } from './subscription.interface';

interface ISubscriptionsState {
    subscriptions: { [Id: number]: ISubscription };
    loading: boolean;
    error: any;
}

const subscriptionInitials: ISubscriptionsState = {
    subscriptions: {},
    loading: false,
    error: null
};

export const subscriptionReducer = (currState: ISubscriptionsState = subscriptionInitials, action: SubscriptionAction.action): ISubscriptionsState => {
    switch (action.type) {
        case SubscriptionAction.type.SubscriptionLoadStarted: {
            const payload = action as SubscriptionAction.SubscriptionLoadStarted;
            console.log(`subscriptionReducer: type:${payload.type}, subscriptionId:${payload.subscriptionId}`);
            return currState;
        }
        case SubscriptionAction.type.SubscriptionLoadError: {
            const payload = action as SubscriptionAction.SubscriptionLoadError;
            console.log(`subscriptionReducer: type:${payload.type}, subscriptionId:${payload.subscriptionId}, payload:${payload}`);
            return {
                ...currState,
                subscriptions: {},
                loading: false,
                error: payload.error
            };
        }
        case SubscriptionAction.type.SubscriptionAdd: {
            const payload = action as SubscriptionAction.SubscriptionAdd;
            console.log(`subscriptionReducer: type:${payload.type}, subscriptionId:${payload.subscriptionId}, subscription.Id:${payload.subscription == null ? null : payload.subscription.Id}`);
            return {
                ...currState,
                subscriptions: { ...currState.subscriptions, [payload.subscriptionId]: payload.subscription },
                loading: false,
                error: null
            };
        }
        case SubscriptionAction.type.SubscriptionDelete: {
            const payload = action as SubscriptionAction.SubscriptionDelete;
            console.log(`subscriptionReducer: type:${payload.type}, subscriptionId:${payload.subscriptionId}`);
            // debugger;
            const orgs = { ...currState.subscriptions };
            delete orgs[payload.subscriptionId];
            return {
                ...currState,
                subscriptions: orgs
            };
        }
        case SubscriptionAction.type.SubscriptionUpdate: {
            // debugger;
            const payload = action as SubscriptionAction.SubscriptionUpdate;
            if (!payload.subscription) {
                return currState;
            }
            console.log(`subscriptionReducer: type:${payload.type}, subscriptionId:${payload.subscription.Id}, payload:${payload}`);
            return {
                ...currState,
                subscriptions: {
                    ...currState.subscriptions,
                    [payload.subscription.Id]: payload.subscription
                }
            };
        }
        default: {
            return currState;
        }
    }
};
