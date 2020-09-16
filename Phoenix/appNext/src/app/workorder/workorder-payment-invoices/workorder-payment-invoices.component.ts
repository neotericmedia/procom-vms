import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IPaymentInfo, IFormGroupSetup, IPaymentInfoes, IFormGroupOnNew, IPaymentContact, IWorkOrder, IRoot, IPaymentContacts } from '../state/workorder.interface';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType, PhxConstants } from '../../common/model';
import { ValidationExtensions, CustomFieldService } from '../../common';
import { WorkorderService } from '../workorder.service';
import { IReadOnlyStorage } from '../../organization/state';
import { WorkorderPaymentInvoiceComponent } from '../workorder-payment-invoice/workorder-payment-invoice.component';
import { WorkorderPaymentContactComponent } from '../workorder-payment-contact/workorder-payment-contact.component';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

interface IHtml {
  commonLists: {
    listProfilesForPaymentOrganization: Array<any>;
  };
}

@Component({
  selector: 'app-workorder-payment-invoices',
  templateUrl: './workorder-payment-invoices.component.html',
  styleUrls: ['./workorder-payment-invoices.component.less']
})

export class WorkorderPaymentInvoicesComponent extends BaseComponentOnDestroy implements OnInit {

  @Input() inputFormGroup: FormGroup<IPaymentInfoes>;
  @Input() invoiceType: number;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  codeValueGroups: any;
  workOrder: IWorkOrder;

  html: IHtml = {
    commonLists: {
      listProfilesForPaymentOrganization: []
    }
  };

  constructor(
    private workOrderService: WorkorderService,
    private formBuilder: FormBuilder,
    private workorderObservableService: WorkorderObservableService,
    private customFieldService: CustomFieldService) {
      super();
    }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        this.workOrder = workorder;
    });
    
    const paymentInfo = <FormArray<IPaymentInfo>>this.inputFormGroup.controls.PaymentInfoes;
    paymentInfo.controls.forEach(c => {
      if (c instanceof FormGroup) {
        this.workOrderService.getProfilesListByOrganizationId(c.controls.OrganizationIdSupplier.value).subscribe((response: any) => {
          this.html.commonLists.listProfilesForPaymentOrganization = this.html.commonLists.listProfilesForPaymentOrganization.concat(response.Items);
          this.html.commonLists.listProfilesForPaymentOrganization = this.html.commonLists.listProfilesForPaymentOrganization
            .filter(i => (i.ProfileStatusId !== 2 && i.ProfileStatusId !== 9
              && i.ProfileStatusId !== 10 && i.ProfileTypeId !== PhxConstants.UserProfileType.WorkerSubVendor));
        });
      }
    });
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
    const contacts = ((<FormGroup<IRoot>>rootFormGroup).controls.PaymentContacts) as FormArray<IPaymentContacts>;
    return contacts.controls.find(i => i.value.PaymentInfoId === id).get('PaymentContacts');
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  workOrderAddRemoveSubEntities(paymentInfoId: number) {
    const rootFormGroup = this.getRootFormGroup(this.inputFormGroup);
    const contacts = ((<FormGroup<IRoot>>rootFormGroup).controls.PaymentContacts) as FormArray<IPaymentContacts>;
    const contact = contacts.controls.find(i => i.value.PaymentInfoId === paymentInfoId) as FormGroup<IPaymentContacts>;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    const contactFormArray = contact.controls.PaymentContacts as FormArray<IPaymentContact>;
    contactFormArray.push(WorkorderPaymentInvoicesComponent.formBuilderGroupAddNew(formGroupOnNew, paymentInfoId));
    contact.setControl('PaymentContacts', contactFormArray);
    this.outputEvent.emit();
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, paymentInfoId: number): FormGroup<IPaymentContact> {
    return formGroupOnNew.formBuilder.group<IPaymentContact>({
      Id: 0,
      IsDraft: null,
      SourceId: null,
      UserProfileId: [
        null,
        [
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))
        ]
      ],
      PaymentInfoId: paymentInfoId
    });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, paymentInfoes: Array<IPaymentInfo>, validations: any, invoiceType: number): FormArray<IPaymentInfo> {
    const formGroup = formGroupSetup.formBuilder.array<IPaymentInfo>(
      paymentInfoes.map((info: IPaymentInfo) =>
        formGroupSetup.formBuilder.group<IPaymentInfo>({
          Id: [info.Id],
          PaymentInvoices: WorkorderPaymentInvoiceComponent.formBuilderPaymentInvoices(formGroupSetup, info.PaymentInvoices, validations, invoiceType),
          OrganizationIdSupplier: [info.OrganizationIdSupplier],
          OrganizationSupplierDisplayName: [info.OrganizationSupplierDisplayName]
        })
      )
    );
    return formGroup;
  }

  public static formBuilderGroupSetupPaymentContacts(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder) {
    const formGroup = formGroupSetup.formBuilder.array<IPaymentContacts>(
      workorder.WorkOrderVersion.PaymentInfoes.map((paymentInfo: IPaymentInfo) => {
        return formGroupSetup.formBuilder.group<IPaymentContacts>({
          PaymentInfoId: [paymentInfo.Id],
          PaymentContacts: WorkorderPaymentContactComponent.formBuilderPaymentContacts(formGroupSetup, paymentInfo)
        });
      })
    );
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabPaymetInfoes: FormGroup<IPaymentInfoes>, invoiceType: number, rootFormGroup: FormGroup<IRoot>): IWorkOrder {
    const formGroupPaymentInfoes: FormGroup<IPaymentInfoes> = formGroupTabPaymetInfoes;
    const paymentInfoes: IPaymentInfoes = formGroupPaymentInfoes.value;
    const paymentContacts = rootFormGroup.controls.PaymentContacts.value;
    paymentInfoes.PaymentInfoes.forEach((i) => {
      const index = workOrder.WorkOrderVersion.PaymentInfoes.findIndex(x => x.Id === i.Id);
      const paymentContact: IPaymentContacts = paymentContacts.find(a => a.PaymentInfoId === i.Id);
      workOrder.WorkOrderVersion.PaymentInfoes[index] = {
        ...workOrder.WorkOrderVersion.PaymentInfoes[index],
        PaymentInvoices: [...workOrder.WorkOrderVersion.PaymentInfoes[index].PaymentInvoices.filter(x => x.InvoiceTypeId !== invoiceType),
        ...i.PaymentInvoices.filter(x => x.InvoiceTypeId === invoiceType)],
        PaymentContacts: paymentContact.PaymentContacts
      };
    });
    return workOrder;
  }
}
