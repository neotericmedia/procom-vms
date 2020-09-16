import { IReadOnlyStorage } from './../../subscription/state/subscription.interface';
import { Component, OnInit, Input } from '@angular/core';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IPaymentInfo, IFormGroupSetup, IPaymentSalesTax, IWorkOrder } from '../state';
import { FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, PhxConstants } from '../../common';
import { CustomFieldErrorType, PhxFormControlLayoutType } from '../../common/model';
import { WorkorderService } from '../workorder.service';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-payment-taxes',
  templateUrl: './workorder-payment-taxes.component.html',
  styleUrls: ['./workorder-payment-taxes.component.less']
})
export class WorkorderPaymentTaxesComponent extends WorkOrderBaseComponentPresentational<IPaymentInfo> implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() editable: boolean;
  @Input() userProfileIdWorker: number;
  @Input() paymentInfoIndex: number;
  @Input() workerProfileTypeId: number;
  @Input() validateComplianceDraft: boolean;
  salesTaxes: Array<any>;
  salesTaxTerritories: Array<any>;
  isAppliedList: Array<any>;
  layoutType: any;
  phxConstants: any;

  constructor(private workorderService: WorkorderService) {
    super('WorkorderPaymentTaxesComponent');
    this.salesTaxes = this.codeValueService.getCodeValues(this.codeValueGroups.SalesTax, true);
    this.salesTaxTerritories = this.codeValueService.getRelatedCodeValues(this.codeValueGroups.Subdivision, PhxConstants.Country.CA, this.codeValueGroups.Country);
    this.isAppliedList = [{ id: true, text: 'Yes' }, { id: false, text: 'No' }];
    this.layoutType = PhxFormControlLayoutType;
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    if (this.inputFormGroup && this.inputFormGroup.controls) {
      const subdivisionIdSalesTax = this.inputFormGroup.controls.SubdivisionIdSalesTax ? this.inputFormGroup.controls.SubdivisionIdSalesTax.value : null;
      const organizationIdSupplier = this.inputFormGroup.controls.SubdivisionIdSalesTax ? this.inputFormGroup.controls.SubdivisionIdSalesTax.value : null;
      const paymentSalesTaxes = <FormArray<IPaymentSalesTax>>this.inputFormGroup.controls.PaymentSalesTaxes;
      const needPercentage = paymentSalesTaxes && paymentSalesTaxes.value && paymentSalesTaxes.value.length ? paymentSalesTaxes.value.some(x => !x.ratePercentage && x.ratePercentage !== 0) : false;
      if (needPercentage && subdivisionIdSalesTax) {
        this.workorderService.getPaymentSalesTaxes(this.inputFormGroup.value, this.userProfileIdWorker, this.workerProfileTypeId).then((response: Array<IPaymentSalesTax>) => {
          paymentSalesTaxes.controls.forEach(i => {
            if (i instanceof FormGroup) {
              const z = response.find(x => x.SalesTaxId === i.controls.SalesTaxId.value);
              if (z) {
                i.controls.hasNumber.setValue(z.hasNumber);
                i.controls.ratePercentage.setValue(z.ratePercentage);
              }
            }
          });
          this.outputEvent.emit();
        });
      }
    }
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules() {}

  public static formBuilderPaymentInfoesSetup(formGroupSetup: IFormGroupSetup, paymentInfoes: Array<IPaymentInfo>, validateComplianceDraft: boolean): FormArray<IPaymentInfo> {
    const formGroup = formGroupSetup.formBuilder.array<IPaymentInfo>(
      paymentInfoes.map((paymentInfo: IPaymentInfo, index) =>
        formGroupSetup.formBuilder.group<IPaymentInfo>({
          Id: [paymentInfo.Id],
          OrganizationSupplierDisplayName: [paymentInfo.OrganizationSupplierDisplayName],
          OrganizationIdSupplier: [paymentInfo.OrganizationIdSupplier],
          SubdivisionIdSalesTax: [
            paymentInfo.SubdivisionIdSalesTax,
            validateComplianceDraft && paymentInfo.ApplySalesTax
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes', 'SubdivisionIdSalesTax', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SubdivisionIdSalesTax', CustomFieldErrorType.required))
                ])
              : null
          ],
          ApplySalesTax: [paymentInfo.ApplySalesTax],
          PaymentSalesTaxes: WorkorderPaymentTaxesComponent.formBuilderPaymentSalesTaxes(formGroupSetup, paymentInfo.PaymentSalesTaxes, validateComplianceDraft)
        })
      )
    );
    return formGroup;
  }

  public static formBuilderPaymentSalesTaxes(formGroupSetup: IFormGroupSetup, taxes: IPaymentSalesTax[], validateComplianceDraft: boolean) {
    const form = formGroupSetup.formBuilder.array<IPaymentSalesTax>(
      taxes.map((tax: IPaymentSalesTax, index) =>
        formGroupSetup.formBuilder.group<IPaymentSalesTax>({
          SalesTaxId: [tax.SalesTaxId],
          ratePercentage: [tax.ratePercentage],
          hasNumber: [tax.hasNumber],
          IsApplied: [tax.IsApplied, validateComplianceDraft ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsApplied', CustomFieldErrorType.required))] : null],
          Id: [tax.Id]
        })
      )
    );
    return form;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, paymentInfo: IPaymentInfo) {
    const index = workOrder.WorkOrderVersion.PaymentInfoes.findIndex(x => x.Id === paymentInfo.Id);
    workOrder.WorkOrderVersion.PaymentInfoes[index] = {
      ...workOrder.WorkOrderVersion.PaymentInfoes[index],
      SubdivisionIdSalesTax: paymentInfo.SubdivisionIdSalesTax,
      ApplySalesTax: paymentInfo.ApplySalesTax,
      PaymentSalesTaxes: paymentInfo.PaymentSalesTaxes
    };
    return workOrder;
  }
}
