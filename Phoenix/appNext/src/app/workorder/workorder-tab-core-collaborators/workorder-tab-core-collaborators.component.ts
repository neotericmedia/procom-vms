// Angular
import { Component, OnInit } from '@angular/core';
// Common
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
// Work order
import { ITabCoreCollaborators, IWorkOrder, IFormGroupSetup } from './../state/workorder.interface';
import { WorkOrderBaseComponentPresentational } from './../workorder-base-component-presentational';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';


@Component({
  selector: 'app-workorder-tab-core-collaborators',
  templateUrl: './workorder-tab-core-collaborators.component.html'
})

export class WorkorderTabCoreCollaboratorsComponent extends WorkOrderBaseComponentPresentational<ITabCoreCollaborators> implements OnInit {
  html: {
    lists: {
      userProfileAssignedTo: Array<any>;
    };
  } = {
      lists: {
        userProfileAssignedTo: []
      }
    };

  constructor() {
    super('WorkorderTabCoreCollaboratorsComponent');
  }

  ngOnInit() {
    this.getUserProfileAssignedTo();
  }

  checkPtFiledAccessibility(modelPrefix, fieldName) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName);
  }

  getUserProfileAssignedTo() {
    this.commonListsObservableService.listUserProfileInternal$()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response) {
          this.html.lists.userProfileAssignedTo = response;
        }
      });
  }

  businessRules(obj?: any) { }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<ITabCoreCollaborators> {
    const collaboratorDetails: ITabCoreCollaborators = {
      AssignedToUserProfileId: (workorder.WorkOrderVersion.AssignedToUserProfileId && workorder.WorkOrderVersion.AssignedToUserProfileId !== 1)
        ? workorder.WorkOrderVersion.AssignedToUserProfileId : null
    };

    const formGroup: FormGroup<ITabCoreCollaborators> = formGroupSetup.formBuilder.group<ITabCoreCollaborators>({
      AssignedToUserProfileId: [collaboratorDetails.AssignedToUserProfileId,
      PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'AssignedToUserProfileId', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EndDate', CustomFieldErrorType.required))]
      )
      ]
    });
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabCoreDetail: FormGroup<ITabCoreCollaborators>): IWorkOrder {
    const formGroupCoreCollaborators: FormGroup<ITabCoreCollaborators> = formGroupTabCoreDetail;
    const collaboratorsDetails: ITabCoreCollaborators = formGroupCoreCollaborators.value;
    workOrder.WorkOrderVersion.AssignedToUserProfileId = collaboratorsDetails.AssignedToUserProfileId;
    return workOrder;
  }
}
