// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// Common
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants } from '../../common';
// Work order
import { ICoreTabRoot, IReadOnlyStorage, IRoot, IWorkOrder, ITabCoreDetails, ITabCoreCollaborators, IFormGroupSetup, ITabCoreCommissions } from './../state/index';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkorderTabCoreDetailsComponent } from './../workorder-tab-core-details/workorder-tab-core-details.component';
import { WorkorderTabCoreCollaboratorsComponent } from './../workorder-tab-core-collaborators/workorder-tab-core-collaborators.component';
import { WorkorderTabCoreCommissionComponent } from './../workorder-tab-core-commission/workorder-tab-core-commission.component';

@Component({
  selector: 'app-workorder-tab-core',
  templateUrl: './workorder-tab-core.component.html',
  styleUrls: ['./workorder-tab-core.component.less']
})

export class WorkorderTabCoreComponent implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ICoreTabRoot>;
  @Output() outputEvent = new EventEmitter<any>();
  phxConstants: any;
  constructor() { }

  ngOnInit() {
    this.phxConstants = PhxConstants;
  }

  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    workorder: any
  ): FormGroup<ICoreTabRoot> {
    const formGroup: FormGroup<ICoreTabRoot> = formGroupSetup.formBuilder.group<ICoreTabRoot>({
      Id: [workorder.Id],
      Details: WorkorderTabCoreDetailsComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      Commissions: WorkorderTabCoreCommissionComponent.formBuilderGroupSetup(formGroupSetup, workorder),
      Collaborators: WorkorderTabCoreCollaboratorsComponent.formBuilderGroupSetup(formGroupSetup, workorder),
    });

    return formGroup;
  }

  onOutputEvent(event) {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupRoot: FormGroup<IRoot>): IWorkOrder {
    const formGroupTabCore: FormGroup<ICoreTabRoot> = <FormGroup<ICoreTabRoot>>formGroupRoot.controls.TabCore;
    workOrder = WorkorderTabCoreDetailsComponent.formGroupToPartial(workOrder, <FormGroup<ITabCoreDetails>>formGroupTabCore.controls.Details);
    workOrder = WorkorderTabCoreCollaboratorsComponent.formGroupToPartial(workOrder, <FormGroup<ITabCoreCollaborators>>formGroupTabCore.controls.Collaborators);
    workOrder = WorkorderTabCoreCommissionComponent.formGroupToPartial(workOrder, <FormGroup<ITabCoreCommissions>>formGroupTabCore.controls.Commissions);
    return workOrder;
  }
}
