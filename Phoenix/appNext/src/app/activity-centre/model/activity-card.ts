import { ActivityCardField } from './index';

export interface ActivityCard {
    entityId: number;
    entityTypeId: number;
    pendingTaskId: number;
    entityAbbreviation: string;
    actionLink: string;
    cardFields: Array<ActivityCardField>;
    selected?: boolean; // TODO: make required
    userProfileIdWorker?: number;
    isTest?: boolean;
}
