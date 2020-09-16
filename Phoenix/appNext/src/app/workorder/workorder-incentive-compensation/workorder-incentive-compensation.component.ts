import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ValidationExtensions } from '../../common';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { IIncentiveCompensation, IFormGroupSetup, IWorkOrder, IPaymentInfo, IReadOnlyStorage } from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { CustomFieldErrorType } from '../../common/model';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-incentive-compensation',
  templateUrl: './workorder-incentive-compensation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkorderIncentiveCompensationComponent extends WorkOrderBaseComponentPresentational<IIncentiveCompensation> implements OnInit {
  @Input() inputFormGroup: FormGroup<IIncentiveCompensation>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  paymentInfo: Array<IPaymentInfo>;
  workerProfileTypeId: number;
  OrganizationIdSupplier: number;

  constructor(private workorderObservableService: WorkorderObservableService) {
    super('WorkorderIncentiveCompensationComponent');
  }

  getCodeValuelistsStatic() {}

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this, true)
      .takeUntil(this.isDestroyed$)
      .subscribe(workorder => {
        if (workorder) {
          this.paymentInfo = workorder.WorkOrderVersion.PaymentInfoes;
          this.workerProfileTypeId = workorder.workerProfileTypeId;
          this.OrganizationIdSupplier = this.paymentInfo[0].OrganizationIdSupplier;
        }
      });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<IIncentiveCompensation> = null;
    switch (obj.name) {
      case 'IsEligibleForCommission':
        {
          value = {
            IsThirdPartyImport: null,
            CommissionThirdPartyWorkerReference: null
          };
        }
        break;
      case 'IsThirdPartyImport':
        {
          value = {
            CommissionThirdPartyWorkerReference: null
          };
        }
        break;
      default:
        {
          value = {
            [obj.name]: obj.val
          };
        }
        break;
    }
    this.patchValue(this.inputFormGroup, value);
  }

  recalcLocalProperties(fromgroup: FormGroup<IIncentiveCompensation>) {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, incentiveCompensation: IIncentiveCompensation, workorderObservableService: WorkorderObservableService): FormGroup<IIncentiveCompensation> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IIncentiveCompensation>(formGroupSetup.toUseHashCode, 'IIncentiveCompensation', incentiveCompensation, 0, () =>
      formGroupSetup.formBuilder.group<IIncentiveCompensation>({
        IsEligibleForCommission: [incentiveCompensation.IsEligibleForCommission],
        IsThirdPartyImport: [
          incentiveCompensation.IsThirdPartyImport,
          incentiveCompensation.IsEligibleForCommission
            ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator(
                'WorkOrderVersion',
                'IsThirdPartyImport',
                null,
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsThirdPartyImport', CustomFieldErrorType.required))
              )
            : null
        ],
        CommissionThirdPartyWorkerReference: [
          incentiveCompensation.CommissionThirdPartyWorkerReference,
          incentiveCompensation.IsThirdPartyImport
            ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator(
                'WorkOrderVersion',
                'CommissionThirdPartyWorkerReference',
                null,
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CommissionThirdPartyWorkerReference', CustomFieldErrorType.required))
              )
            : null
        ],
        IsCommissionVacation: [incentiveCompensation.IsCommissionVacation]
      })
    );
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupIncentiveDetails: FormGroup<IIncentiveCompensation>): IWorkOrder {
    const incentiveDetails: IIncentiveCompensation = formGroupIncentiveDetails.value;
    workOrder.WorkOrderVersion.IsEligibleForCommission = incentiveDetails.IsEligibleForCommission;
    workOrder.WorkOrderVersion.IsThirdPartyImport = incentiveDetails.IsThirdPartyImport;
    workOrder.WorkOrderVersion.CommissionThirdPartyWorkerReference = incentiveDetails.CommissionThirdPartyWorkerReference;
    workOrder.WorkOrderVersion.PaymentInfoes.forEach(paymentInfo => {
      paymentInfo.IsCommissionVacation = incentiveDetails.IsCommissionVacation;
    });
    return workOrder;
  }
}
