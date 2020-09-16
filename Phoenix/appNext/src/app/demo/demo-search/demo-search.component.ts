import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CodeValue, PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableSummaryItem, PhxDataTableSummaryType } from '../../common/model/index';
import { DemoService } from '../shared/demo.service';
import { CommonService, CodeValueService } from '../../common/index';
import { NavigationService } from '../../common/services/navigation.service';
import { Router, ActivatedRoute } from '@angular/router';

declare var oreq: any;

@Component({
  selector: 'app-demo-search',
  templateUrl: './demo-search.component.html',
  styleUrls: ['./demo-search.component.less']
})
export class DemoSearchComponent implements OnInit, OnDestroy {

  codeValueGroups: any;

  odataParams: string = oreq.request()
    .withExpand(['WorkflowAvailableActions', 'AccessActions'])
    .withSelect([
      'Id',
      'StringField',
      'Total',
      'CurrencyCodeValueField',
      'DateField',
      'IntegerField',
      'DecimalField',
      'WorkOrderNumber',
      'WorkerName',
      'WorkflowAvailableActions/Id',
      'WorkflowAvailableActions/WorkflowPendingTaskId',
      'WorkflowAvailableActions/Name',
      'WorkflowAvailableActions/CommandName',
      'WorkflowAvailableActions/PendingCommandName',
      'WorkflowAvailableActions/IsActionButton',
      'WorkflowAvailableActions/TaskResultId',
      'WorkflowAvailableActions/TaskRoutingDialogTypeId',
      'WorkflowAvailableActions/DisplayButtonOrder',
      'WorkflowAvailableActions/DisplayHistoryEventName',
      'AccessActions/AccessAction'
    ]).url();


  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});

  columns: Array<PhxDataTableColumn>;

  constructor(
    private expenseClaimService: DemoService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.navigationService.setTitle('demo-search');
    this.createColumns();
  }

  ngOnDestroy() {
  }

  createColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: 'Id',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'StringField',
        caption: 'String Field',
      }),
      new PhxDataTableColumn({
        dataField: 'Total',
        caption: 'Total',
        dataType: 'money',
      }),
      new PhxDataTableColumn({
        dataField: 'CurrencyCodeValueField',
        caption: 'Currency CodeValue Field',
        lookup: {
          dataSource: this.getCurrencyLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'DateField',
        caption: 'Date Field',
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'IntegerField',
        caption: 'Integer Field',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'DecimalField',
        caption: 'Decimal Field',
        dataType: 'decimal'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: 'Work Order Number',
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: 'Worker',
      })
    ];
  }

  onRowClick(event: any) {
    if (event && event.data) {
      this.view(event.data.Id);
    }
  }

  view(id) {
    this.router.navigate([`${id}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to demo/${id}`, err);
      });
  }

  getCurrencyLookup() {
    return this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.code + ' - ' + codeValue.text,
          value: codeValue.id
        };
      });
  }
}
