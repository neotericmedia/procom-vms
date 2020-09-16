import { PhxDataTableState } from './../index';

export interface PhxDataTableUserProfile {
    Id: number;
    LastModifiedDatetime?: Date |string;
    ComponentName?: string;
    StateName?: string;
    StateDescription?: string;
    State?: PhxDataTableState;
    UserProfileId?: number;
}

export interface PhxDataTableStateDetail {
    Id: number;
    Name: string;
    Description: string;
}
