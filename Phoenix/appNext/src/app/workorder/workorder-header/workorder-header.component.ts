import { IWorkOrder } from './../state/workorder.interface';
// angular
import { Component, Input } from '@angular/core';
// common
import { CommonService } from '../../common/services/common.service';
import { PhxConstants, CodeValueService } from '../../common';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
// workorder
import { WorkorderService } from './../workorder.service';
import { CommonListsObservableService } from '../../common/lists/lists.observable.service';

@Component({
  selector: 'app-workorder-header',
  templateUrl: './workorder-header.component.html'
})

export class WorkorderHeaderComponent extends BaseComponentOnDestroy {
  @Input()
  workOrder: IWorkOrder;
  html: {
    codeValueGroups: any;
    phxConstants: any;
    lists: {
      listOrganizationClient: Array<any>;
      workOrderStatuses: Array<any>;
      listUserProfileWorker: Array<any>;
      profileTypeList: Array<any>;
    };
  } = {
    codeValueGroups: this.commonService.CodeValueGroups,
    phxConstants: {},
    lists: {
      listOrganizationClient: [],
      workOrderStatuses: [],
      listUserProfileWorker: [],
      profileTypeList: []
    }
  };

  constructor(
      private commonService: CommonService,
      private workorderService: WorkorderService,
      private codeValueService: CodeValueService,
      private commonListsObservableService: CommonListsObservableService) {
    super();
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.html.lists.workOrderStatuses = this.codeValueService.getCodeValues(this.html.codeValueGroups.WorkOrderStatus, true);
    this.html.lists.profileTypeList = this.codeValueService.getCodeValues(this.html.codeValueGroups.ProfileType, true);
    this.html.phxConstants = PhxConstants;
    this.getListOrganizationClient();
    this.getListUserProfileWorker();
  }

  getListOrganizationClient() {
    this.workorderService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole()
    .takeUntil(this.isDestroyed$)
    .subscribe((OrganizationClient: any) => {
      this.html.lists.listOrganizationClient = OrganizationClient.Items;
    });
  }

  getListUserProfileWorker() {
    this.commonListsObservableService.listUserProfileWorkers$()
    .takeUntil(this.isDestroyed$)
    .subscribe((listUserProfileWorker: any) => {
      if (listUserProfileWorker) {
        this.html.lists.listUserProfileWorker = listUserProfileWorker;
      }
    });
  }
}
