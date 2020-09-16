import { PhxConstants } from '../../common';

export interface InvoiceTransactionDocument {
    Id: number;
    InvoiceTransactionId: number;
    InvoiceTransactionDocumentStatusId: PhxConstants.InvoiceTransactionDocumentStatus;
    DocumentId: number;
    DocumentPublicId: string;
    DocumentName: string;
    DocumentTypeId: PhxConstants.DocumentType;
    LastModifiedDatetime: Date;
}
