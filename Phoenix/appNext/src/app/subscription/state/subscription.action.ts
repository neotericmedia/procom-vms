import { Action } from 'redux';

import {
    ISubscription, ISubscriptionValidationError,
} from './subscription.interface';

export namespace SubscriptionAction {
    export enum type {
        SubscriptionLoad = <any>'@phoenix/SubscriptionLoad',
        SubscriptionLoadError = <any>'@phoenix/SubscriptionLoadError',
        SubscriptionLoadStarted = <any>'@phoenix/SubscriptionLoadStarted',
        SubscriptionAdd = <any>'@phoenix/SubscriptionAdd',
        SubscriptionDelete = <any>'@phoenix/SubscriptionDelete',
        SubscriptionUpdate = <any>'@phoenix/SubscriptionUpdate',
        SubscriptionValidationErrorAdd = <any>'@phoenix/SubscriptionValidationErrorAdd',
        SubscriptionValidationErrorDelete = <any>'@phoenix/SubscriptionValidationErrorDelete'
    }

    export type action =
        | SubscriptionLoad
        | SubscriptionLoadError
        | SubscriptionLoadStarted
        | SubscriptionAdd
        | SubscriptionDelete
        | SubscriptionUpdate
        | SubscriptionValidationErrorAdd
        | SubscriptionValidationErrorDelete;

    export class SubscriptionLoad implements Action {
        public readonly type = type.SubscriptionLoad;
        constructor(public subscriptionId: number, public oDataParams?: any) { }
    }

    export class SubscriptionLoadError implements Action {
        public readonly type = type.SubscriptionLoadError;
        constructor(public subscriptionId: number, public subscription: ISubscription, public error) { }
    }
    export class SubscriptionLoadStarted implements Action {
        public readonly type = type.SubscriptionLoadStarted;
        constructor(public subscriptionId: number) { }
    }
    export class SubscriptionAdd implements Action {
        public readonly type = type.SubscriptionAdd;
        constructor(public subscriptionId: number, public subscription: ISubscription) {
        }
    }
    export class SubscriptionDelete implements Action {
        public readonly type = type.SubscriptionDelete;
        constructor(public subscriptionId: number) { }
    }
    export class SubscriptionUpdate implements Action {
        public readonly type = type.SubscriptionUpdate;
        constructor(public subscription: ISubscription) { }
    }
    export class SubscriptionValidationErrorAdd implements Action {
        public readonly type = type.SubscriptionValidationErrorAdd;
        constructor(public subscriptionId: number, public validationMessages: Array<ISubscriptionValidationError>) { }
    }
    export class SubscriptionValidationErrorDelete implements Action {
        public readonly type = type.SubscriptionValidationErrorDelete;
        constructor(public subscriptionId: number) { }
    }
}

