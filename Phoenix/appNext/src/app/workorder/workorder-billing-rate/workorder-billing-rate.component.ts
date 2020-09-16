import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IBillingRate, IFormGroupSetup, IAvailableRebates, IReadOnlyStorage, IFormGroupOnNew, IPaymentRate } from '../state';
import { FormArray, FormGroup, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions } from '../../common/components/phx-form-control/validation.extensions';
import { CustomFieldErrorType, CodeValue } from '../../common/model';
import { find, filter, findIndex } from 'lodash';
import { WorkorderService } from '../workorder.service';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-billing-rate',
  templateUrl: './workorder-billing-rate.component.html',
  styleUrls: ['./workorder-billing-rate.component.less']
})
export class WorkorderBillingRateComponent extends WorkOrderBaseComponentPresentational<IBillingRate> implements OnInit {
  @Input() rateIndex: number;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() workOrderRateTypes: Array<CodeValue>;
  @Input() selectedRateType: AbstractControl<any>;
  @Output() removeBillingPartyRate = new EventEmitter<number>();
  @Output() addPaymentPartyRate = new EventEmitter<number>();

  rebates: any;
  vms: any;
  list: Array<any> = [];
  workorderLineOfBusinessId: number;
  billingOraganizationId: number;
  html: {
    parentOrganizationNameFromList: boolean;
    codeValueLists: {
      listCurrency: Array<CodeValue>;
      listRebateTypes: Array<CodeValue>;
      listworkOrderRateTypes: Array<CodeValue>;
      listWorkOrderRateUnits: Array<CodeValue>;
    };
    commonLists: {
      listOrganizationClient: Array<any>;
      listUserProfileClient: Array<any>;
      listavailableRebates: Array<any>;
      listavailableVmsFees: Array<any>;
    };
  } = {
    parentOrganizationNameFromList: false,
    codeValueLists: {
      listCurrency: [],
      listRebateTypes: [],
      listworkOrderRateTypes: [],
      listWorkOrderRateUnits: []
    },
    commonLists: {
      listOrganizationClient: [],
      listUserProfileClient: [],
      listavailableRebates: [],
      listavailableVmsFees: []
    }
  };

  constructor(private workorderService: WorkorderService, private workorderObservableService: WorkorderObservableService) {
    super('WorkorderBillingRateComponent');
    this.getCodeValuelistsStatic();
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  businessRules(obj: IFormGroupValue): void {}

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCurrency = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.html.codeValueLists.listRebateTypes = this.codeValueService.getCodeValues(this.codeValueGroups.RebateType, true);
    this.html.codeValueLists.listworkOrderRateTypes = this.codeValueService.getCodeValues(this.codeValueGroups.RateType, true);
    this.html.codeValueLists.listworkOrderRateTypes.splice(5, 1);
    this.html.codeValueLists.listworkOrderRateTypes.splice(4, 1);
    this.html.codeValueLists.listWorkOrderRateUnits = this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true);
  }

  floatApplyTwoDecimalPlaces(value: string) {
    if (isNaN(Number(value)) || value === null) {
      return null;
    }
    const key = parseFloat(value).toFixed(2);
    return key;
  }

  recalcAccessActions() {}

  recalcLocalProperties() {}

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

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, billingRate: Array<IBillingRate>): FormArray<IBillingRate> {
    const frt = formGroupSetup.formBuilder.array<IBillingRate>(
      billingRate.map(
        (rate: IBillingRate, index) =>
          formGroupSetup.formBuilder.group<IBillingRate>({
            BillingInfoId: [rate.BillingInfoId],
            Id: [rate.Id],
            IsDraft: [rate.IsDraft],
            Rate: [
              rate.Rate,
              PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingRate', 'Rate', rate, [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))
              ])
            ],
            RateTypeId: [rate.RateTypeId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateTypeId', CustomFieldErrorType.required))]],
            RateUnitId: [
              rate.RateUnitId,
              PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.BillingInfoes.BillingRate', 'RateUnitId', rate, [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateUnitId', CustomFieldErrorType.required))
              ])
            ],
            SourceId: [rate.SourceId]
          })
        // )
      )
    );
    return frt;
  }

  public static formBuilderGroupAddNewRate(formGroupOnNew: IFormGroupOnNew): FormGroup<IBillingRate> {
    const newForm = formGroupOnNew.formBuilder.group<IBillingRate>({
      BillingInfoId: [0],
      Id: [0],
      IsDraft: [null],
      Rate: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))]],
      RateTypeId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('RateTypeId', CustomFieldErrorType.required))]],
      RateUnitId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('RateUnitId', CustomFieldErrorType.required))]],
      SourceId: [null]
    });
    return newForm;
  }

  onRateTypeValueChanged(e) {
    const rateTypeId = e ? e.value : null;
    if (rateTypeId !== null) {
      this.addPaymentPartyRate.emit(rateTypeId);
    }
  }

  onRemoveBillingPartyRate() {
    this.removeBillingPartyRate.emit(this.rateIndex);
  }
}
