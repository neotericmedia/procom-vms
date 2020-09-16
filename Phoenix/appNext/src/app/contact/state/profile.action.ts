import { Action } from 'redux';

import {
    IProfile,
    IProfileValidationError
} from './profile.interface';

export namespace ProfileAction {
    export enum type {
        ProfileLoad = <any>'@phoenix/ProfileLoad',
        ProfileLoadError = <any>'@phoenix/ProfileLoadError',
        ProfileLoadStarted = <any>'@phoenix/ProfileLoadStarted',
        ProfileAdd = <any>'@phoenix/ProfileAdd',
        ProfileRefresh = <any>'@phoenix/ProfileRefresh',
        ProfileUpdate = <any>'@phoenix/ProfileUpdate',
        ProfileValidationErrorAdd = <any>'@phoenix/htmlOnClickProfileValidationErrorAdd',
        ProfileValidationErrorDelete = <any>'@phoenix/ProfileValidationErrorDelete',
        ClearProfile = <any>'@phoenix/ClearProfile',
    }

    export type action =
        | ProfileLoad
        | ProfileLoadError
        | ProfileLoadStarted
        | ProfileAdd
        | ProfileRefresh
        | ProfileUpdate
        | ProfileValidationErrorAdd
        | ProfileValidationErrorDelete
        | ClearProfile;

    export class ProfileLoad implements Action {
        public readonly type = type.ProfileLoad;
        constructor(public Id: number, public oDataParams?: any) { }
    }

    export class ProfileLoadError implements Action {
        public readonly type = type.ProfileLoadError;
        constructor(public Id: number, public profile: IProfile, public error) { }
    }
    export class ProfileLoadStarted implements Action {
        public readonly type = type.ProfileLoadStarted;
        constructor(public Id: number) { }
    }
    export class ProfileAdd implements Action {
        public readonly type = type.ProfileAdd;
        constructor(public Id: number, public profile: IProfile) {
        }
    }
    export class ProfileRefresh implements Action {
        public readonly type = type.ProfileRefresh;
        constructor(public Id: number) { }
    }
    export class ProfileUpdate implements Action {
        public readonly type = type.ProfileUpdate;
        constructor(public profile: IProfile) { }
    }
    export class ProfileValidationErrorAdd implements Action {
        public readonly type = type.ProfileValidationErrorAdd;
        constructor(public Id: number, public validationMessages: Array<IProfileValidationError>) { }
    }
    export class ProfileValidationErrorDelete implements Action {
        public readonly type = type.ProfileValidationErrorDelete;
        constructor(public Id: number) { }
    }

    export class ClearProfile implements Action {
        public readonly type = type.ClearProfile;
        constructor() { }
    }
}

