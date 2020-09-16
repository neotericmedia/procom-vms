import { ExpenseItem } from './expense-Item';
import { AccessAction } from './../../common/model/access-action';
import { WorkflowAction } from './../../common/model/workflow-action';

export interface ExpenseClaim {
  Id: number;
  AccessActions: Array<AccessAction>;
  WorkflowPendingTaskId?: number;
  AssignmentId?: number;
  WorkOrderId?: number;
  WorkOrderVersionId?: number;
  WorkOrderNumber?: string;
  WorkOrderVersionIdAtSubmission?: number;
  WorkerName: string;
  WorkOrderStartDate?: Date;
  WorkOrderEndDate?: Date;
  FromDate?: Date;
  ToDate?: Date;
  CurrencyId?: number;
  Title: string;
  ExpenseClaimStatusId: number;
  NoteBackOffice: string;
  NoteApprover: string;
  Description: string;
  WorkOrderExpenseDescription?: string;
  IsDraft: boolean;
  LastModifiedByProfileId: number;
  LastModifiedDatetime: Date;
  CreatedByProfileId: number;
  CreatedDatetime: Date;
  OrganizationInternalDisplayName: string;
  ClientDisplayName: string;
  ClientId: number;
  Total: number;
  TotalApproved: number;
  ExpenseItems: Array<ExpenseItem>;
  WorkflowAvailableActions: Array<WorkflowAction>;
  AvailableStateActions: Array<Number>;
  CurrentApproverNames: string;
  InternalOrganizationDefinition1Id: number;
}
