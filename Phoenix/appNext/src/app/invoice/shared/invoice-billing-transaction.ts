import { BillingTransactionBase } from './billing-transaction-base';
import { InvoiceTransactionDocument } from './invoice-transaction-document';

export interface InvoiceBillingTransaction extends BillingTransactionBase {
    Id: number;
    InvoiceId?: number;
    InvoiceTransactionDocuments: Array<InvoiceTransactionDocument>;
    LastModifiedDatetime: Date;
}
