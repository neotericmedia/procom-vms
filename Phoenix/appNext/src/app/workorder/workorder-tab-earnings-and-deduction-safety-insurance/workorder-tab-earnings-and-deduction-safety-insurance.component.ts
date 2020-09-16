// Angular
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { find, filter, forEach } from 'lodash';
// Common
import { ValidationExtensions } from '../../common';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType } from '../../common/model';
import { PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
// Work order
import { IWorkOrder, IFormGroupSetup, IWorkplaceSafetyInsurance } from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderService } from './../workorder.service';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';
import { RequiredValidator } from '@angular/forms';

@Component({
  selector: 'app-workorder-tab-earnings-and-deduction-safety-insurance',
  templateUrl: './workorder-tab-earnings-and-deduction-safety-insurance.component.html'
})
export class WorkorderTabEarningsAndDeductionSafetyInsuranceComponent extends WorkOrderBaseComponentPresentational<IWorkplaceSafetyInsurance> implements OnInit {
  isAlive: boolean = true;
  html: {
    commonLists: {
      workOrderWorkLocations: Array<any>;
      OrganizationInternalList: Array<any>;
      wcbCodeList: Array<any>;
    };
  } = {
      commonLists: {
        workOrderWorkLocations: [],
        OrganizationInternalList: [],
        wcbCodeList: []
      }
    };
  workOrder: IWorkOrder;
  oldSubdivisionIdByWorksite: any;
  oldInternalOrgId: any;
  oldWCBDetailId: any;
  phxDialogComponentConfigModel: any;
  static checkEarningvalidate: boolean = false;
  @Output() outputEvent = new EventEmitter<any>();
  @ViewChild('phxDialogComponent')
  phxDialogComponent: any;
  constructor(private workorderObservableService: WorkorderObservableService, private workorderService: WorkorderService) {
    super('WorkorderTabEarningsAndDeductionSafetyInsuranceComponent');
    this.getInternalOrganization();
  }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          this.workOrder = workorder;
        }
      });
    this.html.commonLists.workOrderWorkLocations = this.codeValueService.getCodeValues(this.codeValueGroups.Worksite, true);
  }
  // fix me
  public dialogAction_CallBackObButtonClick(e) { }
  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getInternalOrganization() {
    this.workorderService
      .getListOrganizationInternal()
      .takeWhile(() => this.isAlive)
      .subscribe((response: any) => {
        if (response.length > 0) {
          this.html.commonLists.OrganizationInternalList = response.map((value: any) => {
            return {
              Code: value.Code,
              IsTest: value.IsTest,
              OrganizationIdInternal: value.Id,
              Name: value.DisplayName,
              Id: value.Id
            };
          });
          this.loadWCBCodelist();
        }
      });
  }

  loadWCBCodelist() {
    const worksiteChangedMessage = [];
    if (this.workOrder.OrganizationIdInternal == null && this.phxConstants.ProductionHideFunctionality) {
      return;
    }
    const worksite = find(this.html.commonLists.workOrderWorkLocations, workSite => {
      return workSite.id === this.workOrder.WorkOrderVersion.WorksiteId;
    });
    const subdivisionIdByWorksite = worksite ? worksite.parentId : null;
    const internalOrg = find(this.html.commonLists.OrganizationInternalList, o => {
      return o.Id === this.workOrder.OrganizationIdInternal;
    });
    const organizationIdInternal = internalOrg ? internalOrg.Id : 0;
    if (
      subdivisionIdByWorksite !== null &&
      typeof subdivisionIdByWorksite !== 'undefined' &&
      (this.oldSubdivisionIdByWorksite === null ||
        typeof this.oldSubdivisionIdByWorksite === 'undefined' ||
        this.oldSubdivisionIdByWorksite !== subdivisionIdByWorksite ||
        (this.oldInternalOrgId === null || typeof this.oldInternalOrgId === 'undefined' || this.oldInternalOrgId !== organizationIdInternal))
    ) {
      let notify = false;
      let notifyOrg = false;
      if (
        this.html.commonLists.wcbCodeList !== null &&
        typeof this.html.commonLists.wcbCodeList !== 'undefined' &&
        this.html.commonLists.wcbCodeList.length > 0 &&
        subdivisionIdByWorksite !== null &&
        subdivisionIdByWorksite !== this.oldSubdivisionIdByWorksite
      ) {
        notify = true;
      }
      if (
        this.html.commonLists.wcbCodeList !== null &&
        typeof this.html.commonLists.wcbCodeList !== 'undefined' &&
        typeof this.oldInternalOrgId !== 'undefined' &&
        this.oldInternalOrgId !== null &&
        organizationIdInternal !== this.oldInternalOrgId
      ) {
        notifyOrg = true;
      }
      if (notify) {
        worksiteChangedMessage.push('The Workplace Safety Insurance Worker Classification list has been updated.');
      }
      if (notifyOrg) {
        worksiteChangedMessage.push('The Workplace Safety Insurance Worker Classification list has been updated.');
      }
      this.getWCBCodeList(subdivisionIdByWorksite, organizationIdInternal);

      this.oldSubdivisionIdByWorksite = subdivisionIdByWorksite;
      this.oldInternalOrgId = organizationIdInternal;
    }
    return worksiteChangedMessage;
  }

  getWCBCodeList(subdivisionId, organizationIdInternal) {
    this.workorderService.getWCBCodesBySubdivisionId(subdivisionId, organizationIdInternal).subscribe((response: any) => {
      this.html.commonLists.wcbCodeList = response && response.Items;

      if (this.html.commonLists.wcbCodeList && this.html.commonLists.wcbCodeList.length &&
        this.readOnlyStorage.IsEditable && this.checkPtFiledAccessibility('WorkOrderVersion', 'WorkerCompensationId')) {

        WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.checkEarningvalidate = true;

        if (this.inputFormGroup) {
          this.inputFormGroup.controls['WorkerCompensationId'].setValidators(ValidationExtensions.required('WorkerCompensationId'));
          this.inputFormGroup.controls['WCBIsApplied'].setValidators(ValidationExtensions.required('WCBIsApplied'));
        }
      }

      let contains = false;
      forEach(this.html.commonLists.wcbCodeList, wcbCode => {
        wcbCode.text = wcbCode.WorkerCompensation.Name;
        wcbCode.id = wcbCode.Id;
        if (wcbCode.WorkerCompensationId === this.workOrder.WorkOrderVersion.WorkerCompensationId) {
          contains = true;
        }
      });
      if (!contains) {
        this.inputFormGroup.get('WorkerCompensationId').patchValue(null);
      }
      this.oldWCBDetailId = null;
    });
  }

  onChangeCurrentWorkOrderVersionWCBHeaderId() {
    this.oldWCBDetailId = null;
    this.inputFormGroup.get('WCBIsApplied').patchValue(null);
    this.getWCBIsAppliedDefault('WCB Code');
  }

  getWCBIsAppliedDefault(caller) {
    if (this.inputFormGroup.get('WorkerCompensationId').value == null || this.inputFormGroup.get('WorkerCompensationId').value === (this.oldWCBDetailId || 0) || this.html.commonLists.wcbCodeList.length === 0) {
      return;
    }
    const oldVal = this.inputFormGroup.get('WCBIsApplied').value;

    const currentWCBDetail = find(this.html.commonLists.wcbCodeList, o => {
      return o.WorkerCompensationId === this.inputFormGroup.get('WorkerCompensationId').value;
    });
    const wcbSubdivisionDetailWorkerTypes = filter(currentWCBDetail.WCBSubdivisionDetailWorkerTypeDefault, o => {
      return o.ProfileTypeIdWorker === this.workOrder.workerProfileTypeId;
    });
    this.inputFormGroup.get('WCBIsApplied').patchValue(wcbSubdivisionDetailWorkerTypes.length > 0);

    if (oldVal !== this.inputFormGroup.get('WCBIsApplied').value && oldVal !== null && typeof oldVal !== 'undefined') {
      const message = 'On change of ' + caller + ' the Is WCB Applied has been updated from ' + oldVal + ' to ' + this.inputFormGroup.get('WCBIsApplied').value;
      this.commonService.logWarning(message);
      this.phxDialogComponentConfigModel = {
        HeaderTitle: 'Is WCB Applied has been updated',
        BodyMessage: message,
        Buttons: [
          {
            Id: 1,
            SortOrder: 1,
            CheckValidation: true,
            Name: 'Ok',
            Class: 'btn-primary',
            ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
              this.phxDialogComponent.close();
            }
          }
        ],
        ObjectDate: null,
        ObjectComment: null
      };
      this.phxDialogComponent.open();
    }
    this.oldWCBDetailId = currentWCBDetail.Id;
    return;
  }

  businessRules(obj: any) {
    if (obj.name === 'WorkerCompensationId') {
      this.onChangeCurrentWorkOrderVersionWCBHeaderId();
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<IWorkplaceSafetyInsurance> {
    return formGroupSetup.formBuilder.group<IWorkplaceSafetyInsurance>({
      WorkerCompensationId: [
        workorder.WorkOrderVersion.WorkerCompensationId,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator(
          'WorkOrderVersion',
          'WorkerCompensationId',
          null,
          WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.checkEarningvalidate ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WorkerCompensationId', CustomFieldErrorType.required))] : null
        )
      ],
      WCBIsApplied: [
        workorder.WorkOrderVersion.WCBIsApplied,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator(
          'WorkOrderVersion',
          'WCBIsApplied',
          null,
          WorkorderTabEarningsAndDeductionSafetyInsuranceComponent.checkEarningvalidate ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WCBIsApplied', CustomFieldErrorType.required))] : null
        )
      ]
    });
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupSafetyInsurance: FormGroup<IWorkplaceSafetyInsurance>): IWorkOrder {
    const formGroupSafetyInsuranceValues: IWorkplaceSafetyInsurance = formGroupSafetyInsurance.value;
    workOrder.WorkOrderVersion.WorkerCompensationId = formGroupSafetyInsuranceValues.WorkerCompensationId;
    workOrder.WorkOrderVersion.WCBIsApplied = formGroupSafetyInsuranceValues.WCBIsApplied;
    return workOrder;
  }
}
