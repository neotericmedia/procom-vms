import { Component, OnInit, Input } from '@angular/core';
import { IFormGroupSetup, IFormGroupOnNew, IWorkOrder, IBillingInvoice, IBillingRecipient } from '../state';
import { CodeValue, CustomFieldErrorType } from '../../common/model';
import { PhxConstants, ValidationExtensions } from '../../common';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderService } from '../workorder.service';
import { IFormGroupValue } from '../../common/utility/form-group';
import { map } from 'lodash';
import { IReadOnlyStorage } from '../../organization/state';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { forEach, last } from '@angular/router/src/utils/collection';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

interface IHtml {
  codeValueLists: {
    listPresentationStyles: Array<CodeValue>;
    listConsolidationTypes: Array<CodeValue>;
    listTransactionGenerationMethod: Array<CodeValue>;
    listBillingFrequencies: Array<CodeValue>;
    listBillingInvoiceTerms: Array<CodeValue>;
    listBillingInvoiceTemplates: Array<CodeValue>;
    listDeliveryMethods: Array<CodeValue>;
    listRecipientTypes: Array<CodeValue>;
  };
  commonLists: {
    listProfilesForApproval: Array<any>;
    listOrgClientAB: Array<any>;
  };
  phxConstants: any;
}

@Component({
  selector: 'app-workorder-billing-invoice',
  templateUrl: './workorder-billing-invoice.component.html',
  styleUrls: ['./workorder-billing-invoice.component.less']
})
export class WorkorderBillingInvoiceComponent extends WorkOrderBaseComponentPresentational<IBillingInvoice> implements OnInit {
  @Input() invoiceType: number;
  IsTimesheetExpenseBillingVisible: boolean = false;
  isExpenseThirdPartyImport: boolean = false;
  @Input() organizationClientId: number;
  codeValueGroups: any;
  showBillingInfoNote2: boolean = false;
  showBillingInfoNote3: boolean = false;
  showBillingInfoNote4: boolean = false;
  html: IHtml = {
    codeValueLists: {
      listPresentationStyles: [],
      listConsolidationTypes: [],
      listTransactionGenerationMethod: [],
      listBillingFrequencies: [],
      listBillingInvoiceTerms: [],
      listBillingInvoiceTemplates: [],
      listDeliveryMethods: [],
      listRecipientTypes: []
    },
    commonLists: {
      listProfilesForApproval: [],
      listOrgClientAB: []
    },
    phxConstants: {}
  };

  constructor(private workOrderService: WorkorderService, private workOrderObservableService: WorkorderObservableService) {
    super('WorkorderBillingInvoiceComponent');
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
  }

  businessRules(obj: IFormGroupValue): void {}

  ngOnInit() {
    if (this.organizationClientId) {
      this.workOrderService.getProfilesListOrganizationalByUserProfileType(this.organizationClientId, PhxConstants.ProfileType.Organizational).subscribe((response: any) => {
        this.html.commonLists.listProfilesForApproval = response.Items;
      });

      this.workOrderService.getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(this.organizationClientId, null).subscribe((response: any) => {
        const currentOrgClientRoles = response && response.Items;
        if (currentOrgClientRoles && currentOrgClientRoles.length > 0) {
          this.html.commonLists.listOrgClientAB = map(currentOrgClientRoles[0].OrganizationClientRoleAlternateBills, function(a) {
            return { id: a.Id, text: a.AlternateBillLegalName, name: a.AlternateBillCode };
          });
        }
      });
    }

    this.workOrderObservableService
      .workorderOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          if (this.invoiceType === PhxConstants.InvoiceType.TimeSheet) {
            this.IsTimesheetExpenseBillingVisible =
              (workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval || workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval) &&
              workorder.WorkOrderVersion.IsTimeSheetUsesProjects;
          }

          if (this.invoiceType === PhxConstants.InvoiceType.Expense) {
            this.IsTimesheetExpenseBillingVisible =
              (workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval) &&
              workorder.WorkOrderVersion.IsExpenseUsesProjects;
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
    this.html.codeValueLists.listPresentationStyles = this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoicePresentationStyle, true);
    this.html.codeValueLists.listConsolidationTypes = this.codeValueService.getCodeValues(this.codeValueGroups.BillingConsolidationType, true);
    this.html.codeValueLists.listTransactionGenerationMethod = this.codeValueService.getCodeValues(this.codeValueGroups.BillingTransactionGenerationMethod, true);
    this.html.codeValueLists.listBillingFrequencies = this.codeValueService.getCodeValues(this.codeValueGroups.BillingFrequency, true);
    this.html.codeValueLists.listBillingInvoiceTerms = this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoiceTerms, true);
    this.html.codeValueLists.listBillingInvoiceTemplates = this.codeValueService.getCodeValues(this.codeValueGroups.BillingInvoiceTemplate, true);
    this.html.codeValueLists.listDeliveryMethods = this.codeValueService.getCodeValues(this.codeValueGroups.DeliveryMethod, true);
    this.html.codeValueLists.listRecipientTypes = this.codeValueService.getCodeValues(this.codeValueGroups.RecipientType, true);
  }

  addTimesheetBillingInvoiceNote() {
    const data = [2, 3, 4];
    for (let i = 0; i < data.length; i++) {
      const propertyName = 'ShowBillingInfoNote' + data[i];
      if (!this.inputFormGroup.controls[propertyName].value) {
        this.inputFormGroup.controls[propertyName].patchValue(true);
        break;
      }
    }
  }

  removeTimesheetBillingInvoiceNote(index: number) {
    this.inputFormGroup.controls['InvoiceNote' + index].patchValue(null);
    const data = [2, 3, 4];
    let lastValue: string;
    let lastIndex: number;
    for (let i = 0; i < data.length; i++) {
      const propertyName = 'ShowBillingInfoNote' + data[i];
      if (this.inputFormGroup.controls[propertyName].value) {
        lastValue = propertyName;
        lastIndex = i;
      }
    }
    this.inputFormGroup.controls[lastValue].patchValue(false);
    this.inputFormGroup.controls['InvoiceNote' + data[lastIndex]].patchValue(null);
  }

  addBillingRecipient(id: number) {
    const formArrayBillingRecipients: FormArray<IBillingRecipient> = <FormArray<IBillingRecipient>>this.inputFormGroup.controls.BillingRecipients;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayBillingRecipients.push(WorkorderBillingInvoiceComponent.formBuilderGroupAddNewRecipient(formGroupOnNew, id));
  }

  public static formBuilderGroupAddNewRecipient(formGroupOnNew: IFormGroupOnNew, id: number): FormGroup<any> {
    return formGroupOnNew.formBuilder.group<any>({
      Id: 0,
      IsDraft: null,
      SourceId: null,
      UserProfileId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))]],
      BillingInvoiceId: [id],
      DeliveryMethodId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('DeliveryMethodId', CustomFieldErrorType.required))]],
      RecipientTypeId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('RecipientTypeId', CustomFieldErrorType.required))]],
      DeliverToUserProfileId: null
    });
  }

  public static formBuilderOrgClientAB(formGroupSetup: IFormGroupSetup, clients: any[]) {
    const form = formGroupSetup.formBuilder.array<any>(
      clients.map((client: any, index) =>
        formGroupSetup.hashModel.getFormGroup<any>(formGroupSetup.toUseHashCode, 'IOrgClientAB', client, index, () =>
          formGroupSetup.formBuilder.group<any>({
            id: [client.id],
            text: [client.text]
          })
        )
      )
    );
    return form;
  }

  public static formBuilderBillingRecipient(formGroupSetup: IFormGroupSetup, invoice: any, validations: any, invoiceType: number) {
    const form = formGroupSetup.formBuilder.array<any>(
      invoice.BillingRecipients.map((recipient: any) =>
        formGroupSetup.formBuilder.group<any>({
          BillingInvoiceId: [recipient.BillingInvoiceId],
          DeliveryMethodId: [
            recipient.DeliveryMethodId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice.BillingRecipients', 'DeliveryMethodId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DeliveryMethodId', CustomFieldErrorType.required))
                ])
              : null
          ],
          Id: [recipient.Id],
          IsDraft: [recipient.IsDraft],
          RecipientTypeId: [
            recipient.RecipientTypeId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice.BillingRecipients', 'RecipientTypeId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RecipientTypeId', CustomFieldErrorType.required))
                ])
              : null
          ],
          SourceId: [recipient.SourceId],
          UserProfileId: [
            recipient.UserProfileId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice.BillingRecipients', 'UserProfileId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))
                ])
              : null
          ],
          DeliverToUserProfileId: [
            recipient.DeliverToUserProfileId,
            recipient.DeliveryMethodId && recipient.DeliveryMethodId === PhxConstants.DeliveryMethod.InternalProfile
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice.BillingRecipients', 'DeliverToUserProfileId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DeliverToUserProfileId', CustomFieldErrorType.required))
                ])
              : null
          ]
        })
      )
    );
    return form;
  }

  public static formBuilderBillingInvoices(formGroupSetup: IFormGroupSetup, invoices: Array<IBillingInvoice>, validations: any, invoiceType: number): FormArray<any> {
    const form = formGroupSetup.formBuilder.array<IBillingInvoice>(
      invoices.map((invoice: IBillingInvoice) =>
        formGroupSetup.formBuilder.group<IBillingInvoice>({
          Id: [invoice.Id],
          InvoiceTypeId: [invoice.InvoiceTypeId],
          IsDraft: [invoice.IsDraft],
          BillingInfoId: [invoice.BillingInfoId],
          BillingInvoicePresentationStyleId: [
            invoice.BillingInvoicePresentationStyleId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'BillingInvoicePresentationStyleId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BillingInvoicePresentationStyleId', CustomFieldErrorType.required))
                ])
              : null
          ],
          BillingConsolidationTypeId: [
            invoice.BillingConsolidationTypeId,
            invoice.BillingInvoicePresentationStyleId === PhxConstants.BillingInvoicePresentationStyle.Consolidated &&
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) &&
            invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'BillingConsolidationTypeId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BillingConsolidationTypeId', CustomFieldErrorType.required))
                ])
              : null
          ],
          BillingTransactionGenerationMethodId: [
            invoice.BillingTransactionGenerationMethodId,
            validations.isBillingValid && !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'BillingTransactionGenerationMethodId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BillingTransactionGenerationMethodId', CustomFieldErrorType.required))
                ])
              : null
          ],
          IsUsesAlternateBilling: [
            invoice.IsUsesAlternateBilling,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'IsUsesAlternateBilling', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsUsesAlternateBilling', CustomFieldErrorType.required))
                ])
              : null
          ],
          OrganizatonClientRoleAlternateBillingId: [
            invoice.OrganizatonClientRoleAlternateBillingId,
            invoice.IsUsesAlternateBilling && !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'OrganizatonClientRoleAlternateBillingId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizatonClientRoleAlternateBillingId', CustomFieldErrorType.required))
                ])
              : null
          ],
          BillingFrequencyId: [
            invoice.BillingFrequencyId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'BillingFrequencyId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BillingFrequencyId', CustomFieldErrorType.required))
                ])
              : null
          ],
          BillingInvoiceTermsId: [
            invoice.BillingInvoiceTermsId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'BillingInvoiceTermsId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BillingInvoiceTermsId', CustomFieldErrorType.required))
                ])
              : null
          ],
          IsSalesTaxAppliedOnVmsImport: [
            invoice.IsSalesTaxAppliedOnVmsImport,
            invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense && !validations.isNoExpenseValid && invoice.InvoiceTypeId === invoiceType && validations.isSalesTaxAppliedOnVmsImport
              ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsSalesTaxAppliedOnVmsImport', CustomFieldErrorType.required))]
              : null
          ],
          BillingInvoiceTemplateId: [
            invoice.BillingInvoiceTemplateId,
            !(validations.isNoExpenseValid && invoice.InvoiceTypeId === PhxConstants.InvoiceType.Expense) && invoice.InvoiceTypeId === invoiceType
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingInvoice', 'BillingInvoiceTemplateId', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BillingInvoiceTemplateId', CustomFieldErrorType.required))
                ])
              : null
          ],
          SourceId: [invoice.SourceId],
          InvoiceNote1: [invoice.InvoiceNote1],
          InvoiceNote2: [invoice.InvoiceNote2],
          InvoiceNote3: [invoice.InvoiceNote3],
          InvoiceNote4: [invoice.InvoiceNote4],
          ShowBillingInfoNote2: [invoice.ShowBillingInfoNote2 ? invoice.ShowBillingInfoNote2 : !!invoice.InvoiceNote2],
          ShowBillingInfoNote3: [invoice.ShowBillingInfoNote3 ? invoice.ShowBillingInfoNote3 : !!invoice.InvoiceNote3],
          ShowBillingInfoNote4: [invoice.ShowBillingInfoNote4 ? invoice.ShowBillingInfoNote4 : !!invoice.InvoiceNote4],
          BillingRecipients: WorkorderBillingInvoiceComponent.formBuilderBillingRecipient(formGroupSetup, invoice, validations, invoiceType)
        })
      )
    );
    return form;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabBillingInfoes: FormGroup<any>, invoiceType: number): IWorkOrder {
    const fn = billing => {
      if (billing.InvoiceTypeId === PhxConstants.InvoiceType.TimeSheet) {
        billing.BillingTransactionGenerationMethodId =
          (workOrder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval || workOrder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval) &&
          workOrder.WorkOrderVersion.IsTimeSheetUsesProjects
            ? billing.BillingTransactionGenerationMethodId
            : null;
      } else {
        billing.BillingTransactionGenerationMethodId =
          (workOrder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || workOrder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval) &&
          workOrder.WorkOrderVersion.IsExpenseUsesProjects
            ? billing.BillingTransactionGenerationMethodId
            : null;
      }
      return billing;
    };
    const formGroupBillingInfoes: FormGroup<any> = formGroupTabBillingInfoes;
    const billingInfoes: any = formGroupBillingInfoes.value;

    billingInfoes.BillingInfoes.forEach(i => {
      const index = workOrder.WorkOrderVersion.BillingInfoes.findIndex(x => x.Id === i.Id);
      workOrder.WorkOrderVersion.BillingInfoes[index] = {
        ...workOrder.WorkOrderVersion.BillingInfoes[index],
        BillingInvoices: [...workOrder.WorkOrderVersion.BillingInfoes[index].BillingInvoices.map(a => fn(a)).filter(x => x.InvoiceTypeId !== invoiceType), ...i.BillingInvoices.map(a => fn(a)).filter(x => x.InvoiceTypeId === invoiceType)]
      };
    });

    return workOrder;
  }
}
