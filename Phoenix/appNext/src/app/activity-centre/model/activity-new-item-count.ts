import { ActivityCount } from './activity-total-response';
export interface ActivityNewItemCount {
    minPendingTaskId: number;
    count: number;
    byTotals: ActivityCount[];
}
