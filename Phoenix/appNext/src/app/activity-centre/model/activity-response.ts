export interface ActivityResponse {
    Items?: Array<ActivityEntityItem>;
    NextPageLink?: string;
    Count?: number;
}
export interface ActivityEntityItem {
    EntityType: string;
    EntityId: number;
    PendingTaskId: number;
    IsTest: boolean;
    Fields?: Array<ActivityEntityField>;
}
export interface ActivityEntityField {
    Name: string;
    Value?: string;
}
