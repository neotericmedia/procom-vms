export interface ActivityTotal {
    entityTypeId: number;
    statusId: number;
    total: number;
    description?: string;
    maxPendingTaskId: number;
    showBadge: boolean;
    linkTo: string;
    isActive: boolean;
}
