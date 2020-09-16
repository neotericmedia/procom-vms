import { Component, Input, OnInit } from '@angular/core';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IBillingRecipient } from '../state';
import { CodeValue } from '../../common/model';
import { PhxConstants } from '../../common';
import { WorkorderService } from '../workorder.service';
import { FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { IFormGroupValue } from '../../common/utility/form-group';

interface IHtml {
  codeValueLists: {
    listDeliveryMethods: Array<CodeValue>;
    listRecipientTypes: Array<CodeValue>;
    listBillingRecipientTypes: Array<CodeValue>;
  };
  commonLists: {
    listProfilesForApproval: Array<any>;
    listActiveUserProfile: Array<any>;
  };
  phxConstants: any;
}

@Component({
  selector: 'app-workorder-billing-recipient',
  templateUrl: './workorder-billing-recipient.component.html',
  styleUrls: ['./workorder-billing-recipient.component.less']
})
export class WorkorderBillingRecipientComponent extends WorkOrderBaseComponentPresentational<IBillingRecipient> implements OnInit {
  @Input() recipientIndex: number;
  @Input() invoiceTypeId: number;
  @Input() billingRecipients: Array<any>;
  @Input() organizationClientId: number;
  html: IHtml = {
    codeValueLists: {
      listDeliveryMethods: [],
      listRecipientTypes: [],
      listBillingRecipientTypes: []
    },
    commonLists: {
      listProfilesForApproval: [],
      listActiveUserProfile: []
    },
    phxConstants: typeof PhxConstants
  };
  deliveryMethods: any[] = [];

  constructor(private workOrderService: WorkorderService) {
    super('WorkorderBillingRecipientComponent');
    this.getCodeValuelistsStatic();
    this.getActiveUserProfiles();
  }

  ngOnInit() {
    if (this.organizationClientId) {
      this.workOrderService.getProfilesListOrganizationalByUserProfileType(this.organizationClientId, PhxConstants.ProfileType.Organizational).subscribe((response: any) => {
        this.html.commonLists.listProfilesForApproval = response.Items;
        this.html.commonLists.listProfilesForApproval.forEach(element => {
          element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
        });
      });
    }
    this.deliveryMethods = this.getDeliverMethods(this.inputFormGroup.get('RecipientTypeId').value);
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getActiveUserProfiles() {
    this.commonListsObservableService
      .listUserProfileInternal$()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response) {
          this.html.commonLists.listActiveUserProfile = response;
        }
      });
  }

  getDeliverMethods(recipientTypeId: number) {
    if (recipientTypeId === PhxConstants.RecipientType.InvoiceRecipient) {
      return this.html.codeValueLists.listDeliveryMethods.filter(item => {
        return item.id !== PhxConstants.DeliveryMethod.InternalProfile;
      });
    } else {
      return this.html.codeValueLists.listDeliveryMethods.filter(item => {
        return item.id !== PhxConstants.DeliveryMethod.InternalProfile && item.id !== PhxConstants.DeliveryMethod.Suppressed;
      });
    }
  }

  businessRules(obj: IFormGroupValue) {
    if (obj.name === 'DeliveryMethodId') {
      var deliverToUserProfileControl = this.inputFormGroup.get('DeliverToUserProfileId');
      deliverToUserProfileControl.patchValue(null);
      deliverToUserProfileControl.updateValueAndValidity();
    }

  }

  getCodeValuelistsStatic() {
    this.html.phxConstants = PhxConstants;
    this.html.codeValueLists.listDeliveryMethods = this.codeValueService.getCodeValues(this.codeValueGroups.DeliveryMethod, true);
    this.html.codeValueLists.listRecipientTypes = this.codeValueService.getCodeValues(this.codeValueGroups.RecipientType, true);
    this.html.codeValueLists.listBillingRecipientTypes = this.html.codeValueLists.listRecipientTypes.filter(function (item) {
      return item.id !== 1;
    });
  }

  removeBillingRecipient(recipientIndex: number) {
    const formArrayBillingRecipients: FormArray<IBillingRecipient> = <FormArray<IBillingRecipient>>this.inputFormGroup.parent;
    formArrayBillingRecipients.removeAt(recipientIndex);
  }
}
