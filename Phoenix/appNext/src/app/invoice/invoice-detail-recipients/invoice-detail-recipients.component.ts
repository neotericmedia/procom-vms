import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { Invoice, InvoiceRecipient } from '../shared/index';
import { InvoiceService } from '../shared/invoice.service';
import { PhxConstants } from '../../common/index';
import { uuid } from '../../.../../common/PhoenixCommon.module';
import { InvoiceExtension } from '../shared/invoice-extension';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice-detail-recipients',
  templateUrl: './invoice-detail-recipients.component.html',
  styleUrls: ['./invoice-detail-recipients.component.less']
})
export class InvoiceDetailRecipientsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() invoice: Invoice;
  @Input() editable: boolean;

  isAlive: boolean = true;
  invoiceModuleResourceKeys: any;

  invoiceToList: Array<{ Id: number, Name: string }> = [];
  invoiceClientCCList: Array<{ Id: number, Name: string }> = [];
  invoiceInternalCCList: Array<{ Id: number, Name: string }> = [];
  deliverToList: Array<{ Id: number, Name: string }> = [];
  currentlySelectedInternalCC: Array<number> = [];
  selectedClientCCList: Array<number> = [];


  constructor(
    private invoiceService: InvoiceService
  ) {
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {
    this.invoiceService.getInternalProfiles().then(data => {
      this.invoiceInternalCCList = data;
      this.deliverToList = data;
    });

    this.invoiceClientCCList = InvoiceExtension.getAllClientCourtesyCopyProfiles(this.invoice);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.invoice) {
      if (changes.invoice.currentValue) {
        this.invoiceClientCCList = InvoiceExtension.getAllClientCourtesyCopyProfiles(this.invoice);
        this.invoiceToList = InvoiceExtension.getAllInvoiceToProfiles(this.invoice);
        this.currentlySelectedInternalCC = InvoiceExtension.getCurrentlySelectedInternalCC(this.invoice);
        this.selectedClientCCList = this.getSelectedClientCourtesyCopies(this.invoice);
      } else {
        this.invoiceToList = [];
        this.currentlySelectedInternalCC = [];
        this.selectedClientCCList = [];
      }
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  onRecipientChanged(recipient: InvoiceRecipient) {
    this.invoiceService.updateRecipientState(recipient);
  }

  onRecipientDeleted(recipient: InvoiceRecipient) {
    this.invoiceService.removeRecipientFromState(recipient);
  }

  addClientCC() {
    this.addRecipient(PhxConstants.InvoiceRecipientType.ClientCC, PhxConstants.DeliveryMethod.SoftCopy);
  }

  addInternalCC() {
    this.addRecipient(PhxConstants.InvoiceRecipientType.InternalCC, PhxConstants.DeliveryMethod.SoftCopy);
  }

  addRecipient(type: PhxConstants.InvoiceRecipientType, deliveryMethod: PhxConstants.DeliveryMethod) {
    const recipient: InvoiceRecipient = {
      TemporaryGuid: uuid.create(),
      Id: 0,
      DeliveryMethodId: deliveryMethod,
      InvoiceId: this.invoice.Id,
      InvoiceRecipientTypeId: type,
      InvoiceRecipientUserProfileId: null,
      InvoiceRecipientUserProfileName: null,
      DeliverToUserProfileId: null,
      DeliverToUserProfileName: null
    };

    this.invoiceService.updateRecipientState(recipient);

  }

  private getSelectedClientCourtesyCopies(invoice: Invoice): Array<number> {
    return invoice.ClientCourtesyCopies
        .filter(i => i.InvoiceRecipientUserProfileId != null)
        .map(i => i.InvoiceRecipientUserProfileId);
  }
}
