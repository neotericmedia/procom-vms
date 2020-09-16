// Angular
import { Component, OnInit, Input, ViewChild } from '@angular/core';
// Common
import { FormGroup, FormArray, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { HashModel } from '../../common/utility/hash-model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
// Work order
import { IWorkOrder, IFormGroupSetup, ISourceDeductions, ITabEarningsAndDeductions, IPaymentInfoDetails, IPaymentInfo } from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderTabEarningsAndDeductionTaxesComponent } from './../workorder-tab-earnings-deduction-taxes/workorder-tab-earnings-deduction-taxes.component';
import { WorkorderService } from '../workorder.service';
import { PtFieldViewCustomValidator } from './../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-tab-earnings-deduction-source-deduction',
  templateUrl: './workorder-tab-earnings-deduction-source-deduction.component.html'
})
export class WorkorderTabEarningsAndDeductionSourceDeductionComponent extends WorkOrderBaseComponentPresentational<ISourceDeductions> implements OnInit {
  workOrder: IWorkOrder;
  formGroupSetup: IFormGroupSetup;
  formGroupTabEarningsAndDeductions: FormGroup<ITabEarningsAndDeductions>;
  html: {
    lists: {
      workOrderSalesTaxTerritories: Array<any>;
    };
  } = {
    lists: {
      workOrderSalesTaxTerritories: []
    }
  };
  phxDialogComponentConfigModel: any;
  @Input()
  listUserProfileWorker: Array<any>;
  @ViewChild('modal')
  modal: PhxModalComponent;
  @ViewChild('phxDialogComponent')
  phxDialogComponent: any;

  constructor(private workorderObservableService: WorkorderObservableService, private workorderService: WorkorderService) {
    super('WorkorderTabEarningsAndDeductionOtherEarningsComponent');
    this.excludedFields = ['IsUseUserProfileWorkerSourceDeduction'];
  }

  ngOnInit() {
    this.html.lists.workOrderSalesTaxTerritories = this.codeValueService.getRelatedCodeValues(this.codeValueGroups.Subdivision, PhxConstants.Country.CA, this.codeValueGroups.Country);
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        this.workOrder = workorder;
        const formGroup: any = this.getRootFormGroup(this.inputFormGroup);
        this.formGroupTabEarningsAndDeductions = formGroup.controls.TabEarningsAndDeductions as FormGroup<ITabEarningsAndDeductions>;
      });
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null ) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: any) {
    if (obj.name === 'SubdivisionIdSourceDeduction') {
      this.onChangeSourceDeductionSubdivision();
      this.getSubDivisionSourceDeductions();
    }
  }

  onChangeSourceDeductionSubdivision() {
    if (this.inputFormGroup.get('SubdivisionIdSourceDeduction').value === 600 && this.workOrder.OrganizationIdInternal === 1 && this.workOrder.workerProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp) {
      this.formGroupTabEarningsAndDeductions.get('AccrueEmployerHealthTaxLiability').patchValue(true);
    } else {
      this.formGroupTabEarningsAndDeductions.get('AccrueEmployerHealthTaxLiability').patchValue(null);
    }
  }

  getSubDivisionSourceDeductions() {
    const tabEarningsAndDeductionsFormGroup = this.inputFormGroup.parent as FormGroup<IPaymentInfoDetails>;
    const control = WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(this.formGroupSetup, []);
    tabEarningsAndDeductionsFormGroup.setControl('PaymentSourceDeductions', control);
  }

  modalFabButtons = [
    {
      icon: 'done',
      tooltip: 'Yes',
      btnType: 'primary',
      action: () => {
        this.modal.hide();
        this.onClickIsUseUserProfileWorkerSourceDeductionSuccess();
      }
    },
    {
      icon: 'library_add',
      tooltip: 'No',
      btnType: 'default',
      action: () => {
        this.modal.hide();
        this.onClickIsUseUserProfileWorkerSourceDeductionReject();
      }
    }
  ];

  onClickIsUseUserProfileWorkerSourceDeduction(event) {
    if (this.inputFormGroup.value.IsUseUserProfileWorkerSourceDeduction) {
      this.modal.show();
    } else {
      const tabEarningsAndDeductionsFormGroup = this.inputFormGroup.parent as FormGroup<IPaymentInfoDetails>;
      const control = WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(this.formGroupSetup, []);
      tabEarningsAndDeductionsFormGroup.setControl('PaymentSourceDeductions', control);
      this.outputEvent.emit();
    }
  }
  onClickIsUseUserProfileWorkerSourceDeductionSuccess() {
    this.inputFormGroup.get('IsUseUserProfileWorkerSourceDeduction').patchValue(true);
    const tabEarningsAndDeductionsFormGroup = this.inputFormGroup.parent as FormGroup<IPaymentInfoDetails>;
    const control = WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(this.formGroupSetup, []);
    tabEarningsAndDeductionsFormGroup.setControl('PaymentSourceDeductions', control);
    this.outputEvent.emit();
  }
  onClickIsUseUserProfileWorkerSourceDeductionReject() {
    const formGroup = this.inputFormGroup as AbstractControl<ISourceDeductions>;
    formGroup.get('IsUseUserProfileWorkerSourceDeduction').patchValue(false, { emit: true });
  }

  dialogAction_CallBackObButtonClick(event) {
    this.phxDialogComponent.close();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, paymentInfo: IPaymentInfo, workOrder: IWorkOrder): FormGroup<ISourceDeductions> {
    const isValidate = paymentInfo.OrganizationIdSupplier === null &&
    (workOrder.workerProfileTypeId === PhxConstants.UserProfileType.WorkerTemp ||
    workOrder.workerProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp);


    return formGroupSetup.formBuilder.group<ISourceDeductions>({
      SubdivisionIdSourceDeduction: [
        paymentInfo.SubdivisionIdSourceDeduction,
        isValidate && PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes', 'SubdivisionIdSourceDeduction', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SubdivisionIdSourceDeduction', CustomFieldErrorType.required))]
      )
      ],
      IsUseUserProfileWorkerSourceDeduction: [
        paymentInfo.IsUseUserProfileWorkerSourceDeduction,
        isValidate && PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.PaymentInfoes', 'IsUseUserProfileWorkerSourceDeduction', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsUseUserProfileWorkerSourceDeduction', CustomFieldErrorType.required))]
      )
      ]
    });
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(workOrder: IWorkOrder, PaymentInfoes: FormArray<IPaymentInfoDetails>): IWorkOrder {
    const paymentInfoesValues = PaymentInfoes.value;
    paymentInfoesValues.map((paymentInfo: IPaymentInfoDetails) => {
      const currentPaymentInfoIndex = workOrder.WorkOrderVersion.PaymentInfoes.findIndex(a => a.Id === paymentInfo.PaymentInfoId);
      workOrder.WorkOrderVersion.PaymentInfoes[currentPaymentInfoIndex].SubdivisionIdSourceDeduction = paymentInfo.SourceDeductions.SubdivisionIdSourceDeduction;
      workOrder.WorkOrderVersion.PaymentInfoes[currentPaymentInfoIndex].IsUseUserProfileWorkerSourceDeduction = paymentInfo.SourceDeductions.IsUseUserProfileWorkerSourceDeduction;
    });
    return workOrder;
  }
}
