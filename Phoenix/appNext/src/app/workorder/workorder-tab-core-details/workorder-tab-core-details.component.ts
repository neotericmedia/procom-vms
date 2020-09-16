// angular
import { Component, OnInit, ViewChild } from '@angular/core';
// common
import { PhxConstants, ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
// work order
import { ITabCoreDetails, IWorkOrder, IWorkOrderVersion, IFormGroupSetup, IRoot } from './../state/workorder.interface';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from './../workorder-base-component-presentational';
import { WorkorderService } from './../workorder.service';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';
import { filter } from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-workorder-tab-core-details',
  templateUrl: './workorder-tab-core-details.component.html'
})

export class WorkorderTabCoreDetailsComponent extends WorkOrderBaseComponentPresentational<ITabCoreDetails> implements OnInit {
  isDraftStatus: boolean;
  isComplianceDraftStatus: boolean;
  isDisplayWorkOrderStartDateState: boolean;
  isDisplayWorkOrderEndDateState: boolean;
  workOrder: IWorkOrder;
  html: {
    lists: {
      lineOfBussiness: Array<any>;
      InternalOrganizationDefinition1List: Array<any>;
      workOrderWorkLocations: Array<any>;
      workOrderPositionTitles: Array<any>;
      OrganizationInternalList: Array<any>; // Internal organization
    };
  } = {
      lists: {
        lineOfBussiness: [],
        InternalOrganizationDefinition1List: [],
        workOrderWorkLocations: [],
        OrganizationInternalList: [],
        workOrderPositionTitles: []
      }
    };
  phxDialogComponentConfigModel: any;
  isDialogShown: boolean = false;

  @ViewChild('phxDialogComponent') phxDialogComponent: any;

  constructor(private workorderService: WorkorderService, private workorderObservableService: WorkorderObservableService) {
    super('WorkorderTabCoreDetailsComponent');
    this.getLists();
  }

  ngOnInit() {
    this.workorderObservableService.workorderOnRouteChange$(this).takeUntil(this.isDestroyed$).subscribe((workOrder: IWorkOrder) => {
      if (workOrder) {
        this.workOrder = workOrder;
        this.controlDisplayStatus();
      }
    });
    this.phxDialogComponentConfigModel = {
      HeaderTitle: 'The Internal Company Has Changed',
      BodyMessage: 'The Workplace Safety Insurance Worker Classification list has been updated.',
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
        },
      ],
      ObjectDate: null,
      ObjectComment: null
    };
    this.getInternalOrganization();
  }

  onChangeCurrentWorkOrderVersionWorksiteId() {
    // TODO: update all the other controls based on business rule
    const worksiteControl = this.inputFormGroup.get('WorksiteId');

    // console.log('onChangeCurrentWorkOrderVersionWorksiteId trigger: ' + worksiteControl.value);
    // console.log('  this.workOrder.WorkOrderVersion.WCBIsApplied: ' + this.workOrder.WorkOrderVersion.WCBIsApplied);
    // console.log('this.workOrder.WorkOrderVersion.WorkerCompensationId: ' + this.workOrder.WorkOrderVersion.WorkerCompensationId);

    // const rootFormGroup: FormGroup<IRoot> = <any>this.getRootFormGroup(this.inputFormGroup);
    // rootFormGroup.get('TabEarningsAndDeductions').get('WorkplaceSafetyInsurance').get('WCBIsApplied').patchValue();


    // this.workOrder.WorkOrderVersion.WCBIsApplied = null; // patch value
    // this.workOrder.WorkOrderVersion.WorkerCompensationId = null;
    worksiteControl.updateValueAndValidity();

    this.phxDialogComponentConfigModel.HeaderTitle = 'The Worksite Province Has Changed';
    this.phxDialogComponent.open();
  }
  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getLists() {
    this.html.lists.lineOfBussiness = this.codeValueService.getCodeValues(this.codeValueGroups.LineOfBusiness, true);
    this.html.lists.lineOfBussiness = filter(this.html.lists.lineOfBussiness, function (o) { return o.id !== PhxConstants.LineOfBusiness.P; });
    this.html.lists.InternalOrganizationDefinition1List = this.codeValueService.getCodeValues(this.codeValueGroups.InternalOrganizationDefinition1, true);
    this.html.lists.InternalOrganizationDefinition1List.forEach(item => { item.value = item.text + '-' + item.code; });
    this.html.lists.workOrderWorkLocations = this.codeValueService.getCodeValues(this.codeValueGroups.Worksite, true);
    this.html.lists.workOrderPositionTitles = this.codeValueService.getCodeValues(this.codeValueGroups.PositionTitle, true);
  }

  controlDisplayStatus() {
    this.isDraftStatus = this.workOrder.WorkOrderVersion.IsDraftStatus;
    this.isComplianceDraftStatus = this.workOrder.WorkOrderVersion.IsComplianceDraftStatus;
    this.isDisplayWorkOrderStartDateState = this.displayWorkOrderStartEndDateState();
    this.isDisplayWorkOrderEndDateState = this.displayWorkOrderStartEndDateState();
  }

  getInternalOrganization() {
    this.workorderService
      .getListOrganizationInternal()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response.length > 0) {
          this.html.lists.OrganizationInternalList = response.map((value: any) => {
            return {
              Code: value.Code,
              IsTest: value.IsTest,
              OrganizationIdInternal: value.Id,
              Name: value.DisplayName,
              DisplayValue: value.DisplayName + ' - ' + value.Id
            };
          });
        }
      });
  }

  displayWorkOrderStartEndDateState() {
      if (this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Processing
        || this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved
        ||  this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Replaced
        ||  this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingUnterminate
        ||  this.workOrder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Deleted) {
          return false;
        } else {
          return true;
        }
  }

  getWorkOrderEndDate(workOrder: IWorkOrder, workOrderVersion: IWorkOrderVersion) {
    if (workOrder.StatusId === this.phxConstants.WorkOrderStatus.Terminated ||
      (workOrderVersion.StatusId === this.phxConstants.WorkOrderVersionStatus.PendingUnterminate &&
        workOrder.StatusId === this.phxConstants.WorkOrderStatus.ChangeInProgress)
    ) {
      return this.inputFormGroup.get('TerminationDate').value;
    } else {
      return this.inputFormGroup.get('WorkOrderEndDateState').value !== null
        ? this.inputFormGroup.get('WorkOrderEndDateState').value
        : this.inputFormGroup.get('EndDate').value;
    }
  }

  datePickerCallbackOnDoneEndDate() {
    const woEndDate = this.getWorkOrderEndDate(this.workOrder, this.workOrder.WorkOrderVersion);
    this.inputFormGroup.get('wovEndDate').patchValue(woEndDate);
  }

  datePickerCallbackOnDoneStartDate() {
    if ( this.workOrder.StatusId === PhxConstants.WorkOrderStatus.Processing) {
      const rootFormGroup: FormGroup<IRoot> = <any>this.getRootFormGroup(this.inputFormGroup);

      if (this.displayWorkOrderStartEndDateState()) {
        rootFormGroup.get('EffectiveDate').patchValue(this.inputFormGroup.get('WorkOrderStartDateState').value || new Date().toDateString());
      } else {
        rootFormGroup.get('EffectiveDate').patchValue(this.inputFormGroup.get('StartDate').value || new Date().toDateString());
      }
    }



    // if (this.inputFormGroup.get('WorkOrderCreationReasonId').value === PhxConstants.WorkOrderCreationReason.New || this.inputFormGroup.get('WorkOrderCreationReasonId').value === PhxConstants.WorkOrderCreationReason.Extend) {
    //   rootFormGroup.get('EffectiveDate').patchValue(this.inputFormGroup.get('StartDate').value || new Date().toDateString());
    // } else if (
    //   this.inputFormGroup.get('WorkOrderCreationReasonId').value === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
    //   this.inputFormGroup.get('WorkOrderCreationReasonId').value === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique
    // ) {
    //   rootFormGroup.get('EffectiveDate').patchValue(this.inputFormGroup.get('WorkOrderStartDateState').value || new Date().toDateString());
    // }
  }

  businessRules(obj?: any) {
    if (obj.name === 'OrganizationIdInternal' && !this.isDialogShown) {
      this.phxDialogComponent.open();
    }
    if (obj.name === 'WorksiteId') {
      // this.onChangeCurrentWorkOrderVersionWorksiteId();
    }
  }

  dialogAction_CallBackObButtonClick(event) {
    this.isDialogShown = !this.isDialogShown;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<ITabCoreDetails> {
    const workorderDetails: ITabCoreDetails = {
      AtsPlacementId: workorder.AtsPlacementId,
      StartDate: workorder.StartDate,
      EndDate: workorder.EndDate,
      LineOfBusinessId: workorder.WorkOrderVersion.LineOfBusinessId,
      InternalOrganizationDefinition1Id: workorder.WorkOrderVersion.InternalOrganizationDefinition1Id,
      InternalOrganizationDefinition2Id: workorder.WorkOrderVersion.InternalOrganizationDefinition2Id,
      InternalOrganizationDefinition3Id: workorder.WorkOrderVersion.InternalOrganizationDefinition3Id,
      InternalOrganizationDefinition4Id: workorder.WorkOrderVersion.InternalOrganizationDefinition4Id,
      InternalOrganizationDefinition5Id: workorder.WorkOrderVersion.InternalOrganizationDefinition5Id,
      WorksiteId: workorder.WorkOrderVersion.WorksiteId,
      OrganizationIdInternal: workorder.OrganizationIdInternal,
      PositionTitleId: workorder.WorkOrderVersion.PositionTitleId,
      TerminationDate: workorder.TerminationDate,
      WorkOrderStartDateState: workorder.WorkOrderVersion.WorkOrderStartDateState,
      WorkOrderCreationReasonId: workorder.WorkOrderVersion.WorkOrderCreationReasonId,
      WorkOrderEndDateState: workorder.WorkOrderVersion.WorkOrderEndDateState,
      wovEndDate: workorder.WorkOrderVersion.wovEndDate
    };

    const formGroup: FormGroup<ITabCoreDetails> = formGroupSetup.formBuilder.group<ITabCoreDetails>({
      AtsPlacementId: [
        workorderDetails.AtsPlacementId
      ],
      StartDate: [workorderDetails.StartDate,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrder', 'StartDate', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('StartDate', CustomFieldErrorType.required))]
      )
      ],
      EndDate: [workorderDetails.EndDate,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrder', 'EndDate', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EndDate', CustomFieldErrorType.required))]
      )
      ],
      LineOfBusinessId: [workorderDetails.LineOfBusinessId,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'LineOfBusinessId', workorder.WorkOrderVersion,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('LineOfBusinessId', CustomFieldErrorType.required))]
      )
      ],
      InternalOrganizationDefinition1Id: [
        workorderDetails.InternalOrganizationDefinition1Id,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'InternalOrganizationDefinition1Id', null,
          [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('InternalOrganizationDefinition1Id', CustomFieldErrorType.required))]
        )
      ],
      InternalOrganizationDefinition2Id: [
        workorderDetails.InternalOrganizationDefinition2Id
      ],
      InternalOrganizationDefinition3Id: [
        workorderDetails.InternalOrganizationDefinition3Id
      ],
      InternalOrganizationDefinition4Id: [
        workorderDetails.InternalOrganizationDefinition4Id
      ],
      InternalOrganizationDefinition5Id: [
        workorderDetails.InternalOrganizationDefinition5Id
      ],
      WorksiteId: [workorderDetails.WorksiteId,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'WorksiteId', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WorksiteId', CustomFieldErrorType.required))]
      )
      ],
      OrganizationIdInternal: [workorderDetails.OrganizationIdInternal,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrder', 'OrganizationIdInternal', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdInternal', CustomFieldErrorType.required))]
      )
      ],
      PositionTitleId: [workorderDetails.PositionTitleId,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'PositionTitleId', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PositionTitleId', CustomFieldErrorType.required))]
      )
      ],
      TerminationDate: [
        workorderDetails.TerminationDate
      ],
      WorkOrderStartDateState: [
        workorderDetails.WorkOrderStartDateState
      ],
      WorkOrderCreationReasonId: [
        workorderDetails.WorkOrderCreationReasonId
      ],
      WorkOrderEndDateState: [
        workorderDetails.WorkOrderEndDateState
      ],
      wovEndDate: [workorderDetails.wovEndDate]
    });
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabCoreDetail: FormGroup<ITabCoreDetails>): IWorkOrder {
    const formGroupCoreDetail: FormGroup<ITabCoreDetails> = formGroupTabCoreDetail;
    const coreDetails: ITabCoreDetails = formGroupCoreDetail.value;
    workOrder.AtsPlacementId = coreDetails.AtsPlacementId;
    workOrder.StartDate = coreDetails.StartDate;
    workOrder.EndDate = coreDetails.EndDate;
    workOrder.WorkOrderVersion.LineOfBusinessId = coreDetails.LineOfBusinessId;
    workOrder.WorkOrderVersion.InternalOrganizationDefinition1Id = coreDetails.InternalOrganizationDefinition1Id;
    workOrder.WorkOrderVersion.InternalOrganizationDefinition2Id = coreDetails.InternalOrganizationDefinition2Id;
    workOrder.WorkOrderVersion.InternalOrganizationDefinition3Id = coreDetails.InternalOrganizationDefinition3Id;
    workOrder.WorkOrderVersion.InternalOrganizationDefinition4Id = coreDetails.InternalOrganizationDefinition4Id;
    workOrder.WorkOrderVersion.InternalOrganizationDefinition5Id = coreDetails.InternalOrganizationDefinition5Id;
    workOrder.WorkOrderVersion.WorksiteId = coreDetails.WorksiteId;
    workOrder.OrganizationIdInternal = coreDetails.OrganizationIdInternal;
    workOrder.WorkOrderVersion.PositionTitleId = coreDetails.PositionTitleId;
    workOrder.TerminationDate = coreDetails.TerminationDate;
    workOrder.WorkOrderVersion.WorkOrderStartDateState = coreDetails.WorkOrderStartDateState;
    workOrder.WorkOrderVersion.WorkOrderCreationReasonId = coreDetails.WorkOrderCreationReasonId;
    workOrder.WorkOrderVersion.WorkOrderEndDateState = coreDetails.WorkOrderEndDateState;
    workOrder.WorkOrderVersion.wovEndDate = moment(coreDetails.wovEndDate).format('YYYY-MM-DD');
    return workOrder;
  }
}
