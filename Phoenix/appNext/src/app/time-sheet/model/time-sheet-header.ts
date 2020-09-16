export interface TimeSheetHeader {
      WorkOrderEndDate: string;
      WorkOrderStartDate: string;
      WorkOrderNumber: number;
      WorkOrderId: number;
      AssignmentId: number;
      TimeSheetStatusId: number;
      TimesheetTypeId: number;
      TimesheetEndDate: Date;
      TimesheetStartDate: Date;
      TimeSheetId: number;
      IsDraft: boolean;
      IsApproved: boolean;
}
