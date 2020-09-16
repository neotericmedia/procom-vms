import { AccessAction } from './../../common/model/access-action';
import { WorkflowAction } from './../../common/model/workflow-action';

export interface RemittanceBatch {

    Id: number;
    OrganizationIdInternal: number;
    OrganizationInternalDisplayName: string;
    RemittanceDate: Date;
    BatchNumber: number;
    RemittanceTypeId: number;
    RemittanceTransactionBatchStatusId: number;
    TotalAmount: number;
    CurrencyId: number;
    WorkflowPendingTaskId: number;
    AccessActions: Array<AccessAction>;
    WorkflowAvailableActions: Array<WorkflowAction>;
}

