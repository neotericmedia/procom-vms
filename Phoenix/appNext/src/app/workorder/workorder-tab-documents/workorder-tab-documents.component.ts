import { CommonListsObservableService } from './../../common/lists/lists.observable.service';
import { Component, OnInit } from '@angular/core';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { IWorkOrder } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { AccessAction } from '../../common/model';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { PhxConstants } from '../../common';

@Component({
  selector: 'app-workorder-tab-documents',
  templateUrl: './workorder-tab-documents.component.html'
})
export class WorkorderTabDocumentsComponent extends BaseComponentOnDestroy implements OnInit {
 
  html: {
    phxConstants: typeof PhxConstants;
    rootModel: IWorkOrder;
    lists: {
      listUserProfileWorker: Array<any>;
    };
  } = {
    phxConstants: null,
    rootModel: null,
    lists: {
      listUserProfileWorker: []
    }
  };

 

  constructor(private workOrderObservableService: WorkorderObservableService, private commonListsObservableService: CommonListsObservableService) {
    super();
    this.commonListsObservableService
      .listUserProfileWorkers$()
      .takeUntil(this.isDestroyed$)
      .subscribe((listUserProfileWorker: any) => {
        if (listUserProfileWorker) {
          this.html.lists.listUserProfileWorker = listUserProfileWorker;
        }
      });
  }

  ngOnInit() {
    this.html.phxConstants = PhxConstants;
    this.workOrderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(w => {
        this.html.rootModel = w;
      });
  }

  public get documentsRefLink() {
    const workOrderId = this.html.rootModel.AssignmentId;
    const assignmentId = this.html.rootModel.AssignmentId;
    const currentWOId = this.html.rootModel.WorkOrderVersion.Id;
    return `#/workorder/${workOrderId}/${assignmentId}/${currentWOId}`;
  }

  onComplianceDocumentOutput($event) {}

  businessRules(obj: IFormGroupValue): void {}

  onOutputEvent() {
    this.outputEvent.emit();
  }

  recalcLocalProperties(role: FormGroup<IWorkOrder>) {}

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {}
}
