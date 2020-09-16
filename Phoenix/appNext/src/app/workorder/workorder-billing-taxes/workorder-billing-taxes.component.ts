import { IReadOnlyStorage } from './../../subscription/state/subscription.interface';
import { Component, OnInit, Input } from '@angular/core';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IBillingInfo, IFormGroupSetup, IBillingSalesTax, IWorkOrder } from '../state';
import { ValidationExtensions, PhxConstants } from '../../common';
import { FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType, PhxFormControlLayoutType } from '../../common/model';
import { WorkorderService } from '../workorder.service';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-billing-taxes',
  templateUrl: './workorder-billing-taxes.component.html',
  styleUrls: ['./workorder-billing-taxes.component.less']
})
export class WorkorderBillingTaxesComponent extends WorkOrderBaseComponentPresentational<IBillingInfo> implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() editable: boolean;
  @Input() organizationIdInternal: number;
  salesTaxes: Array<any>;
  salesTaxTerritories: Array<any>;
  isAppliedList: Array<any>;
  layoutType: any;
  phxConstants: any;

  constructor(private workorderService: WorkorderService) {
    super('WorkorderBillingTaxesComponent');
    this.salesTaxes = this.codeValueService.getCodeValues(this.codeValueGroups.SalesTax, true);
    this.salesTaxTerritories = this.codeValueService.getRelatedCodeValues(this.codeValueGroups.Subdivision, PhxConstants.Country.CA, this.codeValueGroups.Country);
    this.isAppliedList = [{ id: true, text: 'Yes' }, { id: false, text: 'No' }];
    this.layoutType = PhxFormControlLayoutType;
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    if (this.inputFormGroup && this.inputFormGroup.controls) {
      const subdivisionIdSalesTax = this.inputFormGroup.controls.SubdivisionIdSalesTax ? this.inputFormGroup.controls.SubdivisionIdSalesTax.value : null;
      const billingSalesTaxes = <FormArray<IBillingSalesTax>>this.inputFormGroup.controls.BillingSalesTaxes;
      const needPercentage = billingSalesTaxes && billingSalesTaxes.value && billingSalesTaxes.value.length ? billingSalesTaxes.value.some(x => !x.ratePercentage && x.ratePercentage !== 0) : false;
      if (needPercentage && subdivisionIdSalesTax && this.organizationIdInternal) {
        this.workorderService.getBillingSalesTaxes(this.inputFormGroup.value, this.organizationIdInternal, false).then((response: Array<IBillingSalesTax>) => {
          billingSalesTaxes.controls.forEach(i => {
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

  public static formBuilderBillingInfoesSetup(formGroupSetup: IFormGroupSetup, billingInfoes: Array<IBillingInfo>, validateComplianceDraft: boolean): FormArray<IBillingInfo> {
    const formGroup = formGroupSetup.formBuilder.array<IBillingInfo>(
      billingInfoes.map((billingInfo: IBillingInfo, index) =>
        formGroupSetup.formBuilder.group<IBillingInfo>({
          Id: [billingInfo.Id],
          OrganizationClientDisplayName: [billingInfo.OrganizationClientDisplayName],
          OrganizationIdClient: [billingInfo.OrganizationIdClient],
          SubdivisionIdSalesTax: [
            billingInfo.SubdivisionIdSalesTax,
            validateComplianceDraft
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes', 'SubdivisionIdSalesTax', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SubdivisionIdSalesTax', CustomFieldErrorType.required))
                ])
              : null
          ],
          BillingSalesTaxes: WorkorderBillingTaxesComponent.formBuilderBillingSalesTaxes(formGroupSetup, billingInfo.BillingSalesTaxes, validateComplianceDraft)
        })
      )
    );
    return formGroup;
  }

  public static formBuilderBillingSalesTaxes(formGroupSetup: IFormGroupSetup, taxes: IBillingSalesTax[], validateComplianceDraft: boolean) {
    const form = formGroupSetup.formBuilder.array<IBillingSalesTax>(
      taxes.map((tax: IBillingSalesTax, index) =>
        formGroupSetup.formBuilder.group<IBillingSalesTax>({
          SalesTaxId: [tax.SalesTaxId],
          ratePercentage: [tax.ratePercentage],
          hasNumber: [tax.hasNumber],
          IsApplied: [
            tax.IsApplied,
            validateComplianceDraft
              ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingSalesTaxes', 'IsApplied', null, [
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsApplied', CustomFieldErrorType.required))
                ])
              : null
          ],
          Id: [tax.Id]
        })
      )
    );
    return form;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, billingInfo: IBillingInfo) {
    const index = workOrder.WorkOrderVersion.BillingInfoes.findIndex(x => x.Id === billingInfo.Id);
    workOrder.WorkOrderVersion.BillingInfoes[index] = {
      ...workOrder.WorkOrderVersion.BillingInfoes[index],
      SubdivisionIdSalesTax: billingInfo.SubdivisionIdSalesTax,
      BillingSalesTaxes: billingInfo.BillingSalesTaxes
    };
    return workOrder;
  }
}
