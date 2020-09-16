import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnDestroy, OnChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { InvoiceRecipient } from '../shared/index';
import { CommonService } from '../../common/index';
import { PhxFormControlLayoutType, PhxConstants } from '../../common/model/index';
import { InvoiceService } from '../shared/invoice.service';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';


class InternalUserProfile {
  ContactId: number;
  ProfileId: number;
  FullName: string;
}

@Component({
  selector: 'app-invoice-recipient-editor',
  templateUrl: './invoice-recipient-editor.component.html',
  styleUrls: ['./invoice-recipient-editor.component.less']
})
export class InvoiceRecipientEditorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() labelText: string;
  @Input() editable: boolean = true;
  @Input() required: boolean = false;

  @Input() recipient: InvoiceRecipient; // model to be use for save(), submit()
  @Input() recipientItems: Array<{ Id: number, Name: string }> = []; // invoice To, CC or Internal CC
  @Input() deliverToItems: Array<{ Id: number, Name: string }> = [];

  @Input() showDeleteButton: boolean = true;
  @Input() showDeliveryMethod: boolean = true;

  @Output() valueChanged: EventEmitter<InvoiceRecipient> = new EventEmitter<InvoiceRecipient>();
  @Output() deleted: EventEmitter<InvoiceRecipient> = new EventEmitter<InvoiceRecipient>();

  isAlive: boolean = true;
  form: FormGroup;
  codeValueGroups: any;
  internalUserProfileList: InternalUserProfile[] = [];
  PhxFormControlLayoutType: typeof PhxFormControlLayoutType = PhxFormControlLayoutType;

  // constants
  DeliveryMethod = PhxConstants.DeliveryMethod;
  RecipientType = PhxConstants.InvoiceRecipientType;
  ResKeys = InvoiceModuleResourceKeys;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private invoiceSvc: InvoiceService
  ) {
    this.codeValueGroups = commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.form = this.fb.group({
      RecipientUserProfileId: [this.recipient.InvoiceRecipientUserProfileId, [Validators.required]],
      DeliveryMethodId: [this.recipient.DeliveryMethodId, [Validators.required]],
      DeliverToUserProfileId: [this.recipient.DeliverToUserProfileId, [Validators.required]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  delete() {
    this.deleted.emit(this.recipient);
  }

  onSelectDeliverMethod(deliveryMethodId) {
    if (deliveryMethodId !== this.DeliveryMethod.InternalProfile) {
      this.recipient.DeliverToUserProfileId = null;
      this.recipient.DeliverToUserProfileName = '';
    }
    this.recipient.DeliveryMethodId = deliveryMethodId;
    this.valueChanged.emit(this.recipient);
  }

  // update InvoiceTo, CC or Internal CC
  onRecipientChange(event) {
    this.recipient.InvoiceRecipientUserProfileId = event.value;
    this.valueChanged.emit(this.recipient);
  }

  onDeliverToChange(event) {
    this.recipient.DeliverToUserProfileId = event.value;
    this.valueChanged.emit(this.recipient);
  }
}
