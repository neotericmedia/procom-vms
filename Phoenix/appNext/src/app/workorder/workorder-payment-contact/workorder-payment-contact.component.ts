import { Component, OnInit, Input } from '@angular/core';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IPaymentContact, IPaymentInfo, IFormGroupSetup, IPaymentContacts, IRoot } from '../state';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { WorkorderService } from '../workorder.service';
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType, PhxConstants } from '../../common/model';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

interface IHtml {
  commonLists: {
    listProfilesForApproval: Array<any>;
    listProfilesForPaymentOrganization: Array<any>;
  };
}

@Component({
  selector: 'app-workorder-payment-contact',
  templateUrl: './workorder-payment-contact.component.html',
  styleUrls: ['./workorder-payment-contact.component.less']
})
export class WorkorderPaymentContactComponent extends WorkOrderBaseComponentPresentational<IPaymentContact> implements OnInit {
  @Input() paymentInfo: FormGroup<IPaymentInfo>;
  @Input() contactIndex: number;
  html: IHtml = {
    commonLists: {
      listProfilesForApproval: [],
      listProfilesForPaymentOrganization: []
    }
  };

  constructor(private workOrderService: WorkorderService) {
    super('WorkorderPaymentContactComponent');
  }

  businessRules() {}

  ngOnInit() {
    const paymentInfo = <FormArray<IPaymentInfo>>this.paymentInfo.parent;
    paymentInfo.controls.forEach(c => {
      if (c instanceof FormGroup) {
        this.workOrderService.getProfilesListByOrganizationId(c.controls.OrganizationIdSupplier.value).subscribe((response: any) => {
          this.html.commonLists.listProfilesForPaymentOrganization = this.html.commonLists.listProfilesForPaymentOrganization.concat(response.Items);
          this.html.commonLists.listProfilesForPaymentOrganization.forEach(element => {
            element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
          });
          this.html.commonLists.listProfilesForPaymentOrganization = this.html.commonLists.listProfilesForPaymentOrganization.filter(
            i =>
              i.ProfileStatusId !== PhxConstants.ProfileStatus.InActive &&
              i.ProfileStatusId !== PhxConstants.ProfileStatus.PendingInactive &&
              i.ProfileStatusId !== PhxConstants.ProfileStatus.PendingActive &&
              i.ProfileTypeId !== PhxConstants.UserProfileType.WorkerSubVendor
          );
        });
      }
    });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getRootFormGroup(currentFormGroup: FormGroup<any>): FormGroup<any> | FormArray<any> {
    const getRoot = (formGroup: FormGroup<any> | FormArray<any>): FormGroup<any> | FormArray<any> => {
      if (formGroup.parent) {
        return getRoot(formGroup.parent);
      } else {
        return formGroup;
      }
    };
    return getRoot(currentFormGroup);
  }

  getContacts(id: number) {
    const rootFormGroup = this.getRootFormGroup(this.inputFormGroup);
    const contacts = (<FormGroup<IRoot>>rootFormGroup).controls.PaymentContacts as FormArray<IPaymentContacts>;
    return contacts.controls.find(i => i.value.PaymentInfoId === id).get('PaymentContacts');
  }

  removePaymentContact(contactIndex: number) {
    const rootFormGroup = this.getRootFormGroup(this.inputFormGroup) as FormGroup<any>;
    const paymentContacts = (<FormGroup<any>>rootFormGroup).controls.PaymentContacts as FormArray<IPaymentContacts>;
    const paymentContact = paymentContacts.controls.find(a => a.value.PaymentInfoId === this.paymentInfo.value.Id) as FormGroup<IPaymentContacts>;
    (<FormArray<IPaymentContact>>paymentContact.controls.PaymentContacts).removeAt(contactIndex);
    this.outputEvent.emit();
  }

  public static formBuilderPaymentContacts(formGroupSetup: IFormGroupSetup, paymentInfo: IPaymentInfo) {
    const paymentContacts = paymentInfo.PaymentContacts;
    const form = formGroupSetup.formBuilder.array<IPaymentContact>(
      paymentContacts.map((contact: IPaymentContact, index) =>
        formGroupSetup.hashModel.getFormGroup<IPaymentContact>(formGroupSetup.toUseHashCode, 'IPaymentContact', contact, index, () =>
          formGroupSetup.formBuilder.group<IPaymentContact>({
            Id: [contact.Id],
            IsDraft: [contact.IsDraft],
            PaymentInfoId: [contact.PaymentInfoId],
            SourceId: [contact.SourceId],
            UserProfileId: [
              contact.UserProfileId,
              paymentInfo.OrganizationIdSupplier
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentContacts', 'PaymentReleaseScheduleId', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentReleaseScheduleId', CustomFieldErrorType.required))
                  ])
                : null
            ]
          })
        )
      )
    );
    return form;
  }
}
