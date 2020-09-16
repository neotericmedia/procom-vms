import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';

import { CommissionService } from './../commission.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxConstants } from '../../common/model/phx-constants';

import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';

declare var oreq: any;

@Component({
  selector: 'app-commission-branch-summary',
  templateUrl: './commission-branch-summary.component.html',
  styleUrls: ['./commission-branch-summary.component.less']
})
export class CommissionBranchSummaryComponent implements OnInit {
  reportDate: any;
  reportYear: number;
  reportMonth: number;
  noAccess: boolean = false;
  internalOrganizations: any = [];
  branches: any = [];
  selectedBranchIds: any = [];
  selectedOrganizationIdsInternal: any = [];

  dataSourceUrl: string;
  validationMessages: string;
  odataParams: string = '';
  codeValueGroups: any;
  ApplicationConstants: any;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    enableExport: true,
    pageSize: 25,
  });

  @ViewChild('grid') grid: PhxDataTableComponent ;
  columns: Array<PhxDataTableColumn> = [];

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      protected commonService: CommonService,
      private navigationService: NavigationService,
      private commissionService: CommissionService,
      private codeValueService: CodeValueService
  ) {
      this.codeValueGroups = this.commonService.CodeValueGroups;
      this.ApplicationConstants = this.commonService.ApplicationConstants;

      this.route.data.subscribe((data) => {
        if (data && data.resolvedData && data.resolvedData.organizations) {
          this.internalOrganizations = data.resolvedData.organizations;
          this.branches = data.resolvedData.branches;
        }
      });
  }
  ngOnInit() {
    this.navigationService.setTitle('commission-branch-summary');
    this.reportDate = moment().subtract(1, 'months').toDate();

    this.columns = [
      new PhxDataTableColumn({
        dataField: 'OrganizationIdInternal',
        caption: 'Internal Company',
        lookup: {
            dataSource: this.getInternalOrgLookup(),
            valueExpr: 'value',
            displayExpr: 'text'
        },
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'BranchId',
        caption: 'Branch',
        lookup: {
            dataSource: this.getBranchLookup(),
            valueExpr: 'value',
            displayExpr: 'text'
        },
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'Name',
        caption: 'Name',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionRoleId',
        caption: 'Commission Role',
        lookup: {
          dataSource: this.getCommissionRoleLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
      },
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountEarned',
        caption: 'Amount Earned',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountInterest',
        caption: 'Amount Interest',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountDirectCharges',
        caption: 'Amount Direct Charges',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountRecurringCharges',
        caption: 'Amount Recurring Charges',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountCorrections',
        caption: 'Amount Corrections',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountReversals',
        caption: 'Amount Reversals',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountRebooked',
        caption: 'Amount Rebooked',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'AmountNet',
        caption: 'Amount Net',
        dataType: 'money',
        hidingPriority: undefined
      }),
      new PhxDataTableColumn({
        dataField: 'ReferenceNumber',
        caption: 'Reference Number',
        dataType: 'string',
        hidingPriority: undefined,
      }),
    ];
  }

  getReport() {
    let reportYear: number;
    let reportMonth: number;

    this.odataParams = this.generateFilterExpression(this.selectedOrganizationIdsInternal, this.selectedBranchIds);

    if (this.reportDate) {
      reportYear = moment(this.reportDate).year();
      reportMonth = moment(this.reportDate).month() + 1;
      this.reportYear = reportYear;
      this.reportMonth = reportMonth;

      if (reportMonth > 0 && reportMonth <= 12) {
        this.dataSourceUrl = `Commission/getCommissionBranchSummary/${reportYear}/${reportMonth}`;
      } else {
        this.dataSourceUrl = null;
      }
    }

    if (this.grid) {
      this.grid.refresh();
    }
  }

  generateFilterExpression(selectedOrganizationIdInternalList: number[], selectedBranchIdList: number[]) {
    let filterString: string;
    let isFirstIteration: boolean = true;

    if ((selectedOrganizationIdInternalList && selectedOrganizationIdInternalList.length > 0)
      || (selectedBranchIdList && selectedBranchIdList.length > 0)) {
      filterString = '$filter=';

      filterString += selectedOrganizationIdInternalList.length > 0 ? '(' : '';

      selectedOrganizationIdInternalList.forEach(id => {
        if (isFirstIteration) {
          filterString += 'OrganizationIdInternal eq ' + id;
          isFirstIteration = false;
        } else {
          filterString += ' or OrganizationIdInternal eq ' + id;
        }
      });

      filterString += selectedOrganizationIdInternalList.length > 0 ? ')' : '';
      filterString += (selectedOrganizationIdInternalList.length > 0 && selectedBranchIdList.length > 0) ? ' and ' : '';
      filterString += selectedBranchIdList.length > 0 ? '(' : '';

      isFirstIteration = true;

      selectedBranchIdList.forEach(id => {
        if (isFirstIteration) {
          filterString += 'BranchId eq ' + id;
          isFirstIteration = false;
        } else {
          filterString += ' or BranchId eq ' + id;
        }
      });

      filterString += selectedBranchIdList.length > 0 ? ')' : '';
    }

    return filterString;
  }

  onOrganizationIdInternalSelectionChanged(data) {
    this.selectedOrganizationIdsInternal = data.value;
  }

  onBranchSelectionChanged(data) {
    this.selectedBranchIds = data.value;
  }

  onReportDateChanged(reportDate) {
    this.reportDate = reportDate;
  }

  getBranchLookup() {
    return this.branches.sort(this.compareValues('text'));
  }

  getInternalOrgLookup() {
    return this.internalOrganizations.sort(this.compareValues('text'));
  }

  getCommissionRoleLookup() {
    return this.codeValueService.getCodeValues('commission.CodeCommissionRole', true)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((codeValue: CodeValue) => {
        return { text: codeValue.text, value: codeValue.id };
    });
  }

  // Dynamic sorting based on property of object
  compareValues(key, order = 'asc') {
    return function (a, b) {
      let comparison = 0;

      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return comparison;
      }

      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }

      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }
}

