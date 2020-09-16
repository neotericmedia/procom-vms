import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { IRebateAndVMSFee, IFormGroupSetup, IAvailableRebates, IWorkOrder, IReadOnlyStorage } from '../state';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CodeValue, CustomFieldErrorType } from '../../common/model';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { WorkorderService } from '../workorder.service';
import { find, filter } from 'lodash';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ValidationExtensions } from '../../common';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-rebate-vmsfee',
  templateUrl: './workorder-rebate-vmsfee.component.html',
  styleUrls: ['./workorder-rebate-vmsfee.component.less']
})
export class WorkorderRebateVmsfeeComponent extends WorkOrderBaseComponentPresentational<IRebateAndVMSFee> implements OnInit {
  @Input() inputFormGroup: FormGroup<IRebateAndVMSFee>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() removeRate = new EventEmitter<any>();

  rebates: any;
  vms: any;
  list: Array<any> = [];
  workorderLineOfBusinessId: number;
  billingOraganizationId: number;
  html: {
    codeValueLists: {
      listRebateTypes: Array<CodeValue>;
    };
    commonLists: {
      listavailableRebates: Array<any>;
      listavailableVmsFees: Array<any>;
    };
  } = {
    codeValueLists: {
      listRebateTypes: []
    },
    commonLists: {
      listavailableRebates: [],
      listavailableVmsFees: []
    }
  };
  constructor(private workorderService: WorkorderService, private workorderObservableService: WorkorderObservableService) {
    super('WorkorderRebateVmsfeeComponent');
    this.getCodeValuelistsStatic();
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<IRebateAndVMSFee> = null;
    switch (obj.name) {
      case 'RebateHeaderId':
        {
          if (!obj.val) {
            value = {
              RebateHeaderId: null,
              RebateTypeId: null,
              RebateRate: null
            };
          }
        }
        break;

      case 'HasRebate':
        {
          value = {
            RebateHeaderId: null,
            RebateTypeId: null,
            RebateRate: null
          };
          this.html.commonLists.listavailableVmsFees = [];
        }
        break;
      case 'HasVmsFee':
        {
          value = {
            VmsFeeHeaderId: null,
            VmsFeeTypeId: null,
            VmsFeeRate: null
          };
        }
        break;
      case 'VmsFeeTypeId':
        {
          value = {
            VmsFeeRate: null
          };
        }
        break;
      case 'VmsFeeHeaderId': {
        value = {
          VmsFeeTypeId: null,
          VmsFeeRate: null
        };
      }
    }
    if (value) {
      this.patchValue(this.inputFormGroup, value);
    }
  }

  recalcLocalProperties() {}

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listRebateTypes = this.codeValueService.getCodeValues(this.codeValueGroups.RebateType, true);
  }

  ngOnInit() {
    this.workorderObservableService
      .workorderOnRouteChange$(this, true)
      .takeUntil(this.isDestroyed$)
      .subscribe(workorder => {
        const wov = workorder ? workorder.WorkOrderVersion : null;
        const lob = wov ? wov.LineOfBusinessId : null;
        const billingInfo = wov && wov.BillingInfoes && wov.BillingInfoes.length ? wov.BillingInfoes[0] : null;
        const organizationId = billingInfo ? billingInfo.OrganizationIdClient : null;
        if (lob && organizationId && lob !== this.workorderLineOfBusinessId && organizationId !== this.billingOraganizationId) {
          this.workorderService.getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId).subscribe(val => {
            this.rebates = val.Rebates;
            this.vms = val.VmsFees;
            if (this.rebates) {
              this.html.commonLists.listavailableRebates = [];
              this.rebates.Headers.forEach(header => {
                header.Versions.forEach(version => {
                  const item = {} as IAvailableRebates;
                  item.description = header.Description;
                  item.headerId = header.Id;
                  item.lineOfBusinessId = version.LineOfBusinessId;
                  item.rate = version.Rate;
                  item.rebateTypeId = version.RebateTypeId;
                  item.type = this.rebates.type;
                  item.versionId = version.Id;
                  this.html.commonLists.listavailableRebates.push(item);
                  this.html.commonLists.listavailableRebates = filter(this.html.commonLists.listavailableRebates, ['lineOfBusinessId', lob]);
                });
              });
            }
            if (this.vms) {
              this.html.commonLists.listavailableVmsFees = [];
              this.vms.Headers.forEach(header => {
                header.Versions.forEach(version => {
                  const item = {} as IAvailableRebates;
                  item.description = header.Description;
                  item.headerId = header.Id;
                  item.lineOfBusinessId = version.LineOfBusinessId;
                  item.rate = version.Rate;
                  item.rebateTypeId = version.RebateTypeId;
                  item.type = this.vms.type;
                  item.versionId = version.Id;
                  this.html.commonLists.listavailableVmsFees.push(item);
                  this.html.commonLists.listavailableVmsFees = filter(this.html.commonLists.listavailableVmsFees, ['lineOfBusinessId', lob]);
                });
              });
            }
          });
        }
        this.workorderLineOfBusinessId = lob;
        this.billingOraganizationId = organizationId;
      });
  }

  getRebateType(list: any, rebateHeaderId: number) {
    if (list.length && rebateHeaderId) {
      const item = this.getRebateOrVmsFee(list, rebateHeaderId);
      const rebateTypeId = item.rebateTypeId;
      const rebateType = find(this.html.codeValueLists.listRebateTypes, ['id', rebateTypeId]);
      return rebateType.text;
    }
  }

  getRebateOrVmsFeeRate(list: any, rebateHeaderId: number) {
    if (list.length && rebateHeaderId) {
      const item = this.getRebateOrVmsFee(list, rebateHeaderId);
      return item && this.displayRate(item);
    }
  }

  getRebateOrVmsFee(list: any, rebateHeaderId: number) {
    let item: any;
    if (list.length && rebateHeaderId) {
      item = find(list, ['headerId', rebateHeaderId]);
    }
    return item;
  }

  displayRate(item) {
    return item.rebateTypeId === this.phxConstants.RebateType.Amount ? '$' + item.rate : item.rebateTypeId === this.phxConstants.RebateType.Percentage ? item.rate + '%' : null;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, rebateVms: IRebateAndVMSFee): FormGroup<IRebateAndVMSFee> {
    const formGroup = formGroupSetup.formBuilder.group<IRebateAndVMSFee>({
      HasRebate: rebateVms.HasRebate,
      RebateHeaderId: rebateVms.RebateHeaderId,
      RebateTypeId: [
        rebateVms.RebateTypeId,
        !rebateVms.RebateHeaderId && rebateVms.HasRebate
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'RebateTypeId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RebateTypeId', CustomFieldErrorType.required))
            ])
          : null
      ],
      RebateRate: [
        rebateVms.RebateRate,
        !rebateVms.RebateHeaderId && rebateVms.HasRebate
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'RebateTypeId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RebateRate', CustomFieldErrorType.required))
            ])
          : null
      ],
      VmsFeeHeaderId: rebateVms.VmsFeeHeaderId,
      HasVmsFee: rebateVms.HasVmsFee,
      VmsFeeTypeId: [
        rebateVms.VmsFeeTypeId,
        !rebateVms.VmsFeeHeaderId && rebateVms.HasVmsFee
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'RebateTypeId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('VmsFeeTypeId', CustomFieldErrorType.required))
            ])
          : null
      ],
      VmsFeeRate: [
        rebateVms.VmsFeeRate,
        !rebateVms.VmsFeeHeaderId && rebateVms.HasVmsFee
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'RebateTypeId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('VmsFeeRate', CustomFieldErrorType.required))
            ])
          : null
      ]
    });
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupRebateVmsFeeDetails: FormGroup<IRebateAndVMSFee>): IWorkOrder {
    const formGroupRebateVmsFee: FormGroup<IRebateAndVMSFee> = formGroupRebateVmsFeeDetails;
    const vmsFeeDetails: IRebateAndVMSFee = formGroupRebateVmsFee.value;
    workOrder.WorkOrderVersion.HasRebate = vmsFeeDetails.HasRebate;
    workOrder.WorkOrderVersion.HasVmsFee = vmsFeeDetails.HasVmsFee;
    workOrder.WorkOrderVersion.RebateHeaderId = vmsFeeDetails.RebateHeaderId;
    workOrder.WorkOrderVersion.RebateTypeId = vmsFeeDetails.RebateTypeId;
    workOrder.WorkOrderVersion.VmsFeeHeaderId = vmsFeeDetails.VmsFeeHeaderId;
    workOrder.WorkOrderVersion.VmsFeeRate = vmsFeeDetails.VmsFeeRate;
    workOrder.WorkOrderVersion.VmsFeeTypeId = vmsFeeDetails.VmsFeeTypeId;
    workOrder.WorkOrderVersion.RebateRate = vmsFeeDetails.RebateRate;
    return workOrder;
  }
}
