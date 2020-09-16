import { CommonService } from '../../common/services/common.service';
import { Component, OnInit, Inject } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { StateService } from '../../common/state/service/state.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { NavigationService } from '../../common/services/navigation.service';
import { WindowRefService, LoadingSpinnerService } from '../../common/index';
import { AuthService } from './../../common/services/auth.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

declare var oreq: any;
@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrls: ['./contact-search.component.less']
})
export class ContactSearchComponent extends BaseComponentOnDestroy implements OnInit {
  contact: any;
  dataSourceUrl: string = 'Contact/Search';
  dataGridComponentName: string = 'ContactSearch';
  self = this;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true,
    showOpenInNewTab: true
  });

  oDataParams: string;
  oDataParameterSelectFields: string = oreq.request().withSelect([
    'ContactId',
    'FirstName',
    'LastName',
    'OrganizationNames',
    'UserProfileTypeId',
    'ProfileTypes',
    'Emails',
    'UserStatus',
    'ChildContactId',
    'ChildProfileId',
    'UserProfileId'
  ]).url();

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'ContactId',
      caption: 'ID',
      fixed: true,
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'FirstName',
      caption: 'First Name',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'LastName',
      caption: 'Last Name',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'OrganizationNames',
      caption: 'Organization',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'ProfileTypes',
      caption: 'Profile',
      alignment: 'left',
      dataType: 'string',
      lookup: {
        dataSource: this.getProfileLookup(),
        valueExpr: 'text',
        displayExpr: 'text'
      },
      cellTemplate: 'commaDelimitedLookupCellTemplate',
      filterOperations: ['contains', 'notcontains'],
      selectedFilterOperation: 'contains'
    }),
    new PhxDataTableColumn({
      dataField: 'Emails',
      caption: 'Email',
      alignment: 'left',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'UserStatus',
      caption: 'Status',
      alignment: 'left',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'text',
        displayExpr: 'text'
      },
    }),

  ];

  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'Title',
      summaryType: PhxDataTableSummaryType.Count
    }),
    new PhxDataTableSummaryItem({
      column: 'Total',
      summaryType: PhxDataTableSummaryType.Sum,
      displayFormat: 'Total: {0}',
      valueFormat: this.totalColumnFormat
    })
  ];

  newOptions = [
    {
      displayName: 'Organizational Contact',
      onClick: (() => this.router.navigate(['/next', 'contact', 'wizardorganizationalprofile']))
    },
    {
      displayName: 'Worker Contact',
      onClick: (() => this.router.navigate(['/next', 'contact', 'wizardworkerprofile']))
    }
  ];

  constructor(
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private spinner: LoadingSpinnerService,
    private authService: AuthService,
    private router: Router
  ) {
    super();
    if (this.authService.hasFunctionalOperation(this.commonService.ApplicationConstants.FunctionalOperation.ContactCreateProfileTypeInternal)) {
      this.newOptions.push({
        displayName: 'Internal Contact',
        onClick: (() => this.router.navigate(['/next', 'contact', 'wizardinternalprofile']))
      });
    }
  }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.spinner.show();
      this.viewContactDetail(event.data);
      this.spinner.hide();
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewContactDetail(rowdata) {
    this.router.navigate(['/next', 'contact', this.getContactId(rowdata), 'profile', this.getProfileType(rowdata), this.getProfileId(rowdata)]);
  }

  getProfileType(rowdata) {
    let profiletype = null;
    switch (rowdata.UserProfileTypeId) {
      case 1: profiletype = 'organizational'; break;
      case 2: profiletype = 'internal'; break;
      case 3: profiletype = 'workertemp'; break;
      case 4: profiletype = 'workercanadiansp'; break;
      case 5: profiletype = 'workercanadianinc'; break;
      case 6: profiletype = 'workersubvendor'; break;
      case 7: profiletype = 'workerunitedstatesw2'; break;
      case 8: profiletype = 'workerunitedstatesllc'; break;
      default: profiletype = ''; break;
    }
    return profiletype;
  }

  onContextMenuOpenTab(rowdata) {
    const profiletype = this.getProfileType(rowdata);
    const contactId = this.getContactId(rowdata);
    const profileId = this.getProfileId(rowdata);
    this.winRef.nativeWindow.open('#/next/contact/' + contactId + '/profile/' + profiletype + '/' + profileId, '_blank');
  }

  getContactId(rowdata): number {
    return rowdata.ChildContactId ? rowdata.ChildContactId : rowdata.ContactId;
  }

  getProfileId(rowdata): number {
    return rowdata.ChildContactId ? rowdata.ChildProfileId : rowdata.UserProfileId;
  }

  getStatusLookup() {
    return this.codeValueService.getCodeValues('usr.CodeUserStatus', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getProfileLookup() {
    return this.codeValueService.getCodeValues('usr.CodeProfileType', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }


  ngOnInit() {
    this.route.data
      .takeUntil(this.isDestroyed$)
      .subscribe(d => {
        this.dataSourceUrl = d.dataSourceUrl ? d.dataSourceUrl : this.dataSourceUrl;
        this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
        this.dataGridComponentName = d.dataGridComponentName ? d.dataGridComponentName : this.dataGridComponentName;
      });
    this.navigationService.setTitle('contact-manage');
    const profileTypes = this.codeValueService.getCodeValues('usr.CodeProfileType', true);
    const draftStatusList = [{ id: true, text: 'Draft' }, { id: false, text: 'Active' }];
  }
}
