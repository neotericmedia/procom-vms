import { Component, OnInit } from '@angular/core';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { CommonService, PhxConstants } from '../../common';
import { SubscriptionObservableService } from '../state/subscription.observable.service';
import { ISubscription } from '../state';

@Component({
  selector: 'app-subscription-tab-history',
  templateUrl: './subscription-tab-history.component.html',
  styleUrls: ['./subscription-tab-history.component.less']
})
export class SubscriptionTabHistoryComponent extends BaseComponentOnDestroy implements OnInit {
  public subscription: ISubscription;
  html: {
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    entityTypeId: number;
    entityId: number;
    changeHistoryBlackList: any[];
  } = {
      codeValueGroups: null,
      phxConstants: null,
      entityTypeId: null,
      entityId: null,
      changeHistoryBlackList: null
    };
  constructor(private commonService: CommonService,
    private subscriptionObservableService: SubscriptionObservableService) {
    super();
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    console.log(this.constructor.name + '.ngOnInit');
    this.subscriptionObservableService
      .subscriptionOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(subscription => {
        if (subscription) {
          this.onInitSubscription(subscription);
        }
      });
  }

  onInitSubscription(subscription: ISubscription) {
    this.subscription = subscription;
    this.html.entityTypeId = PhxConstants.EntityType.AccessSubscription;
    this.html.entityId = this.subscription.Id;
    this.recalcLocalProperties();
  }
  recalcLocalProperties() {
    this.html.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'AccessSubscriptionId' },

      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
    ];
  }


}
