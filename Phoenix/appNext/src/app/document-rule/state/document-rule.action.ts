import { Action } from 'redux';
import { IDocumentRule } from './document-rule.interface';

export namespace DocumentRuleActions {
    export enum type {
        DocumentRuleLoad = <any>'@phoenix/DocumentRuleLoad',
        DocumentRuleLoadError = <any>'@phoenix/DocumentRuleLoadError',
        DocumentRuleLoadStarted = <any>'@phoenix/DocumentRuleLoadStarted',
        DocumentRuleAdd = <any>'@phoenix/DocumentRuleAdd',
        DocumentRuleDelete = <any>'@phoenix/DocumentRuleDelete',
        DocumentRuleUpdate = <any>'@phoenix/DocumentRuleUpdate'
    }

    export type action =
        | DocumentRuleLoad
        | DocumentRuleLoadError
        | DocumentRuleLoadStarted
        | DocumentRuleAdd
        | DocumentRuleDelete
        | DocumentRuleUpdate;

    export class DocumentRuleLoad implements Action {
        public readonly type = type.DocumentRuleLoad;
        constructor(public Id: number, public oDataParams?: any) { }
    }

    export class DocumentRuleLoadError implements Action {
        public readonly type = type.DocumentRuleLoadError;
        constructor(public Id: number, public documentRule: IDocumentRule, public error) { }
    }
    export class DocumentRuleLoadStarted implements Action {
        public readonly type = type.DocumentRuleLoadStarted;
        constructor(public Id: number) { }
    }
    export class DocumentRuleAdd implements Action {
        public readonly type = type.DocumentRuleAdd;
        constructor(public Id: number, public documentRule: IDocumentRule) {
        }
    }
    export class DocumentRuleDelete implements Action {
        public readonly type = type.DocumentRuleDelete;
        constructor(public Id: number) { }
    }
    export class DocumentRuleUpdate implements Action {
        public readonly type = type.DocumentRuleUpdate;
        constructor(public documentRule: IDocumentRule) { }
    }
}
