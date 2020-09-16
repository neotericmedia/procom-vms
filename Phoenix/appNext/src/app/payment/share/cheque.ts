import { AccessAction, WorkflowAction } from '../../common/model/index';

export interface Cheque {
    Id: number;
    PaymentDate: Date;
    CurrencyId: number;
    PaymentTotal: number;
    PayeeName: string;
    PayeeTypeId: number;
    ChequeNumber: number;
    ChequeCompletionDate?: Date;
    ChequeCompletionReason?: string;
    PayeeAddressLine1: string;
    PayeeAddressLine2: string;
    PayeeAddressLine3: string;
    PayeeAddressLine4: string;
    Reference: string;
    VendorReference: string;
    OrganizationBankSignatureId: number;
    SignatureFileName: string;
    OrganizationalIdInternal: number;
    OrganizationalInternalLegalName: string;
    PaymentStatus: number;
    BankId?: number;
    BankName: string;
    WorkflowAvailableActions: Array<WorkflowAction>;
    AvailableStateActions: Array<number>;
}
