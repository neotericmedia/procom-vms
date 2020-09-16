import { PaymentRate, TimeSheetDay } from './';

export interface TimeSheetSearch {
    Id: number;
    WorkerName: string;
    ClientName: string;
    StartDate: Date;
    EndDate: Date;
    TotalUnits: string;
    TimeSheetStatusId: number;
    CurrentApprovers: string;
    PORateUnitId: number;
    POUnitsRemaining: number;
    PONumber: string;
}
