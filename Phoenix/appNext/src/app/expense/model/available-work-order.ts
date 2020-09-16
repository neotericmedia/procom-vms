export interface AvailableWorkOrder {
    Id: number;
    WorkOrderNumber: string;
    ClientOrganizationDisplayName: string;
    WorkerName: string;
    StartDate: Date;
    EndDate: Date;
    ExpenseDescription: string;
}
