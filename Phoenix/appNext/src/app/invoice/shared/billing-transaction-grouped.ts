import { BillingInvoicePresentationStyleGrouped } from './billing-invoice-presentation-style-grouped';

export interface BillingTransactionGrouped {
  OrganizationInternalLegalName: string;
  OrganizationIdInternal: number;
  Count: number;
  BillingInvoicePresentationStyles: Array<BillingInvoicePresentationStyleGrouped>;
}
