import { CodeValueService } from './../../common/services/code-value.service';
import { NavigationService } from './../../common/services/navigation.service';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue } from '../../common/model/index';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplianceTemplateService, ComplianceTemplate } from '../shared/index';
import { PhxConstants } from '../../common/index';
import { WindowRefService } from '../../common/index';
declare var oreq: any;

@Component({
  selector: 'app-compliance-template-search',
  templateUrl: './compliance-template-search.component.html',
  styleUrls: ['./compliance-template-search.component.less']
})
export class ComplianceTemplateSearchComponent implements OnInit, OnChanges {

  @Input() documentTypeId: number = 0;
  @Input() showNewButton: boolean = true;
  oDataParams: string;
  componentName: string = 'ComplianceTemplate';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'Name',
      caption: 'Name',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'HasRestriction',
      caption: 'Restriction',
      dataType: 'boolean',
      lookup: {
        dataSource: this.getBooleanLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'LineOfBusinessList',
      caption: 'Line Of Business',
      dataType: 'string',
      isArray: true,
      allowSearch: false,
      cellTemplate: 'lineOfBusinessListTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'ClientOrganizationList',
      caption: 'Client',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'ClientOrganizationsTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'BranchList',
      caption: 'Branch',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'BranchesTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'ProfileTypeList',
      caption: 'Worker Type',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'ProfileTypesTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'InternalOrganizationList',
      caption: 'Internal Organization',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'InternalOrganizationsTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'WorksiteList',
      caption: 'Worksite',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'WorksitesTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'OrganizationRoleTypeList',
      caption: 'Organization Type',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'OrganizationRoleTypesTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'TaxSubdivisionList',
      caption: 'Tax Province/State',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'TaxSubdivisionsTemplate',
      allowSorting: false,
    }),
    new PhxDataTableColumn({
      dataField: 'WorkerEligibilityList',
      caption: 'Worker Eligibility',
      dataType: 'string',
      allowSearch: false,
      isArray: true,
      cellTemplate: 'WorkerEligibilitiesTemplate',
      allowSorting: false,
    }),
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private complienaceTemplateService: ComplianceTemplateService,
    private winRef: WindowRefService,
  ) { }

  ngOnInit() {
    if (this.documentTypeId != null && this.documentTypeId === 0) {
      this.navigationService.setTitle('compliance-template-manage');
      this.columns.push(
        new PhxDataTableColumn({
          dataField: 'ComplianceDocumentTypeName',
          caption: 'Document Type',
          dataType: 'string',
        }),
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.documentTypeId) {

      if (this.documentTypeId != null && this.documentTypeId > 0) {

        this.componentName = 'ComplianceTemplateByDocumentType';

        this.oDataParams = oreq.request()
          .withFilter(oreq.filter('ComplianceDocumentTypeId').eq(this.documentTypeId))
          .url();

      } else {
        this.componentName = 'ComplianceTemplate';
        this.navigationService.setTitle('compliance-template-manage');
        this.oDataParams = '';
      }
    }
  }

  onRowClick(event: any) {
    if (event && event.data && event.rowType === 'data') {
      this.view(event.data.Id);
    }
  }

  view(id) {
    this.router.navigate([`next/compliance/template/${id}`])
      .catch((err) => {
        console.error(`error navigating to compliance-template/${id}`, err);
      });
  }

  onContextMenuOpenTab(item) {
    this.winRef.nativeWindow.open(`/#/next/compliance/template/${item.Id}`, '_blank');
  }

  createNew() {
    this.complienaceTemplateService.executeCommand(PhxConstants.CommandNamesSupportedByUi.ComplianceTemplateNew, <ComplianceTemplate>{ ComplianceDocumentTypeId: this.documentTypeId })
      .then((id: number) => {
        this.view(id);
      });
  }

  getBooleanLookup() {
    return [{
      value: true,
      text: 'Yes'
    },
    {
      value: false,
      text: 'No'
    }];
  }
}

