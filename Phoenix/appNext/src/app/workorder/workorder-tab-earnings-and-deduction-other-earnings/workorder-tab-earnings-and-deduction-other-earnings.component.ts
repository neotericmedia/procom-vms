import { CustomFieldErrorType } from './../../common/model/custom-field-error-type';
import { ValidationExtensions } from './../../common/components/phx-form-control/validation.extensions';
// Angular
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { forEach, find } from 'lodash';
// Common
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
// Work order
import { IWorkOrder, IFormGroupSetup, IPaymentOtherEarning, ITabEarningsAndDeductions, IOtherEarning, IOtherEarnings, IPaymentInfo } from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderService } from './../workorder.service';
import { PhxFormControlLayoutType, PhxConstants } from '../../common/model';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-tab-earnings-and-deduction-other-earnings',
  templateUrl: './workorder-tab-earnings-and-deduction-other-earnings.component.html',
  styleUrls: ['./workorder-tab-earnings-and-deduction-other-earnings.component.less']
})
export class WorkorderTabEarningsAndDeductionOtherEarningsComponent extends WorkOrderBaseComponentPresentational<IPaymentOtherEarning> implements OnInit {
  isUserProfileWorkerLoaded: boolean = false;
  workOrder: IWorkOrder;
  html: {
    commonLists: {
      paymentOtherEarningTypeList: Array<any>;
    };
  } = {
    commonLists: {
      paymentOtherEarningTypeList: []
    }
  };
  layoutType: any;
  percentageFilter: any = { from: 0, to: 100, decimalplaces: 4 };
  phxDialogComponentConfigModel: any;

  @Input()
  listUserProfileWorker: Array<any>;
  @Output()
  outputEvent = new EventEmitter<any>();

  @ViewChild('phxDialogComponent')
  phxDialogComponent: any;

  constructor(private workorderObservableService: WorkorderObservableService, private workorderService: WorkorderService) {
    super('WorkorderTabEarningsAndDeductionOtherEarningsComponent');
  }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        this.workOrder = workorder;
      });
    this.layoutType = PhxFormControlLayoutType;
    this.html.commonLists.paymentOtherEarningTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentOtherEarningType, true);
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  setIsAccrued() {
    if (this.inputFormGroup.get('PaymentOtherEarningTypeId').value === this.phxConstants.PaymentOtherEarningType.VacationPay) {
      this.inputFormGroup.get('IsAccrued').patchValue(this.inputFormGroup.get('IsApplied').value ? true : null);
    }
  }

  paymentOtherEarningIsAppliedOnChange() {
    this.setIsAccrued();
    const rootFormGroup: any = this.getRootFormGroup(this.inputFormGroup);
    const earningsAndDeduction: any = rootFormGroup.controls.TabEarningsAndDeductions as FormGroup<ITabEarningsAndDeductions>;
    this.inputFormGroup.get('RatePercentage').patchValue(null);
    if (this.inputFormGroup.get('IsApplied').value) {
      if (this.workOrder.workerProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp) {
        if (this.inputFormGroup.parent.value.length !== 0) {
          const worker = this.getWorker();
          if (worker.OrganizationId === null && this.workOrder.workerProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp) {
            const findPaymentOtherEarning = find(worker.UserProfileWorkerOtherEarnings, eachPaymentOtherEarnings => {
              return eachPaymentOtherEarnings.PaymentOtherEarningTypeId === this.inputFormGroup.get('PaymentOtherEarningTypeId').value;
            });

            if (findPaymentOtherEarning) {
              this.inputFormGroup.get('RatePercentage').patchValue(findPaymentOtherEarning.RatePercentage);
            }

            if (this.inputFormGroup.get('RatePercentage').value === null) {
              this.inputFormGroup.get('RatePercentage').patchValue(this.phxConstants.PaymentOtherEarningTypeVacationPayRatePercentageDefault);
            }
          }
        }
      }
    } else {
      if (this.inputFormGroup.get('PaymentOtherEarningTypeId').value === this.phxConstants.PaymentOtherEarningType.VacationPay) {
        this.inputFormGroup.get('RatePercentage').patchValue(null);
      }
    }
  }

  getWorker() {
    const rootFormGroup: any = this.getRootFormGroup(this.inputFormGroup);
    const earningsAndDeduction = rootFormGroup.controls.TabEarningsAndDeductions as FormGroup<ITabEarningsAndDeductions>;
    let worker = null;
    if (this.workOrder.UserProfileIdWorker > 0) {
      worker = find(this.listUserProfileWorker, w => {
        return w.Id === this.workOrder.UserProfileIdWorker;
      });
      if (typeof worker !== 'undefined') {
        earningsAndDeduction.get('WorkerProfileTypeId').patchValue(worker.ProfileTypeId);
        earningsAndDeduction.get('WorkerContactId').patchValue(worker.ContactId);
      } else {
        this.phxDialogComponentConfigModel = {
          HeaderTitle: 'Wrong Worker User Profile',
          BodyMessage: 'Worker User Profile with id "' + this.workOrder.UserProfileIdWorker + '" is broken or does not exists',
          Buttons: [
            {
              Id: 1,
              SortOrder: 1,
              CheckValidation: true,
              Name: 'Ok',
              Class: 'btn-primary',
              ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                this.dialogAction_CallBackObButtonClick(callBackObj);
              }
            }
          ],
          ObjectDate: null,
          ObjectComment: null
        };
        this.phxDialogComponent.open();
        earningsAndDeduction.get('WorkerProfileTypeId').patchValue(null);
        worker = null;
      }
    } else {
      earningsAndDeduction.get('WorkerProfileTypeId').patchValue(null);
      earningsAndDeduction.get('WorkerContactId').patchValue(null);
    }
    return worker;
  }

  businessRules(obj: any) {
    if (obj.name === 'IsApplied') {
      this.paymentOtherEarningIsAppliedOnChange();
    }
  }

  dialogAction_CallBackObButtonClick(event) {
    this.phxDialogComponent.close();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<IOtherEarning> {
    return formGroupSetup.formBuilder.group<IOtherEarning>({
      OtherEarning: formGroupSetup.formBuilder.array<IOtherEarnings>(
        workorder.WorkOrderVersion.PaymentInfoes.map((paymentInfo: IPaymentInfo, index) =>
          formGroupSetup.hashModel.getFormGroup<any>(formGroupSetup.toUseHashCode, 'CommissionRate', paymentInfo, index, () =>
            formGroupSetup.formBuilder.group<IOtherEarnings>({
              PaymentInfoId: paymentInfo.Id,
              OrganizationIdSupplier: paymentInfo.OrganizationIdSupplier,
              PaymentOtherEarnings: formGroupSetup.formBuilder.array<IPaymentOtherEarning>(
                paymentInfo.PaymentOtherEarnings.map((paymentOtherEarning: IPaymentOtherEarning, i) =>
                  formGroupSetup.hashModel.getFormGroup<any>(formGroupSetup.toUseHashCode, 'PaymentOtherEarning', paymentOtherEarning, i, () =>
                    formGroupSetup.formBuilder.group<IPaymentOtherEarning>({
                      Id: [paymentOtherEarning.Id],
                      PaymentOtherEarningTypeId: [paymentOtherEarning.PaymentOtherEarningTypeId],
                      IsApplied: [
                        paymentOtherEarning.IsApplied,
                        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings', 'IsApplied', null, [
                          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsApplied', CustomFieldErrorType.required))
                        ])
                      ],
                      IsAccrued: [
                        paymentOtherEarning.IsAccrued,
                        paymentOtherEarning.IsApplied && paymentOtherEarning.PaymentOtherEarningTypeId === PhxConstants.PaymentOtherEarningType.VacationPay
                          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings', 'IsAccrued', null, [
                              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsAccrued', CustomFieldErrorType.required))
                            ])
                          : null
                      ],
                      RatePercentage: [
                        paymentOtherEarning.RatePercentage,
                        paymentOtherEarning.IsApplied
                          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings', 'RatePercentage', null, [
                              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RatePercentage', CustomFieldErrorType.required))
                            ])
                          : null
                      ],
                      SourceId: [paymentOtherEarning.SourceId],
                      PaymentInfoId: [paymentOtherEarning.PaymentInfoId]
                    })
                  )
                )
              )
            })
          )
        )
      )
    });
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupOtherEarnings: FormGroup<any>): IWorkOrder {
    const formGroupOtherEarningsValues: IOtherEarnings[] = formGroupOtherEarnings.controls.OtherEarning.value;
    forEach(formGroupOtherEarningsValues, (paymentInfo: IOtherEarnings) => {
      const paymentInfoIndex = workOrder.WorkOrderVersion.PaymentInfoes.findIndex(a => a.Id === paymentInfo.PaymentInfoId);
      workOrder.WorkOrderVersion.PaymentInfoes[paymentInfoIndex] = { ...workOrder.WorkOrderVersion.PaymentInfoes[paymentInfoIndex], PaymentOtherEarnings: [...paymentInfo.PaymentOtherEarnings] };
    });
    return workOrder;
  }
}
