
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProfile } from '../../contact/state';
import { ContactService } from '../../contact/shared/contact.service';
import { FormBuilder, FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions, CommonService } from '../../common';
import { ITransactionAdjustment, IFormGroupSetup, ITransactionAdjustmentAmount } from '../../contact/state/profile.interface';
import { HashModel } from '../../common/utility/hash-model';
import { CustomFieldService } from '../../common/services/custom-field.service';
import { CustomFieldErrorType } from '../../common/model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { Location } from '@angular/common';
import { values, forEach } from 'lodash';
import { ProfileService } from '../../contact/shared/profile.service';
import { WorkorderService } from '../workorder.service';

const Command = PhxConstants.CommandNamesSupportedByUi.BaseContactsCommand;

@Component({
  selector: 'app-workorder-create-adjustment',
  templateUrl: './workorder-create-adjustment.component.html',
  styleUrls: ['./workorder-create-adjustment.component.less']
})
export class WorkorderCreateAdjustmentComponent implements OnInit {

  @ViewChild('ConfirmModal') ConfirmModal: PhxModalComponent;
  isAlive: boolean = true;
  newWorkOrderVersionId: number = 0;
  DataParams: string = null;
  EmployeeAmountTotal: number;
  EmployerAmountTotal: number;
  ClientAmountTotal: number;
  listsWorkOrder: Array<any>;
  transactionAdjustmentForm: FormGroup<ITransactionAdjustment>;
  phxConstants: any;
  adjustmentList: Array<any> = [];
  organizationIdInternal: number;
  workerDetails: any;
  selectedAdjustments: Array<any> = [];
  formGroupSetup: IFormGroupSetup;
  NewTransactionAdjustment = {} as ITransactionAdjustment;
  validationMessages: Array<any>;
  userProfileId: number;
  workOrderVersionId: number;
  isWorkerProfileSpValid: boolean = true;
  isWorkerProfileIncValid: boolean = true;
  errorData: Array<any>;
  contactDetails: IProfile;
  numberFilter: { 'from': 0, 'to': 999999.99, 'decimalplaces': 2 };

  constructor(
    private activatedRoute: ActivatedRoute,
    private contactService: ContactService,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private profileService: ProfileService,
    private router: Router,
    private _location: Location,
    private workOrderService: WorkorderService
  ) {
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe(x => {
      this.userProfileId = +x.userProfileId;
      this.workOrderVersionId = +x.workOrderVersionId;
      this.profileService.get(this.userProfileId).subscribe(x => {
        this.contactDetails = x;
      });
      this.getWorkOrderList();
      this.initializeForm();
      if (this.userProfileId && this.workOrderVersionId) {
        this.setWorkOrderDetails(this.workOrderVersionId);
        }
    });
    this.ConfirmModal.addClassToConfig('modal-lg');
  }

  setWorkOrderDetails(id: number) {
  this.transactionAdjustmentForm.controls['WorkOrderId'].setValue(id);
  this.workerOrderChanged(id);
  }

  public trimFirstPart(value: string) {
    return value.replace(/^((?!Aa).)*\s-\s/, '');
  }

  getWorkOrderList() {
    this.contactService.getSearchByUserProfileIdWorker(this.userProfileId).subscribe((result: any) => {
      this.listsWorkOrder = result.Items;
    });
  }

  initializeForm() {
    this.NewTransactionAdjustment = {
      Description: null,
      WorkOrderId: null,
      AdjustmentId: null,
      ReleaseType: null,
      Amount: []
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.transactionAdjustmentForm = this.formBuilderGroupSetup(this.formGroupSetup, this.NewTransactionAdjustment);
  }

  workerOrderChanged(WorkerId) {
    if (WorkerId !== null) {
      this.contactService.getAdjustmentNew(WorkerId, null).subscribe((result: any) => {
        this.workerDetails = result;
        this.workerDetails.Id = result.WorkOrderVersionId;
        this.adjustmentList = result.AdjustmentApplicables;
        this.organizationIdInternal = result.OrganizationIdInternal;
        if (this.adjustmentList) {
          this.adjustmentList.forEach(element => {
            element.Name = element.EntityName + ' - ' + element.Name;
            element.isApplied = false;
            element.EmployeeAmount = 0;
            element.EmployerAmount = 0;
            element.ClientAmount = 0;
          });
        }
      });
    }
  }

  addAdjustment(event) {
    if (event.value) {
      const filteredItem = this.adjustmentList.find(x => x.Name === event.value);
      const index = this.adjustmentList.indexOf(filteredItem);
      filteredItem.isApplied = true;
      filteredItem.EmployeeAmount = 0;
      filteredItem.EmployerAmount = 0;
      filteredItem.ClientAmount = 0;
      const formArrayOf = this.transactionAdjustmentForm.get('Amount') as FormArray<ITransactionAdjustmentAmount>;
      formArrayOf.push(this.getAdjustmentAmountGroup(this.formGroupSetup, {
        EmployeeAmount: 0,
        EmployerAmount: 0,
        ClientAmount: 0,
        isApplied: true,
        ApplicableAdjustmentTypeId: filteredItem.ApplicableAdjustmentTypeId,
        EmployeeYtdDeduction: filteredItem.EmployeeYtdDeduction,
        EntityId: filteredItem.EntityId,
        EntityName: filteredItem.EntityName,
        IsApplicableToClient: filteredItem.IsApplicableToClient,
        IsApplicableToEmployee: filteredItem.IsApplicableToEmployee,
        IsApplicableToEmployer: filteredItem.IsApplicableToEmployer,
        Name: filteredItem.Name,
        SalesTaxTypeId: filteredItem.SalesTaxTypeId,
        SourceDeductionTypeId: filteredItem.SourceDeductionTypeId,
        EmployerYtdDeduction: filteredItem.EmployerYtdDeduction
      }));
      this.adjustmentList = this.adjustmentList.filter(item => item.isApplied !== true);
      this.selectedAdjustments.push(filteredItem);
    }
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, transactionAdjustmentForm: ITransactionAdjustment): FormGroup<ITransactionAdjustment> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<ITransactionAdjustment>(formGroupSetup.toUseHashCode, 'New Transaction Adjustment', transactionAdjustmentForm, 0, () =>
      formGroupSetup.formBuilder.group<ITransactionAdjustment>({
        Description: [
          transactionAdjustmentForm.Description,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))
          ]
        ],
        WorkOrderId: [
          transactionAdjustmentForm.WorkOrderId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WorkOrderId', CustomFieldErrorType.required))
          ]
        ],
        AdjustmentId: [
          transactionAdjustmentForm.AdjustmentId
        ],
        ReleaseType: [
          transactionAdjustmentForm.ReleaseType,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ReleaseType', CustomFieldErrorType.required))
          ]
        ],
        Amount: this.getAdjustmentAmountArray(this.formGroupSetup, [])
      })
    );
    return formGroup;
  }

  getAdjustmentAmountArray(formGroupOnNew: IFormGroupSetup, TransactionAmountArray: Array<ITransactionAdjustmentAmount>) {
    const ArrayAmount = formGroupOnNew.formBuilder.array<ITransactionAdjustmentAmount>(
      TransactionAmountArray.map((NewAmountArray: ITransactionAdjustmentAmount, index) =>
        formGroupOnNew.hashModel.getFormGroup<ITransactionAdjustmentAmount>(formGroupOnNew.toUseHashCode, 'NewAmountArray', NewAmountArray, index, () =>
          this.getAdjustmentAmountGroup(formGroupOnNew, NewAmountArray)
        )
      )
    );
    return ArrayAmount;
  }


  getAdjustmentAmountGroup(formGroupOnNew: IFormGroupSetup, TransactionAmount: ITransactionAdjustmentAmount) {
    return formGroupOnNew.formBuilder.group<ITransactionAdjustmentAmount>({
      EmployeeAmount: [TransactionAmount.EmployeeAmount],
      EmployerAmount: [TransactionAmount.EmployerAmount],
      ClientAmount: [TransactionAmount.ClientAmount],
      isApplied: [TransactionAmount.isApplied],
      ApplicableAdjustmentTypeId: [TransactionAmount.ApplicableAdjustmentTypeId],
      EmployeeYtdDeduction: [TransactionAmount.EmployeeYtdDeduction],
      EntityId: [TransactionAmount.EntityId],
      EntityName: [TransactionAmount.EntityName],
      IsApplicableToClient: [TransactionAmount.IsApplicableToClient],
      IsApplicableToEmployee: [TransactionAmount.IsApplicableToEmployee],
      IsApplicableToEmployer: [TransactionAmount.IsApplicableToEmployer],
      Name: [TransactionAmount.Name],
      SalesTaxTypeId: [TransactionAmount.SalesTaxTypeId],
      SourceDeductionTypeId: [TransactionAmount.SourceDeductionTypeId],
      NewYTDEmployerDeduction: [TransactionAmount.NewYTDEmployerDeduction],
      NewYTDWorkerDeduction: [TransactionAmount.NewYTDWorkerDeduction]
    });
  }

  CommitChange(Data: any) {

    this.EmployeeAmountTotal = 0;
    this.EmployerAmountTotal = 0;
    this.ClientAmountTotal = 0;

    Data.forEach(element => {
      this.EmployeeAmountTotal -= parseFloat(element.value.EmployeeAmount);
      this.EmployerAmountTotal += parseFloat(element.value.EmployerAmount);
      this.ClientAmountTotal += parseFloat(element.value.ClientAmount);
      element.value.NewYTDWorkerDeduction = parseFloat(isNaN(element.value.EmployeeYtdDeduction) ? 0 : (element.value.EmployeeYtdDeduction)) + parseFloat(isNaN(element.value.EmployeeAmount) ? 0 : (element.value.EmployeeAmount));
      element.value.NewYTDEmployerDeduction = parseFloat(isNaN(element.value.EmployerYtdDeduction) ? 0 : (element.value.EmployerYtdDeduction)) + parseFloat(isNaN(element.value.EmployerAmount) ? 0 : (element.value.EmployerAmount));

    });
  }

  removeAdjustment(index: any, formData: any) {
    const arrayData = this.transactionAdjustmentForm.controls.Amount as FormArray<any>;
    const tempData = arrayData.at(index).value;
    tempData.isApplied = false;
    this.adjustmentList.push(tempData);
    arrayData.removeAt(index);
    this.EmployeeAmountTotal = 0;
    let indx = this.selectedAdjustments.findIndex(x => x.EntityId == tempData.EntityId);
    this.selectedAdjustments.splice(indx, 1);

    this.adjustmentList = this.adjustmentList.filter(item => item.isApplied !== true);

    this.EmployerAmountTotal = 0;
    this.ClientAmountTotal = 0;
    this.transactionAdjustmentForm.controls.Amount.value.forEach(element => {
      this.EmployeeAmountTotal -= isNaN(element.EmployeeAmount) ? 0 : (element.EmployeeAmount);
      this.EmployerAmountTotal += isNaN(element.EmployerAmount) ? 0 : (element.EmployerAmount);
      this.ClientAmountTotal += isNaN(element.ClientAmount) ? 0 : (element.ClientAmount);
    });
  
  }

  onClickSubmit() {
    this.ConfirmModal.show();
    this.transactionAdjustmentForm.controls.Amount.value.forEach(item => {
      if (this.workerDetails.WorkerProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp &&
        item.SourceDeductionTypeId > 0 &&
        item.SourceDeductionTypeId !== this.phxConstants.SourceDeductionType.CanadaPensionPlan &&
        item.SourceDeductionTypeId !== this.phxConstants.SourceDeductionType.EmploymentInsurance) {
        this.isWorkerProfileSpValid = false;
      }

      if (this.workerDetails.WorkerProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianInc &&
        item.SourceDeductionTypeId > 0) {
        this.isWorkerProfileIncValid = false;
      }
    });

  }

  finalSubmit() {
    const transactionHeaderAdjustmentSubmitCommand = {
      WorkOrderVersionId: this.workerDetails.Id,
      Description: this.transactionAdjustmentForm.get('Description').value,
      SuppressPayment: this.transactionAdjustmentForm.get('ReleaseType').value,
      Adjustments: this.transactionAdjustmentForm.get('Amount').value,
      EntityIds: [this.workerDetails.Id]
    };


    // this.contactService.transactionHeaderAdjustmentSubmit(transactionHeaderAdjustmentSubmitCommand).subscribe((result: any) => {
    this.profileService.executeProfileCommand(Command.UserProfileCreateAdjustment, null, transactionHeaderAdjustmentSubmitCommand).then((result: any) => {
      this.validationMessages = [];
      this.ConfirmModal.hide();
      if (result.EntityIdRedirect) {
        this.commonService.logSuccess('Transaction Submitted');
        const navigateTo = (transactionIdNavigateTo: number, tabNavigationName: any) => {
          const navigatePath = `/next/transaction/${transactionIdNavigateTo}/${tabNavigationName}`;
          this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
            console.error(`app-organization: error navigating to ${transactionIdNavigateTo} , ${tabNavigationName}`, err);
          });
        };
        navigateTo(result.EntityIdRedirect, 'summary');
      } else {
        this.errorData = result;
        this.parseValidationMessages();
      }

    });
  }

  private parseValidationMessages() {
    if (this.errorData) {
      Object.keys(this.errorData).forEach(item => {
        if (item === 'ModelState' && Object.keys(this.errorData[item]).length) {
          const val = values(this.errorData[item]);
          forEach(val, value => {
            for (let index = 0; index < value.length; index++) {
              const msg = value[index];
              this.validationMessages.push(msg);
            }
          });
        }
      });
      this.commonService.logError('Your Submission has ' + this.validationMessages.length + ' validation message(s)');
    }
  }

  cancelModal() {
    this.ConfirmModal.hide();
  }

  cancelClick() {
    this._location.back();
  }

}
