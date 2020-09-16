import { CodeValue } from './../../common/model/code-value';
import { CodeValueService } from './../../common/services/code-value.service';
import { Component, OnInit } from '@angular/core';
import { PhxDataTableConfiguration, PhxDataTableColumn } from '../../common/model/index';
import { CommonService } from '../../common/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compliance-document-expiry-search',
  templateUrl: './compliance-document-expiry-search.component.html',
  styleUrls: ['./compliance-document-expiry-search.component.less']
})
export class ComplianceDocumentExpirySearchComponent implements OnInit {

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true,
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'ComplianceDocumentRuleEntityTypeId',
      caption: 'Area',
      lookup: {
        dataSource: this.getProfileLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
      cellTemplate: 'commaDelimitedLookupCellTemplate',
    }),
    new PhxDataTableColumn({
      dataField: 'ComplianceDocumentRuleDisplayName',
      caption: 'Document Rule',
    }),
    new PhxDataTableColumn({
      dataField: 'Reference',
      caption: 'Reference',
    }),
    new PhxDataTableColumn({
      dataField: 'ComplianceDocumentExpiryDate',
      caption: 'Expiry Date',
      dataType: 'date',
      sortOrder: 'asc'
    })
  ];

  constructor(
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  getProfileLookup() {
    return this.codeValueService.getCodeValues('compliance.CodeComplianceDocumentRuleEntityType', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  public onRowClick(event: any) {
    if (event && event.data) {
      if (event.data.ComplianceDocumentRuleEntityTypeId === this.commonService.ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder) {
        this.viewWorkOrderDetails(event.data);
      } else if (event && event.data && event.data.ComplianceDocumentRuleEntityTypeId === this.commonService.ApplicationConstants.ComplianceDocumentRuleEntityType.Organization) {
        this.viewOrganizationDetail(event.data);
      } else if (event && event.data && event.data.ComplianceDocumentRuleEntityTypeId === this.commonService.ApplicationConstants.ComplianceDocumentRuleEntityType.Worker) {
        this.viewContactDetail(event.data);
      }
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewWorkOrderDetails(rowdata: any) {
    this.router.navigate(['next', 'workoder', rowdata.AssignmentId, rowdata.WorkOrderId, rowdata.WorkOrderVersionId, 'compliancedocuments']);
  }

  viewOrganizationDetail(rowdata) {
    if (rowdata.ComplianceDocumentHeaderToEntityTypeId === this.commonService.ApplicationConstants.EntityType.OrganizationIndependentContractorRole) {
      this.router.navigate(['next', 'organization', rowdata.OrganizationId, 'roles', 'independentcontractor', rowdata.RoleId]);
    } else if (rowdata.ComplianceDocumentHeaderToEntityTypeId === this.commonService.ApplicationConstants.EntityType.OrganizationSubVendorRole) {
      this.router.navigate(['next', 'organization', rowdata.OrganizationId, 'roles', 'subvendor', rowdata.RoleId]);
    } else if (rowdata.ComplianceDocumentHeaderToEntityTypeId === this.commonService.ApplicationConstants.EntityType.OrganizationLimitedLiabilityCompanyRole) {
      this.router.navigate(['next', 'organization', rowdata.OrganizationId, 'roles', 'limitedliabilitycompany', rowdata.RoleId]);
    }
  }

  viewContactDetail(rowdata) {
    const userProfileTypeSufix = this.commonService.getUserProfileTypeSufix(rowdata);

    this.router.navigate(['next', 'contact', rowdata.ContactId, 'profile', userProfileTypeSufix, rowdata.UserProfileId]);
  }

}
