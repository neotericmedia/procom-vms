import { PhxConstants } from '../../common';

export interface IT4PrintWorker {
    Id: number;
    DisplayName: string;
    Index: number;
    // dx-select-box properties
    disabled?: boolean;
    template?: string;
}

export interface IT4PrintRequestPayload {
    OrganizationIdInternal: number;
    Year: number;
    T4SlipTypes: PhxConstants.T4SlipType[];
    ExcludeInactive: boolean; // ProfileStatusId not in (ProfileStatus.Inactive, ProfileStatus.PendingActive)
    ExcludePrinted: boolean; // PrintedStatus not = Completed
    ContactIdWorkerRangeStart: number;
    ContactIdWorkerRangeEnd: number;
}
