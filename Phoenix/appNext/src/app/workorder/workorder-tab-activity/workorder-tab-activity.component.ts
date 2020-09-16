import { WorkorderService } from './../workorder.service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { PhxConstants } from '../../common';
import { IWorkorderRouterState, IWorkOrder } from './../state/workorder.interface';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { IRouterState, getRouterState } from '../../common/state/router/reducer';
import { Observable } from 'rxjs/Observable';
import { NavigationBarItem } from '../../common/model';
import { ComplianceTemplateService, ComplianceTemplate } from '../../compliance/shared';
import { PhxNoteHeaderComponent } from '../../common/components/phx-note-header/phx-note-header.component';

@Component({
  selector: 'app-workorder-tab-activity',
  templateUrl: './workorder-tab-activity.component.html',
  styleUrls: ['./workorder-tab-activity.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class WorkorderTabActivityComponent extends BaseComponentActionContainer implements OnInit {
  public routerState: IWorkorderRouterState = null;
  public routerParams: any;

  isAlive: boolean = true;
  @ViewChild(PhxNoteHeaderComponent) notesHeader: PhxNoteHeaderComponent;

  html: {
    navigationBarContent: Array<NavigationBarItem>;
    phxConstants: typeof PhxConstants;
    entityTypeId: number;
    entityId: number;
    changeHistoryBlackList: any[];
    cultureId: number;
    template: ComplianceTemplate;
    versionsOrdered: any[];
  } = {
      navigationBarContent: [],
      phxConstants: PhxConstants,
      entityTypeId: 0,
      entityId: 0,
      changeHistoryBlackList: [],
      cultureId: 48,
      template: null,
      versionsOrdered: []
    };

  constructor(
    private workorderObservableService: WorkorderObservableService,
    private activatedRoute: ActivatedRoute,
    private complianceTemplateService: ComplianceTemplateService,
    private router: Router,
    private workOrderService: WorkorderService
  ) {
    super();
  }

  ngOnInit(): void {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        console.log(this.constructor.name + '.routerStateResult.location: ' + routerStateResult.location);
        if (routerStateResult.location.includes(PhxConstants.WorkorderNavigationName.notes)) {
          this.setRouterState(routerStateResult, PhxConstants.WorkorderNavigationName.notes);
        } else if (routerStateResult.location.includes(PhxConstants.WorkorderNavigationName.documents)) {
          this.setRouterState(routerStateResult, PhxConstants.WorkorderNavigationName.documents);
        } else if (routerStateResult.location.includes(PhxConstants.WorkorderNavigationName.history)) {
          this.setRouterState(routerStateResult, PhxConstants.WorkorderNavigationName.history);
        } else if (routerStateResult.location.includes(PhxConstants.WorkorderNavigationName.transaction)) {
          this.setRouterState(routerStateResult, PhxConstants.WorkorderNavigationName.transaction);
        } else if (routerStateResult.location.includes(PhxConstants.WorkorderNavigationName.workflow)) {
          this.setRouterState(routerStateResult, PhxConstants.WorkorderNavigationName.workflow);
        }

        this.routerParams = routerStateResult.params;
        return this.routerParams.versionId ? this.workorderObservableService.workorder$(this, this.routerParams, false) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        this.activatedRoute.params.subscribe(x => {
          if (x.tabId === PhxConstants.WorkorderNavigationName.activity) {
            this.navigationToNotes();
          }
        });
        if (workorder) {
          this.html.navigationBarContent = this.navigationBarContentSetup();
          this.recalcLocalProperties(workorder);
          if (workorder.Id) {
            this.loadTemplate(workorder.Id);
          }
          this.html.versionsOrdered = this.workOrderService.getWorkOrderVersionsOrdered(workorder);
        }
      });
  }

  navigationToNotes() {
    const navigateCommand = ['/next/workorder', this.routerParams.assignmentId, this.routerParams.workorderId, this.routerParams.versionId, 'activity', 'notes'];
    const navigationExtras = { relativeTo: this.activatedRoute, skipLocationChange: false };
    this.router
      .navigate(navigateCommand, navigationExtras)
      .catch(err => {
        console.error(this.constructor.name + '.error in router.navigate: ', navigateCommand, navigationExtras, err);
      })
      .then(r => {
        console.log(this.constructor.name + '.success: ', navigateCommand, navigationExtras);
      });
  }

  setRouterState(routerStateResult: IRouterState, WorkorderNavigationName: string) {
    this.routerState = {
      Id: routerStateResult.params.workorderId,
      routerPath: WorkorderNavigationName,
      url: routerStateResult.location
    };

    this.html.entityTypeId = this.html.phxConstants.EntityType.WorkOrder;
    this.html.entityId = this.routerState.Id;
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/workorder/${this.routerParams.assignmentId}/${this.routerParams.workorderId}/${this.routerParams.versionId}/`;
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.notes,
        Path: `${path}${PhxConstants.WorkorderNavigationName.notes}`,
        DisplayText: 'Notes'
        // , Icon: 'fontello-icon-doc-7',
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.history,
        Path: `${path}${PhxConstants.WorkorderNavigationName.history}`,
        DisplayText: 'Change History'
        //  , Icon: 'fontello-icon-network'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.transaction,
        Path: `${path}${PhxConstants.WorkorderNavigationName.transaction}`,
        DisplayText: 'Transaction'
        // , Icon: 'fontello-icon-contacts'
      },
      {
        Id: 4,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.documents,
        Path: path + PhxConstants.WorkorderNavigationName.documents,
        DisplayText: 'Additional Documents'
        //  , Icon: 'fontello-icon-th-4'
      },
      {
        Id: 5,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.WorkorderNavigationName.workflow,
        Path: path + PhxConstants.WorkorderNavigationName.workflow,
        DisplayText: 'Workflow'
        // , Icon: 'fontello-icon-money'
      }
    ];
  }

  recalcLocalProperties(workOrder: IWorkOrder) {
    this.html.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'SourceId' },

      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },

      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },

      { TableSchemaName: '', TableName: '', ColumnName: 'AssignmentId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'WorkOrderId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'WorkOrderVersionId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'PaymentInfoId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'BillingInfoId' },

      { TableSchemaName: 'workorder', TableName: 'Assignment', ColumnName: 'StatusId' },

      { TableSchemaName: 'workorder', TableName: 'WorkOrder', ColumnName: 'WorkOrderVersion' },

      { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'StatusId' },
      { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'WorkOrderCreationReasonId' },
      { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'VersionNumber' },
      { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'WorkOrderStartDateState' },
      { TableSchemaName: 'workorder', TableName: 'WorkOrderVersion', ColumnName: 'WorkOrderEndDateState' },

      { TableSchemaName: 'po', TableName: 'WorkOrderPurchaseOrderLine', ColumnName: 'PurchaseOrderLineId' },
      { TableSchemaName: 'po', TableName: 'WorkOrderPurchaseOrderLine', ColumnName: 'StatusId' },
      { TableSchemaName: 'org', TableName: 'ClientBasedEntityCustomFieldValue', ColumnName: 'EntityTypeId' },
      { TableSchemaName: 'org', TableName: 'ClientBasedEntityCustomFieldValue', ColumnName: 'EntityId' }
    ];
  }

  loadTemplate(id: number, force: boolean = false) {
    this.complianceTemplateService
      .getTemplateById(id, null, force)
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe(data => {
        this.html.template = data;
      });
  }

  updateNotesCount() {
    this.notesHeader.getComments();
  }
}
