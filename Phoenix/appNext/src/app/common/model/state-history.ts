export interface StateHistoryVersionHeader {
  EntityId: number;
  EntityTypeId: number;
  VersionNumber: number;
  EffectiveDate: string;
  StateHistory: Array<StateHistory>;
  StateHistoryGrouped: Array<StateHistoryGroupHeader>;  // UI grouping
  CurrentStatus: number;  // UI mapping
  isOpen: boolean; // UI flag
}

export interface StateHistory {
  ActionEntityLogId?: number;
  ActionLogId?: number;
  EntityStatusId: number;
  StateActionId?: number;
  UserComment?: string;
  Note?: string;
  CreatedByFirstName?: string;
  CreatedByLastName?: string;
  CreatedByFullName?: string;
  CreatedDatetime?: string;
  NextStep?: boolean; // UI field
  Description?: string;  // UI field
}

export interface StateHistoryGroupHeader {
  Future?: boolean;
  NextStep?: boolean;
  LatestCurrent?: boolean;
  EntityStatusId: number;
  StateActionId?: number;
  LastCreatedByFirstName?: string;
  LastCreatedByLastName?: string;
  LastCreatedByFullName?: string;
  LastCreatedDatetime?: string;
  StateHistory?: Array<StateHistory>;
}
