// Angular
import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { Observable } from 'rxjs/Observable';
import { forEach, find, cloneDeep } from 'lodash';
// common
import { IFormGroupSetup, IReadOnlyStorage, IWorkOrder, IPaymentInfoDetails, ISourceDeductions, ITabEarningsAndDeductions, IPaymentSourceDeductions, IPaymentInfo, IOtherEarning, IStatutoryHoliday, IWorkplaceSafetyInsurance } from '../state/workorder.interface';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { PhxConstants, CustomFieldService } from '../../common';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { HashModel } from '../../common/utility/hash-model';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
// workorder
import { WorkorderTabEarningsAndDeductionOtherEarningsComponent } from '../workorder-tab-earnings-and-deduction-other-earnings/workorder-tab-earnings-and-deduction-other-earnings.component';
import { WorkorderTabEarningsAndDeductionSafetyInsuranceComponent } from './../workorder-tab-earnings-and-deduction-safety-insurance/workorder-tab-earnings-and-deduction-safety-insurance.component';
import { WorkorderTabEarningsAndDeductionStatutoryHolidayComponent } from './../workorder-tab-earnings-deduction-statutory-holiday/workorder-tab-earnings-deduction-statutory-holiday.component';
import { WorkorderTabEarningsAndDeductionSourceDeductionComponent } from './../workorder-tab-earnings-deduction-source-deductions/workorder-tab-earnings-deduction-source-deduction.component';
import { WorkorderTabEarningsAndDeductionTaxesComponent } from './../workorder-tab-earnings-deduction-taxes/workorder-tab-earnings-deduction-taxes.component';
import { WorkorderService } from './../workorder.service';

@Component({
  selector: 'app-workorder-tab-earnings-deductions',
  templateUrl: './workorder-tab-earnings-deduction.component.html'
})

export class WorkorderTabEarningsDeductionsComponent extends BaseComponentOnDestroy implements OnInit {
  subdivisionIdSourceDeductionId: number;
  listUserProfileWorkerLoaded: boolean = false;
  provinceStateChanged: boolean = false;
  workOrder: IWorkOrder;
  sourceDeductionPreviousState: ISourceDeductions;
  formGroupSetup: IFormGroupSetup;
  phxDialogComponentConfigModel: any;
  phxConstants: any;
  listUserProfileWorker: Array<any> = [];
  modalFabButtons: any = [];

  @Input()
  readOnlyStorage: IReadOnlyStorage;
  @Input()
  inputFormGroup: FormGroup<ITabEarningsAndDeductions>;
  @ViewChild('phxDialogComponent')
  phxDialogComponent: any;
  @ViewChild('modal')
  modal: PhxModalComponent;
  @Output()
  outputEvent = new EventEmitter<any>();

  constructor(private workorderObservableService: WorkorderObservableService, private workorderService: WorkorderService, private customFieldService: CustomFieldService, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.phxConstants = PhxConstants;
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          this.workOrder = cloneDeep(workorder);
          this.detectSourceDeductionChange();
          this.sourceDeductionPreviousState = {
            SubdivisionIdSourceDeduction: this.workOrder.WorkOrderVersion.PaymentInfoes[0].SubdivisionIdSourceDeduction,
            IsUseUserProfileWorkerSourceDeduction: this.workOrder.WorkOrderVersion.PaymentInfoes[0].IsUseUserProfileWorkerSourceDeduction
          };
          this.subdivisionIdSourceDeductionId = this.workOrder.WorkOrderVersion.PaymentInfoes[0].SubdivisionIdSourceDeduction;
          if (!this.provinceStateChanged) {
            this.updateIncomeTaxFields();
          }
          this.getUserProfileWorker();
        }
      });
    this.modalFabButtons = [
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
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  changeProvinceState() {
    if (
      this.subdivisionIdSourceDeductionId &&
      this.subdivisionIdSourceDeductionId !== this.workOrder.WorkOrderVersion.PaymentInfoes[0].SubdivisionIdSourceDeduction &&
      this.workOrder.WorkOrderVersion.PaymentInfoes[0].SubdivisionIdSourceDeduction
    ) {
      this.provinceStateChanged = true;
    } else {
      this.provinceStateChanged = false;
    }
  }

  detectSourceDeductionChange() {
    if (
      this.sourceDeductionPreviousState &&
      (this.sourceDeductionPreviousState.SubdivisionIdSourceDeduction !== this.workOrder.WorkOrderVersion.PaymentInfoes[0].SubdivisionIdSourceDeduction ||
        (this.sourceDeductionPreviousState.IsUseUserProfileWorkerSourceDeduction !== this.workOrder.WorkOrderVersion.PaymentInfoes[0].IsUseUserProfileWorkerSourceDeduction &&
          !this.workOrder.WorkOrderVersion.PaymentInfoes[0].IsUseUserProfileWorkerSourceDeduction))
    ) {
      this.provinceStateChanged = true;
    } else {
      this.provinceStateChanged = false;
    }
  }

  onClickIsUseUserProfileWorkerSourceDeductionSuccess() {
    const paymentInfoes = this.inputFormGroup.get('PaymentInfoes') as FormArray<IPaymentInfoDetails>;
    const paymentInfo = paymentInfoes.at(0) as FormGroup<IPaymentInfoDetails>;
    const sourceDeduction = paymentInfo.get('SourceDeductions') as FormGroup<ISourceDeductions>;
    sourceDeduction.get('IsUseUserProfileWorkerSourceDeduction').patchValue(true);
    const control = WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(this.formGroupSetup, []);
    paymentInfo.setControl('PaymentSourceDeductions', control);
  }

  onClickIsUseUserProfileWorkerSourceDeductionReject() {
    const paymentInfoes = this.inputFormGroup.get('PaymentInfoes') as FormArray<IPaymentInfoDetails>;
    const paymentInfo = paymentInfoes.at(0) as FormGroup<IPaymentInfoDetails>;
    const sourceDeduction = paymentInfo.get('SourceDeductions') as FormGroup<ISourceDeductions>;
    sourceDeduction.get('IsUseUserProfileWorkerSourceDeduction').patchValue(false, { emit: false });
  }

  getUserProfileWorker() {
    if (!this.listUserProfileWorkerLoaded) {
      const oDataParams = oreq
        .request()
        .withExpand(['Contact', 'UserProfileWorkerOtherEarnings', 'UserProfileWorkerSourceDeductions'])
        .withSelect([
          'Id',
          'ProfileTypeId',
          'ContactId',
          'Contact/Id',
          'Contact/FullName',
          'OrganizationId',

          'UserProfileWorkerSourceDeductions/IsApplied',
          'UserProfileWorkerSourceDeductions/SourceDeductionTypeId',
          'UserProfileWorkerSourceDeductions/RatePercentage',
          'UserProfileWorkerSourceDeductions/RateAmount',

          'UserProfileWorkerOtherEarnings/IsApplied',
          'UserProfileWorkerOtherEarnings/IsAccrued',
          'UserProfileWorkerOtherEarnings/PaymentOtherEarningTypeId',
          'UserProfileWorkerOtherEarnings/RatePercentage'
        ])
        .url();
      this.workorderService.getListUserProfileWorker(oDataParams).then((response: any) => {
        this.listUserProfileWorker = response.Items;
        this.listUserProfileWorkerLoaded = true;
        if (this.provinceStateChanged) {
          this.getSubDivisionSourceDeduction();
        }
      });
    } else {
      if (this.provinceStateChanged) {
        this.getSubDivisionSourceDeduction();
      }
    }
  }

  getSubDivisionSourceDeduction() {
    let userProfileWorkerSourceDeductions = null;
    let tabEarningsAndDeductionsFormArray = this.inputFormGroup.controls.PaymentInfoes as FormArray<IPaymentInfoDetails>;
    let tabEarningsAndDeductionsFormGroup = tabEarningsAndDeductionsFormArray.at(0) as FormGroup<IPaymentInfoDetails>;
    if (tabEarningsAndDeductionsFormGroup.get('OrganizationIdSupplier').value !== null) {
      this.phxDialogComponentConfigModel = {
        HeaderTitle: 'SubDivisionSourceDeductions must apply only for NULL OrganizationIdSupplier',
        BodyMessage: 'Find the message variable',
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
    }
    if (!userProfileWorkerSourceDeductions) {
      const worker = this.getWorker();
      if (worker && worker.OrganizationId === null && (this.workOrder.workerProfileTypeId === PhxConstants.UserProfileType.WorkerTemp || this.workOrder.workerProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp)) {
        userProfileWorkerSourceDeductions = worker.UserProfileWorkerSourceDeductions;
      }
    }

    if (
      !tabEarningsAndDeductionsFormGroup.value.SourceDeductions.IsUseUserProfileWorkerSourceDeduction &&
      tabEarningsAndDeductionsFormGroup.value.SourceDeductions.SubdivisionIdSourceDeduction &&
      tabEarningsAndDeductionsFormGroup.value.SourceDeductions.SubdivisionIdSourceDeduction > 0 &&
      userProfileWorkerSourceDeductions &&
      userProfileWorkerSourceDeductions.length > 0
    ) {
      const control = WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(this.formGroupSetup, []);
      tabEarningsAndDeductionsFormGroup.setControl('PaymentSourceDeductions', control);
      const oDataParamsForFederalTax = oreq
        .request()
        .withSelect(['Id', 'TaxVersionStatusId', 'EffectiveDate'])
        .url();
      const oDataParamsForProvincialTaxVersionTaxType = oreq
        .request()
        .withSelect(['Id', 'ProvincialTaxHeaderId', 'ProvincialTaxHeaderSubdivisionId', 'ProvincialTaxVersionId', 'ProvincialTaxVersionEffectiveDate', 'SourceDeductionTypeId', 'IsEligible', 'EmployeeRatePercentage'])
        .url();

      const subscription = Observable.combineLatest(
        this.workorderService.getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId(tabEarningsAndDeductionsFormGroup.value.SourceDeductions.SubdivisionIdSourceDeduction, oDataParamsForFederalTax),
        this.workorderService.getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId(tabEarningsAndDeductionsFormGroup.value.SourceDeductions.SubdivisionIdSourceDeduction, oDataParamsForProvincialTaxVersionTaxType)
      );
      subscription.takeUntil(this.isDestroyed$).subscribe((response: any) => {
        tabEarningsAndDeductionsFormArray = this.inputFormGroup.controls.PaymentInfoes as FormArray<IPaymentInfoDetails>;
        tabEarningsAndDeductionsFormGroup = tabEarningsAndDeductionsFormArray.at(0) as FormGroup<IPaymentInfoDetails>;
        if (response !== null && response[0] !== null) {
          forEach(userProfileWorkerSourceDeductions, userProfileWorkerSourceDeduction => {
            if (userProfileWorkerSourceDeduction.SourceDeductionTypeId === PhxConstants.SourceDeductionType.FederalTax || userProfileWorkerSourceDeduction.SourceDeductionTypeId === PhxConstants.SourceDeductionType.AdditionalTax) {
              const paymentSourceDeduction = {
                SourceDeductionTypeId: userProfileWorkerSourceDeduction.SourceDeductionTypeId,
                IsApplied: userProfileWorkerSourceDeduction.IsApplied,
                IsOverWritable: userProfileWorkerSourceDeduction.SourceDeductionTypeId === PhxConstants.SourceDeductionType.AdditionalTax ? true : false,
                ToShow: true,
                RatePercentage: userProfileWorkerSourceDeduction.RatePercentage === 0 ? null : userProfileWorkerSourceDeduction.RatePercentage,
                RateAmount: userProfileWorkerSourceDeduction.RateAmount === 0 ? null : userProfileWorkerSourceDeduction.RateAmount
              };
              const paymentSourceDeductions = tabEarningsAndDeductionsFormGroup.get('PaymentSourceDeductions') as FormArray<IPaymentSourceDeductions>;
              paymentSourceDeductions.push(WorkorderTabEarningsAndDeductionTaxesComponent.paymentSourceDeduction(this.formGroupSetup, paymentSourceDeduction));
            }
          });
        }
        if (response !== null && response[1] !== null) {
          forEach(userProfileWorkerSourceDeductions, userProfileWorkerSourceDeduction => {
            forEach(response[1].Items, taxType => {
              if (
                userProfileWorkerSourceDeduction.SourceDeductionTypeId === taxType.SourceDeductionTypeId &&
                (userProfileWorkerSourceDeduction.SourceDeductionTypeId !== PhxConstants.SourceDeductionType.FederalTax || userProfileWorkerSourceDeduction.SourceDeductionTypeId !== PhxConstants.SourceDeductionType.AdditionalTax)
              ) {
                const paymentSourceDeduction = {
                  SourceDeductionTypeId: userProfileWorkerSourceDeduction.SourceDeductionTypeId,
                  IsApplied: taxType.IsEligible && userProfileWorkerSourceDeduction.IsApplied,
                  IsOverWritable: taxType.IsEligible,
                  ToShow: taxType.IsEligible,
                  RatePercentage: userProfileWorkerSourceDeduction.RatePercentage === 0 ? null : userProfileWorkerSourceDeduction.RatePercentage,
                  RateAmount: userProfileWorkerSourceDeduction.RateAmount === 0 ? null : userProfileWorkerSourceDeduction.RateAmount
                };
                const paymentSourceDeductions = tabEarningsAndDeductionsFormGroup.get('PaymentSourceDeductions') as FormArray<IPaymentSourceDeductions>;
                paymentSourceDeductions.push(WorkorderTabEarningsAndDeductionTaxesComponent.paymentSourceDeduction(this.formGroupSetup, paymentSourceDeduction));
              }
            });
          });
          this.outputEvent.emit();
        }
      });
    } else {
      const control = WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(this.formGroupSetup, []);
      tabEarningsAndDeductionsFormGroup.setControl('PaymentSourceDeductions', control);
    }
  }

  dialogAction_CallBackObButtonClick(event) {
    this.phxDialogComponent.close();
  }
  getWorker() {
    let worker = null;
    if (this.workOrder.UserProfileIdWorker > 0) {
      worker = find(this.listUserProfileWorker, w => {
        return w.Id === this.workOrder.UserProfileIdWorker;
      });
      if (typeof worker !== 'undefined') {
        this.inputFormGroup.get('WorkerProfileTypeId').patchValue(worker.ProfileTypeId);
        this.inputFormGroup.get('WorkerContactId').patchValue(worker.ContactId);
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
        this.inputFormGroup.get('WorkerProfileTypeId').patchValue(null);
        worker = null;
      }
    } else {
      this.inputFormGroup.get('WorkerProfileTypeId').patchValue(null);
      this.inputFormGroup.get('WorkerContactId').patchValue(null);
    }
    return worker;
  }

  updateIncomeTaxFields() {
    const oDataParamsForProvincialTaxVersionTaxType = oreq
      .request()
      .withSelect(['Id', 'ProvincialTaxHeaderId', 'ProvincialTaxHeaderSubdivisionId', 'ProvincialTaxVersionId', 'ProvincialTaxVersionEffectiveDate', 'SourceDeductionTypeId', 'IsEligible', 'EmployeeRatePercentage'])
      .url();
    forEach(this.inputFormGroup.get('PaymentInfoes').value, (sourceDeductinsAndTaxes: IPaymentInfoDetails, index: number) => {
      const paymentInfoes = this.inputFormGroup.get('PaymentInfoes') as FormArray<IPaymentInfoDetails>;
      const paymentInfo = paymentInfoes.at(index) as FormGroup<IPaymentInfoDetails>;
      if (sourceDeductinsAndTaxes.SubdivisionIdSourceDeduction) {
        this.workorderService.getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId(sourceDeductinsAndTaxes.SubdivisionIdSourceDeduction, oDataParamsForProvincialTaxVersionTaxType).subscribe((response: any) => {
          const paymentSourceDeductions = paymentInfo.controls.PaymentSourceDeductions as FormArray<IPaymentSourceDeductions>;
          forEach(sourceDeductinsAndTaxes.PaymentSourceDeductions, (paymentSourceDeduction: IPaymentSourceDeductions, j: number) => {
            const paymentSourceDeductionFormGroup: FormGroup<IPaymentSourceDeductions> = paymentSourceDeductions.at(j) as FormGroup<IPaymentSourceDeductions>;
            forEach(response.Items, taxType => {
              if (
                paymentSourceDeductionFormGroup.get('SourceDeductionTypeId').value === taxType.SourceDeductionTypeId &&
                (paymentSourceDeductionFormGroup.get('SourceDeductionTypeId').value !== PhxConstants.SourceDeductionType.FederalTax ||
                  paymentSourceDeductionFormGroup.get('SourceDeductionTypeId').value !== PhxConstants.SourceDeductionType.AdditionalTax)
              ) {
                paymentSourceDeductionFormGroup.get('IsOverWritable').patchValue(taxType.IsEligible);
                paymentSourceDeductionFormGroup.get('ToShow').patchValue(taxType.IsEligible);
              } else if (paymentSourceDeductionFormGroup.get('SourceDeductionTypeId').value === PhxConstants.SourceDeductionType.FederalTax) {
                paymentSourceDeductionFormGroup.get('IsOverWritable').patchValue(false);
                paymentSourceDeductionFormGroup.get('ToShow').patchValue(true);
              } else if (paymentSourceDeductionFormGroup.get('SourceDeductionTypeId').value === PhxConstants.SourceDeductionType.AdditionalTax) {
                paymentSourceDeductionFormGroup.get('IsOverWritable').patchValue(true);
                paymentSourceDeductionFormGroup.get('ToShow').patchValue(true);
              }
            });
          });
        });
      }
    });
  }

  filterOnPaymentSourceDeductionsByIncomeTaxes(controls: any) {
    return controls.filter(
      a =>
        a.value.SourceDeductionTypeId === PhxConstants.SourceDeductionType.FederalTax ||
        a.value.SourceDeductionTypeId === PhxConstants.SourceDeductionType.Provincial ||
        a.value.SourceDeductionTypeId === PhxConstants.SourceDeductionType.AdditionalTax
    );
  }

  filterOnPaymentSourceDeductionsByPayrollTaxes(controls: any) {
    return controls.filter(
      a =>
        a.value.SourceDeductionTypeId !== PhxConstants.SourceDeductionType.FederalTax &&
        a.value.SourceDeductionTypeId !== PhxConstants.SourceDeductionType.Provincial &&
        a.value.SourceDeductionTypeId !== PhxConstants.SourceDeductionType.AdditionalTax
    );
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder, workorderObservableService: WorkorderObservableService): FormGroup<ITabEarningsAndDeductions> {
    const formGroup: FormGroup<ITabEarningsAndDeductions> = formGroupSetup.formBuilder.group<ITabEarningsAndDeductions>({
      OtherEarnings: WorkorderTabEarningsAndDeductionOtherEarningsComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      WorkplaceSafetyInsurance: WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      StatutoryHoliday: WorkorderTabEarningsAndDeductionStatutoryHolidayComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      PaymentInfoes: formGroupSetup.formBuilder.array<IPaymentInfoDetails>(
        workorder.WorkOrderVersion.PaymentInfoes.map((paymentInfo: IPaymentInfo) => {
          return formGroupSetup.formBuilder.group<IPaymentInfoDetails>({
            PaymentInfoId: [paymentInfo.Id],
            OrganizationIdSupplier: [paymentInfo.OrganizationIdSupplier],
            SubdivisionIdSourceDeduction: [paymentInfo.SubdivisionIdSourceDeduction],
            SourceDeductions: WorkorderTabEarningsAndDeductionSourceDeductionComponent.formBuilderGroupSetup(formGroupSetup, paymentInfo, workorder),
            PaymentSourceDeductions: WorkorderTabEarningsAndDeductionTaxesComponent.formBuilderGroupSetup(formGroupSetup, paymentInfo.PaymentSourceDeductions)
          });
        })
      ),
      AccrueEmployerHealthTaxLiability: [workorder.WorkOrderVersion.AccrueEmployerHealthTaxLiability],
      WorkerProfileTypeId: [workorder.workerProfileTypeId],
      WorkerContactId: [workorder.workerContactId]
    });
    return formGroup;
  }

  onOutputEvent(e) {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupRoot: FormGroup<ITabEarningsAndDeductions>): IWorkOrder {
    workOrder = WorkorderTabEarningsAndDeductionOtherEarningsComponent.formGroupToPartial(workOrder, <FormGroup<IOtherEarning>>formGroupRoot.controls.OtherEarnings);
    workOrder = WorkorderTabEarningsAndDeductionStatutoryHolidayComponent.formGroupToPartial(workOrder, <FormGroup<IStatutoryHoliday>>formGroupRoot.controls.StatutoryHoliday);
    workOrder = WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.formGroupToPartial(workOrder, <FormGroup<IWorkplaceSafetyInsurance>>formGroupRoot.controls.WorkplaceSafetyInsurance);
    workOrder = WorkorderTabEarningsAndDeductionSourceDeductionComponent.formGroupToPartial(workOrder, <FormArray<IPaymentInfoDetails>>formGroupRoot.controls.PaymentInfoes);
    workOrder = WorkorderTabEarningsAndDeductionTaxesComponent.formGroupToPartial(workOrder, <FormArray<IPaymentInfoDetails>>formGroupRoot.controls.PaymentInfoes);
    return workOrder;
  }
}
