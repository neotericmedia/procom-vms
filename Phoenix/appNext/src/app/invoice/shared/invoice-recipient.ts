import { PhxConstants } from '../../common/PhoenixCommon.module';

export interface InvoiceRecipient {
    TemporaryGuid: string; // this will be used to make new items distiguishable
    Id: number;
    InvoiceId: number;
    InvoiceRecipientTypeId: PhxConstants.InvoiceRecipientType;
    InvoiceRecipientUserProfileId?: number;
    InvoiceRecipientUserProfileName: string;
    DeliveryMethodId?: PhxConstants.DeliveryMethod;
    DeliverToUserProfileId: number;
    DeliverToUserProfileName: string;
}
