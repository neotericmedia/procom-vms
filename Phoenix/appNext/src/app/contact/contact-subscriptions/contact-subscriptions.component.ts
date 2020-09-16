import { Component, OnInit, Inject } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { StateService } from '../../common/state/service/state.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { NavigationService } from '../../common/services/navigation.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { WindowRefService } from '../../common/index';
import { AccessSubscriptionService } from '../shared/accessSubscription.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

declare var oreq: any;
@Component({
  selector: 'app-contact-subscriptions',
  templateUrl: './contact-subscriptions.component.html',
  styleUrls: ['./contact-subscriptions.component.less']
})
export class ContactSubscriptionsComponent extends BaseComponentOnDestroy implements OnInit {

  contact: any;
  self = this;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });
  dataSourceUrl: string = 'AccessSubscription/getAllOriginalAccessSubscriptions';
  dataGridComponentName: string = 'ContactSubscriptions';
  oDataParams: string;
  oDataParameterSelectFields = oreq.request().withSelect([
    'AccessSubscriptionStatusId',
    'AccessSubscriptionTypeId',
    'ChildId',
    'EndDate',
    'HasRestrictions',
    'Id',
    'StartDate',
    'SubscribedTo',
    'UserProfileSubscriber'
  ]).url();

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      fixed: true,
      dataType: 'number',
    }),
    new PhxDataTableColumn({
      dataField: 'UserProfileSubscriber',
      caption: 'Subscriber',
      dataType: 'string',
    }),
    new PhxDataTableColumn({
      dataField: 'AccessSubscriptionTypeId',
      caption: 'Subscription Type',
      dataType: 'string',
      lookup: {
        dataSource: this.getSubsTypeLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'SubscribedTo',
      caption: 'Subscribed To',
      dataType: 'string',
    }),
    new PhxDataTableColumn({
      dataField: 'HasRestrictions',
      caption: 'Restrictions?',
      dataType: 'boolean',
      lookup: {
        dataSource: this.getHasRestrictionLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'StartDate',
      caption: 'Start Date',
      alignment: 'left',
      dataType: 'date',
      format: 'yyyy-MM-dd',
      calculateFilterExpression: function (filterValue, selectedFilterOperation) {
        return this.defaultCalculateFilterExpression(
          new Date(moment(filterValue).format('YYYY-MM-DD') + 'T00:00:00.000Z')
          , selectedFilterOperation
        );
      },
    }),
    new PhxDataTableColumn({
      dataField: 'EndDate',
      caption: 'End Date',
      alignment: 'left',
      dataType: 'date',
      format: 'yyyy-MM-dd',
      calculateFilterExpression: function (filterValue, selectedFilterOperation) {
        return this.defaultCalculateFilterExpression(
          new Date(moment(filterValue).format('YYYY-MM-DD') + 'T00:00:00.000Z')
          , selectedFilterOperation
        );
      },
    }),
    new PhxDataTableColumn({
      dataField: 'AccessSubscriptionStatusId',
      caption: 'Status',
      alignment: 'left',
      dataType: 'string',
      lookup: {
        dataSource: this.getAccessSubscriptionStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
  ];

  constructor(
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private route: ActivatedRoute,
    private winRef: WindowRefService,
    private router: Router,
    private accessSubscriptionService: AccessSubscriptionService
  ) {
    super();
  }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewSubscriptionDetail(event.data);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewSubscriptionDetail(rowdata) {
    this.router.navigate(['/next', 'subscription', 'edit', rowdata.ChildId ? rowdata.ChildId : rowdata.Id]);
  }

  createSubscription() {
    this.accessSubscriptionService.accessSubscriptionNew({ IsTimeRestricted: false, }).then((success) => {
      this.router.navigate(['/next', 'subscription', 'edit', success.EntityId]);
    });
  }

  getSubsTypeLookup() {
    return this.codeValueService.getCodeValues('access.CodeAccessSubscriptionType', true).sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    }).map((codeValue: CodeValue) => {
      return {
        text: codeValue.text,
        value: codeValue.id.toString()
      };
    });
  }

  getAccessSubscriptionStatusLookup() {
    return this.codeValueService.getCodeValues('access.CodeAccessSubscriptionStatus', true).sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    }).map((codeValue: CodeValue) => {
      return {
        text: codeValue.text,
        value: codeValue.id.toString()
      };
    });
  }

  getHasRestrictionLookup() {
    return [
      { text: 'No', value: false },
      { text: 'Yes', value: true },
    ];
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`#/next/subscription/edit/${item.ChildId ? item.ChildId : item.Id}`, '_blank');
  }

  ngOnInit() {

    this.route.data
      .takeUntil(this.isDestroyed$)
      .subscribe(d => {
        this.dataSourceUrl = d.dataSourceUrl ? d.dataSourceUrl : this.dataSourceUrl;
        this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
        this.dataGridComponentName = d.dataGridComponentName ? d.dataGridComponentName : this.dataGridComponentName;
      });

    this.navigationService.setTitle('subscription-manage');

  }
}
