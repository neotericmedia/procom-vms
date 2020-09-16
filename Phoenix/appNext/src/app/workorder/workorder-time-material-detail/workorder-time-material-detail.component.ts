import { Component, AfterContentInit, OnInit } from '@angular/core';
import { CodeValue, CustomFieldErrorType } from '../../common/model';
import { ValidationExtensions, PhxConstants } from '../../common';
import { ITabTimeMaterialInvoiceDetail, ITimeSheetApprover, IFormGroupSetup, IFormGroupOnNew, IWorkOrder } from '../state';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';
import { WorkorderService } from '../workorder.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

interface IHtml {
  codeValueLists: {
    listTimesheetMethodologies: Array<CodeValue>;
    listTimesheetCycles: Array<CodeValue>;
    listTimeSheetApprovalFlows: Array<CodeValue>;
  };
  timeCard: {
    timeCardApproval: boolean;
    timeCardCycle: boolean;
    projectsAndCoding: boolean;
    configurationAndDescriptors: boolean;
    thirdPartyWorkerID: boolean;
    displayEstimatedInvoiceAmount: boolean;
    displayEstimatedPaymentAmount: boolean;
    timecardDescription: boolean;
  };
  commonLists: {
    listProfilesForApproval: Array<any>;
  };
}

@Component({
  selector: 'app-workorder-time-material-detail',
  templateUrl: './workorder-time-material-detail.component.html',
  styleUrls: ['./workorder-time-material-detail.component.less']
})
export class WorkorderTimeMaterialDetailComponent extends WorkOrderBaseComponentPresentational<ITabTimeMaterialInvoiceDetail> implements OnInit, AfterContentInit {
  html: IHtml = {
    codeValueLists: {
      listTimesheetMethodologies: [],
      listTimesheetCycles: [],
      listTimeSheetApprovalFlows: []
    },
    timeCard: {
      timeCardApproval: false,
      timeCardCycle: false,
      projectsAndCoding: false,
      configurationAndDescriptors: false,
      thirdPartyWorkerID: false,
      displayEstimatedInvoiceAmount: false,
      displayEstimatedPaymentAmount: false,
      timecardDescription: false
    },
    commonLists: {
      listProfilesForApproval: []
    }
  };

  formGroupSetup: IFormGroupSetup;
  codeValueGroups: any;

  constructor(private workOrderService: WorkorderService) {
    super('WorkorderTimeMaterialDetailComponent');
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.getCodeValuelistsStatic();
  }

  businessRules() {}

  ngOnInit() {
    const orgId = this.inputFormGroup.controls.OrganizationIdClient.value ? this.inputFormGroup.controls.OrganizationIdClient.value : null;
    if (orgId) {
      this.workOrderService.getProfilesListOrganizationalByUserProfileType(orgId, this.phxConstants.ProfileType.Organizational).subscribe((response: any) => {
        this.html.commonLists.listProfilesForApproval = response.Items;
        this.html.commonLists.listProfilesForApproval.forEach(element => {
          element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
        });
      });
    }
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  ngAfterContentInit() {
    this.onChangeTimeSheetMethodology();
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listTimesheetMethodologies = this.codeValueService.getCodeValues(this.codeValueGroups.TimeSheetMethodology, true);
    this.html.codeValueLists.listTimesheetCycles = this.codeValueService.getCodeValues(this.codeValueGroups.TimeSheetCycle, true);
    this.html.codeValueLists.listTimeSheetApprovalFlows = this.codeValueService.getCodeValues(this.codeValueGroups.TimeSheetApprovalFlow, true);
  }

  onChangeTimeSheetMethodology(e = null) {
    this.html.timeCard.timeCardApproval = this.inputFormGroup.controls.TimeSheetMethodologyId.value && this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.OnlineApproval;
    this.html.timeCard.timeCardCycle = !(!this.inputFormGroup.controls.TimeSheetMethodologyId.value || this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.NoTimesheet);
    this.html.timeCard.projectsAndCoding =
      this.inputFormGroup.controls.TimeSheetMethodologyId.value &&
      (this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.OnlineApproval || this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.OfflineApproval);
    this.html.timeCard.configurationAndDescriptors = this.inputFormGroup.controls.TimeSheetMethodologyId.value && this.inputFormGroup.controls.TimeSheetMethodologyId.value !== PhxConstants.TimeSheetMethodology.NoTimesheet;
    this.html.timeCard.thirdPartyWorkerID = this.inputFormGroup.controls.TimeSheetMethodologyId.value && this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.ThirdPartyImport;
    this.html.timeCard.displayEstimatedInvoiceAmount = this.inputFormGroup.controls.TimeSheetMethodologyId.value && this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.OnlineApproval;
    this.html.timeCard.displayEstimatedPaymentAmount = this.inputFormGroup.controls.TimeSheetMethodologyId.value && this.inputFormGroup.controls.TimeSheetMethodologyId.value !== PhxConstants.TimeSheetMethodology.NoTimesheet;
    this.html.timeCard.timecardDescription =
      this.inputFormGroup.controls.TimeSheetMethodologyId.value &&
      (this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.OnlineApproval || this.inputFormGroup.controls.TimeSheetMethodologyId.value === PhxConstants.TimeSheetMethodology.OfflineApproval);
  }

  trackByFn(index: number) {
    return index;
  }

  addTimeSheetApproverDefinition() {
    const formArrayTimeSheetApprover: FormArray<ITimeSheetApprover> = <FormArray<ITimeSheetApprover>>this.inputFormGroup.controls.TimeSheetApprovers;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayTimeSheetApprover.push(WorkorderTimeMaterialDetailComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayTimeSheetApprover.length + 1));
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, sequence: number): FormGroup<ITimeSheetApprover> {
    return formGroupOnNew.formBuilder.group<ITimeSheetApprover>({
      Id: 0,
      IsDraft: true,
      MustApprove: true,
      Sequence: sequence,
      SourceId: null,
      UserProfileId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))]],
      WorkOrderVersion: null,
      WorkOrderVersionId: 0
    });
  }

  removeTimeSheetApproverDefinition(index: number) {
    const formArrayTimeSheetApprovers: FormArray<ITimeSheetApprover> = <FormArray<ITimeSheetApprover>>this.inputFormGroup.controls.TimeSheetApprovers;
    formArrayTimeSheetApprovers.removeAt(index);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, timeMaterialDetail: ITabTimeMaterialInvoiceDetail, validations: any): FormGroup<ITabTimeMaterialInvoiceDetail> {
    return formGroupSetup.formBuilder.group<ITabTimeMaterialInvoiceDetail>({
      TimeSheetMethodologyId: [
        timeMaterialDetail.TimeSheetMethodologyId,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'TimeSheetMethodologyId', null, [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('TimeSheetMethodologyId', CustomFieldErrorType.required))
        ])
      ],
      TimeSheetCycleId: [
        timeMaterialDetail.TimeSheetCycleId,
        validations.isTimeSheetCycleId
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'TimeSheetCycleId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('TimeSheetCycleId', CustomFieldErrorType.required))
            ])
          : null
      ],
      TimeSheetApprovalFlowId: [
        timeMaterialDetail.TimeSheetApprovalFlowId,
        validations.isTimeSheetApprovalFlowId
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'TimeSheetApprovalFlowId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('TimeSheetApprovalFlowId', CustomFieldErrorType.required))
            ])
          : null
      ],
      TimeSheetApprovers: WorkorderTimeMaterialDetailComponent.formGroupTimeSheetApprovers(formGroupSetup, timeMaterialDetail.TimeSheetApprovers, validations.isTimeSheetApprovers),
      IsTimeSheetUsesProjects: [
        timeMaterialDetail.IsTimeSheetUsesProjects,
        validations.isTimeSheetUsesProjects
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'IsTimeSheetUsesProjects', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsTimeSheetUsesProjects', CustomFieldErrorType.required))
            ])
          : null
      ],
      VmsWorkOrderReference: [
        timeMaterialDetail.VmsWorkOrderReference,
        validations.isVmsWorkOrderReference
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'VmsWorkOrderReference', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('VmsWorkOrderReference', CustomFieldErrorType.required))
            ])
          : null
      ],
      IsDisplayEstimatedInvoiceAmount: [
        timeMaterialDetail.IsDisplayEstimatedInvoiceAmount,
        validations.isDisplayEstimatedInvoiceAmount
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'IsDisplayEstimatedInvoiceAmount', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsDisplayEstimatedInvoiceAmount', CustomFieldErrorType.required))
            ])
          : null
      ],
      IsDisplayEstimatedPaymentAmount: [
        timeMaterialDetail.IsDisplayEstimatedPaymentAmount,
        validations.isDisplayEstimatedPaymentAmount
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'IsDisplayEstimatedPaymentAmount', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsDisplayEstimatedPaymentAmount', CustomFieldErrorType.required))
            ])
          : null
      ],
      TimeSheetDescription: [timeMaterialDetail.TimeSheetDescription],
      OrganizationIdClient: [timeMaterialDetail.OrganizationIdClient]
    });
  }

  public static formGroupTimeSheetApprovers(formGroupSetup: IFormGroupSetup, timesheetApprovers: Array<ITimeSheetApprover> = [], isApproverValid: boolean) {
    if (!timesheetApprovers || timesheetApprovers.length === 0) {
      timesheetApprovers = !timesheetApprovers ? [] : timesheetApprovers;
      const timeSheetApprover: ITimeSheetApprover = {
        Id: 0,
        IsDraft: true,
        MustApprove: true,
        Sequence: 1,
        SourceId: null,
        UserProfileId: null,
        WorkOrderVersionId: 0
      };
      timesheetApprovers.push(timeSheetApprover);
    }

    return formGroupSetup.formBuilder.array<ITimeSheetApprover>(
      timesheetApprovers
        .sort((a1: ITimeSheetApprover, a2: ITimeSheetApprover) => a1.Sequence - a2.Sequence)
        .map((approver: ITimeSheetApprover) =>
          formGroupSetup.formBuilder.group<ITimeSheetApprover>({
            Id: [approver.Id],
            IsDraft: [approver.IsDraft],
            MustApprove: [approver.MustApprove],
            Sequence: [approver.Sequence],
            SourceId: [approver.SourceId],
            UserProfileId: [
              approver.UserProfileId,
              isApproverValid
                ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.TimeSheetApprovers', 'UserProfileId', null, [
                    ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))
                  ])
                : null
            ],
            WorkOrderVersion: [approver.WorkOrderVersion],
            WorkOrderVersionId: [approver.WorkOrderVersionId]
          })
        )
    );
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabTimeMaterialInvoiceDetail: FormGroup<ITabTimeMaterialInvoiceDetail>): IWorkOrder {
    const formGroupTimeMaterialInvoiceDetail: FormGroup<ITabTimeMaterialInvoiceDetail> = formGroupTabTimeMaterialInvoiceDetail;
    const timeMaterialInvoiceDetails: ITabTimeMaterialInvoiceDetail = formGroupTimeMaterialInvoiceDetail.value;

    workOrder.WorkOrderVersion.TimeSheetMethodologyId = timeMaterialInvoiceDetails.TimeSheetMethodologyId;
    workOrder.WorkOrderVersion.TimeSheetCycleId =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId && timeMaterialInvoiceDetails.TimeSheetMethodologyId !== PhxConstants.TimeSheetMethodology.NoTimesheet ? timeMaterialInvoiceDetails.TimeSheetCycleId : null;
    workOrder.WorkOrderVersion.TimeSheetApprovalFlowId =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval
        ? timeMaterialInvoiceDetails.TimeSheetApprovalFlowId
          ? timeMaterialInvoiceDetails.TimeSheetApprovalFlowId
          : PhxConstants.TimeSheetApprovalFlow.Sequential
        : null;
    workOrder.WorkOrderVersion.TimeSheetApprovers =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId && timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval ? timeMaterialInvoiceDetails.TimeSheetApprovers : null;
    workOrder.WorkOrderVersion.IsTimeSheetUsesProjects =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval || timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval
        ? timeMaterialInvoiceDetails.IsTimeSheetUsesProjects
        : null;
    workOrder.WorkOrderVersion.VmsWorkOrderReference =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId && timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.ThirdPartyImport ? timeMaterialInvoiceDetails.VmsWorkOrderReference : null;
    workOrder.WorkOrderVersion.IsDisplayEstimatedInvoiceAmount =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId && timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval ? timeMaterialInvoiceDetails.IsDisplayEstimatedInvoiceAmount : null;
    workOrder.WorkOrderVersion.IsDisplayEstimatedPaymentAmount =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId && timeMaterialInvoiceDetails.TimeSheetMethodologyId !== PhxConstants.TimeSheetMethodology.NoTimesheet ? timeMaterialInvoiceDetails.IsDisplayEstimatedPaymentAmount : null;
    workOrder.WorkOrderVersion.TimeSheetDescription =
      timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval || timeMaterialInvoiceDetails.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval
        ? timeMaterialInvoiceDetails.TimeSheetDescription
        : null;
    return workOrder;
  }
}
