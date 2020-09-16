import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IPaymentInfo, IFormGroupSetup, IPaymentInvoice, IWorkOrder } from '../state/workorder.interface';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CodeValue, CustomFieldErrorType } from '../../common/model';
import { PhxConstants, ValidationExtensions } from '../../common';
import { WorkorderService } from '../workorder.service';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

interface IHtml {
  codeValueLists: {
    listPaymentInvoiceTerms: Array<CodeValue>;
    listPaymentReleaseSchedules: Array<CodeValue>;
    listPaymentInvoiceTemplates: Array<CodeValue>;
    listPaymentMethods: Array<CodeValue>;
  };
  phxConstants: any;
}

@Component({
  selector: 'app-workorder-payment-invoice',
  templateUrl: './workorder-payment-invoice.component.html',
  styleUrls: ['./workorder-payment-invoice.component.less']
})
export class WorkorderPaymentInvoiceComponent extends WorkOrderBaseComponentPresentational<IPaymentInvoice> implements OnInit {
  @Input() paymentInfo: FormGroup<IPaymentInfo>;
  @Input() invoiceType: number;
  @ViewChild('paymentReleaseSchedule') paymentReleaseSchedule: PhxModalComponent;
  paymentReleaseScheduleId: number;
  isExpenseThirdPartyImport: boolean = false;
  userProfileWorkerId: number;
  workerProfileTypeId: number;
  workerContactId: number;
  html: IHtml = {
    codeValueLists: {
      listPaymentInvoiceTerms: [],
      listPaymentReleaseSchedules: [],
      listPaymentInvoiceTemplates: [],
      listPaymentMethods: []
    },
    phxConstants: {}
  };

  constructor(private workOrderObservableService: WorkorderObservableService, private workorderService: WorkorderService) {
    super('WorkorderPaymentInvoiceComponent');
    this.getCodeValuelistsStatic();
  }

  businessRules() {}

  ngOnInit() {
    this.paymentReleaseSchedule.addClassToConfig('modal-lg');
    this.workOrderObservableService
      .workorderOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          this.userProfileWorkerId = workorder.UserProfileIdWorker;
          this.workerProfileTypeId = workorder.workerProfileTypeId;
          this.workerContactId = workorder.workerContactId;
          if (this.invoiceType === PhxConstants.InvoiceType.Expense) {
            this.isExpenseThirdPartyImport = workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.ThirdPartyImport;
          }
        }
      });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getCodeValuelistsStatic() {
    this.html.phxConstants = PhxConstants;
    this.html.codeValueLists.listPaymentInvoiceTerms = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentInvoiceTerms, true);
    this.html.codeValueLists.listPaymentReleaseSchedules = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentReleaseSchedule, true);
    this.html.codeValueLists.listPaymentInvoiceTemplates = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentInvoiceTemplate, true);
    this.html.codeValueLists.listPaymentMethods = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentMethodType, true);
  }

  onClickViewPaymentReleaseSchedule(id: number) {
    this.paymentReleaseScheduleId = id;
    this.paymentReleaseSchedule.show();
  }

  public static formBuilderPaymentInvoices(formGroupSetup: IFormGroupSetup, invoices: IPaymentInvoice[], validations: any, invoiceType: number) {
    if (invoices) {
      const form = formGroupSetup.formBuilder.array<IPaymentInvoice>(
        invoices.map((invoice: IPaymentInvoice) =>
          formGroupSetup.formBuilder.group<IPaymentInvoice>({
            Id: [invoice.Id],
            InvoiceTypeId: [invoice.InvoiceTypeId],
            IsDraft: [invoice.IsDraft],
            IsSalesTaxAppliedOnVmsImport: [
              invoice.IsSalesTaxAppliedOnVmsImport,
              !validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense && invoice.InvoiceTypeId === invoiceType && validations.isSalesTaxAppliedOnVmsImport
                ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsSalesTaxAppliedOnVmsImport', CustomFieldErrorType.required))]
                : null
            ],
            PaymentInfoId: [invoice.PaymentInfoId],
            PaymentInvoiceTermsId: [
              invoice.PaymentInvoiceTermsId,
              !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentInvoices', 'PaymentInvoiceTermsId', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentInvoiceTermsId', CustomFieldErrorType.required))
                  ])
                : null
            ],
            PaymentReleaseScheduleId: [
              invoice.PaymentReleaseScheduleId,
              invoice.PaymentInvoiceTermsId === PhxConstants.PaymentInvoiceTerms.ScheduledTerms && !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentInvoices', 'PaymentReleaseScheduleId', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentReleaseScheduleId', CustomFieldErrorType.required))
                  ])
                : null
            ],
            PaymentFrequency: [
              invoice.PaymentFrequency,
              invoice.PaymentInvoiceTermsId === PhxConstants.PaymentInvoiceTerms.Term && !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentInvoices', 'PaymentFrequency', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentFrequency', CustomFieldErrorType.required))
                  ])
                : null
            ],
            PaymentInvoiceTemplateId: [
              invoice.PaymentInvoiceTemplateId,
              !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentInvoices', 'PaymentInvoiceTemplateId', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentInvoiceTemplateId', CustomFieldErrorType.required))
                  ])
                : null
            ],
            PaymentMethodId: [
              invoice.PaymentMethodId,
              !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentInvoices', 'PaymentMethodId', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentMethodId', CustomFieldErrorType.required))
                  ])
                : null
            ],
            SourceId: [invoice.SourceId]
          })
        )
      );
      return form;
    }
  }
}
