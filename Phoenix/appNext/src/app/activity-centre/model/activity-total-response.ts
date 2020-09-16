export interface ActivityTotalResponse {
    Items?: Array<ActivityCount>;
    NextPageLink?: null;
    Count?: null;
}
export interface ActivityCount {
    EntityTypeId: number;
    Count: number;
    StatusId: number;
    Description: string;
    MaxPendingTaskId: number;
}
