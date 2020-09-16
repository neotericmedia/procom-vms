import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';
import { CustomFieldService } from '../../common';

export interface ICommissionAdjustment {
    WorkflowPendingTaskId?: number;
    WorkflowAvailableActions?: any;
    Id: number;
    CommissionAdjustmentHeaderStatusId?: number;
    CommissionAdjustmentHeaderTypeId?: number;
    OrganizationIdInternal: number;
    ClientOrganizationId: number;
    ClientCompany?: string;
    AdjustmentDate: string;
    AdjustmentAmountNet: number;
    Description: string;
    CommissionRecurrency?: boolean;
    CreatedByContactId?: number;
    CreatedByProfileId?: number;
    CreatedByProfileFullName?: string;
    CreatedDatetime?: Date;
    CommissionAdjustmentDetails?: Array<ICommissionAdjustmentDetail>;
    CommissionDocuments?: Array<any>;
    CommissionAdjustmentDocuments?: Array<any>;
    isAdjustmentAmountAdd?: boolean;
    CommissionWorkOrders?: Array<any>;
    CommissionJobOwners?: Array<any>;
}

export interface ICommissionAdjustmentDetail {
    Id?: number;
    CommissionAdjustmentHeaderId?: number;
    CommissionAdjustmentDetailTypeId: number;
    WorkOrderVersionId?: number;
    CommissionRateHeaderId?: number;
    CommissionUserProfileId?: number;
    AdjustmentAmount: number;
    WorkOrderFullNumber?: string;
    WorkerName?: string;
}

export interface IFormGroupSetup {
    hashModel: HashModel;
    toUseHashCode: boolean;
    formBuilder: FormBuilder;
    customFieldService: CustomFieldService;
}

export interface IFormGroupOnNew {
    formBuilder: FormBuilder;
    customFieldService: CustomFieldService;
}