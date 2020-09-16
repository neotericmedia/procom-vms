import { PhxConstants } from '../../common/PhoenixCommon.module';
import { InvoiceBillingTransaction } from './invoice-billing-transaction';
import { AccessAction, WorkflowAction } from '../../common/model/index';
import { InvoiceRecipient } from './invoice-recipient';

export interface Invoice {
    Id: number;

    AccessActions: Array<AccessAction>;
   // WorkflowAvailableActions: Array<WorkflowAction>;
   // WorkflowPendingTaskId?: number;
    AvailableStateActions: Array<number>;

    OrganizationIdInternal: number;
    IsTest: boolean;
    InternalCompanyLegalName: string;
    OrganizationIdClient: number;
    OrganizationClientLegalName: string;
    CurrencyId: number;
    InvoiceDate: Date;
    ReleaseDate?: Date;
    InvoiceNumber: string;
    InvoiceNote1: string;
    InvoiceNote2: string;
    InvoiceNote3: string;
    InvoiceNote4: string;
    OrganizationClientRoleAlternateBillId: number;
    OrganizationClientRoleAlternateBillLegalName: string;
    StatusId: PhxConstants.InvoiceStatus;
    BillingInvoiceTemplateId: PhxConstants.BillingInvoiceTemplate;
    BillingInvoiceTermId: PhxConstants.BillingInvoiceTerms;
    Subtotal: number;
    Tax: number;
    Total: number;
    BillingInvoicePresentationStyleId: number;
    InvoiceBillingTransactionCount: number;
    InvoiceTaxNumbers: any[];
    InvoiceTransactionLines: any[];
    InvoiceTransactions: any[];
    InvoiceBillingTransactions: InvoiceBillingTransaction[];
    InvoiceRecipients: InvoiceRecipient[];
    ClientCourtesyCopies: InvoiceRecipient[];
    InternalCourtesyCopies: InvoiceRecipient[];
    InvoiceTo?: InvoiceRecipient;
    AttachmentCount: number;
}

