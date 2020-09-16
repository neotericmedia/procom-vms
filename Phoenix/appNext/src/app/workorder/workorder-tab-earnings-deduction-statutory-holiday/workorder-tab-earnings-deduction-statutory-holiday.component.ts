// Angular
import { Component, OnInit } from '@angular/core';
// Common
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
// Work order
import { IWorkOrder, IFormGroupSetup, IStatutoryHoliday } from './../state/index';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';

@Component({
  selector: 'app-workorder-tab-earnings-deduction-statutory-holiday',
  templateUrl: './workorder-tab-earnings-deduction-statutory-holiday.component.html'
})
export class WorkorderTabEarningsAndDeductionStatutoryHolidayComponent extends WorkOrderBaseComponentPresentational<IStatutoryHoliday> implements OnInit {
  
  constructor() {
    super('WorkorderTabEarningsAndDeductionOtherEarningsComponent');
  }

  ngOnInit() {}

  businessRules(obj: any) {}

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null ) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<IStatutoryHoliday> {
    return formGroupSetup.formBuilder.group<IStatutoryHoliday>({
      ApplyFlatStatPay: [workorder.WorkOrderVersion.ApplyFlatStatPay]
    });
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupStatutoryHoliday: FormGroup<IStatutoryHoliday>): IWorkOrder {
    const formGrouppStatutoryHolidayValues: IStatutoryHoliday = formGroupStatutoryHoliday.value;
    workOrder.WorkOrderVersion.ApplyFlatStatPay = formGrouppStatutoryHolidayValues.ApplyFlatStatPay;
    return workOrder;
  }
}
