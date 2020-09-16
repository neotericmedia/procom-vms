import { Action } from 'redux';
import { IComplianceDocumentDto } from '../shared/compliance-document.model';

export namespace ComplianceDocumentActions {
  export enum type {
    ComplianceDocumentLoadList = <any>'@phoenix/ComplianceDocumentLoadList',
    ComplianceDocumentClearList = <any>'@phoenix/ComplianceDocumentClearList',
    ComplianceDocumentUpdateState = <any>'@phoenix/ComplianceDocumentUpdateState',
    ComplianceDocumentUpdateAvailableStateActions = <any>'@phoenix/ComplianceDocumentUpdateAvailableStateActions'
  }

  export type action = ComplianceDocumentLoadList | ComplianceDocumentClearList | ComplianceDocumentUpdateState | ComplianceDocumentUpdateAvailableStateActions;

  export class ComplianceDocumentLoadList implements Action {
    public readonly type = type.ComplianceDocumentLoadList;
    constructor(public docList: Array<IComplianceDocumentDto>) {}
  }

  export class ComplianceDocumentClearList implements Action {
    public readonly type = type.ComplianceDocumentClearList;
    constructor() {}
  }

  export class ComplianceDocumentUpdateState implements Action {
    public readonly type = type.ComplianceDocumentUpdateState;
    constructor(public doc: IComplianceDocumentDto) {}
  }

  export class ComplianceDocumentUpdateAvailableStateActions implements Action {
    public readonly type = type.ComplianceDocumentUpdateAvailableStateActions;
    constructor(public docId: number, public availableStateActions: Array<number>) {}
  }
}
