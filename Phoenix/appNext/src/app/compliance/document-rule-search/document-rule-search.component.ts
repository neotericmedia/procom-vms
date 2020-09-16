import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PhxModalComponent } from './../../common/components/phx-modal/phx-modal.component';
import { SelectedRestrictionType } from './../../restriction/share/restriction';
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue } from '../../common/model/index';
import { NavigationService } from '../../common/services/navigation.service';
import { CodeValueService, CommonService, ApiService } from '../../common/index';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowRefService } from '../../common/index';
import { groupBy, map, filter } from 'lodash';
declare var oreq: any;

import { DocumentRuleService } from '../shared/document-rule.service';
import { PhxConstants } from '../../common/PhoenixCommon.module';

@Component({
  selector: 'app-document-rule-search',
  templateUrl: './document-rule-search.component.html',
  styleUrls: ['./document-rule-search.component.less']
})
export class DocumentRuleSearchComponent implements OnInit, OnChanges {
  @Input() documentTypeId: number = 0;
  @Input() showNewButton: boolean = true;

  @ViewChild(PhxModalComponent) restrictionsModal: PhxModalComponent;

  componentName: string = 'DocuentRulesManagementSearch';

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  ruleAreaTypeId: any = 0;
  selectedClientId: any = null;
  listOrganizationClient: any = [];

  codeValueGroups: any = {};
  applicationConstants: any = {};
  apiArgs: any = [];

  dataSourceUrl: string;
  organizationIdClient: any = -1;
  oDataParams: any;
  currentlyActive: any = null;
  notAssignedId: any = 1;

  // organizationIdClient: -1 is used to get empty list for ruleAreaTypeId === ApplicationConstants.ComplianceDocumentRuleAreaType.OrganizationClient;
  // organizationIdClient: 0 is used to get not Assigned entities based on OrganizationIdClient ==null
  // see: public PageResult GetListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient(int complianceDocumentRuleAreaTypeId, int organizationIdClient, ODataQueryOptions<ComplianceDocumentRuleDto> options)

  columns: Array<PhxDataTableColumn>;

  selectedDocumentRestrictionList: SelectedRestrictionType[] = [];

  constructor(
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private documentRuleService: DocumentRuleService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private apiService: ApiService,
    private winRef: WindowRefService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.applicationConstants = this.commonService.ApplicationConstants;
  }

  ngOnInit() {
    this.createColumns();

    this.route.params.subscribe(params => {
      const ruleAreaId = params['ruleAreaTypeId'];
      if (params.hasOwnProperty('selectedClientId')) {
        this.selectedClientId = params['selectedClientId'];
      }
      this.ruleAreaTypeId = parseInt(ruleAreaId, 0);
    });

    this.setDataSourceUrl();
    this.oDataOrganizationIdClientCall();
    this.setODataParams();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Changes');
    if (changes.documentTypeId) {
      this.setODataParams();
    }
  }

  setODataParams() {
    // tslint:disable-next-line:max-line-length
    const selectParams = ''; // '$select=Id,DisplayName,DocumentTypeList,ComplianceDocumentRuleStatusId,ComplianceDocumentRuleEntityTypeId,HasRestriction,ComplianceDocumentRuleRequiredTypeId,IsRequiredReview,LineOfBusinessList,ClientOrganizationList,BranchList,ProfileTypeList,InternalOrganizationList,WorksiteList,OrganizationRoleTypeList,RequiredSituationTypes,VisibleProfileTypes,DocumentTypes,LineOfBusinesses,ClientOrganizations,Branches,ProfileTypes,InternalOrganizations,Worksites,OrganizationRoleTypes,RequiredSituationTypes,VisibleProfileTypes';
    if (this.documentTypeId != null && this.documentTypeId > 0) {
      this.componentName = 'DocuentRulesManagementSearchByDocumentType';

      this.oDataParams = `${selectParams}&$filter=ComplianceDocumentRuleUserDefinedDocumentTypes/any(item: item/UserDefinedCodeComplianceDocumentTypeId eq ${this.documentTypeId})`;
      console.log(this.documentTypeId, this.oDataParams);

      this.setDataSourceUrl();
    } else {
      this.componentName = 'DocuentRulesManagementSearch';
      this.navigationService.setTitle('document-rules-viewedit');
      this.oDataParams = `${selectParams}`;
      console.log(this.documentTypeId, this.oDataParams);
    }
  }

  createColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: 'ID',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'DisplayName',
        caption: 'Name',
        dataType: 'string'
      }),
      new PhxDataTableColumn({
        dataField: 'DocumentTypeList',
        caption: 'Document Type',
        dataType: 'string',
        isArray: true,
        allowSearch: false,
        cellTemplate: 'documentTypeListTemplate',
        allowSorting: false
      }),
      new PhxDataTableColumn({
        dataField: 'ComplianceDocumentRuleStatusId',
        caption: 'Status',
        lookup: {
          dataSource: this.getComplianceDocumentRuleStatusId(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ComplianceDocumentRuleEntityTypeId',
        caption: 'Document For',
        lookup: {
          dataSource: this.getComplianceDocumentRuleEntityTypeId(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'HasRestriction',
        caption: 'Parameter',
        dataType: 'boolean',
        lookup: {
          dataSource: this.getBooleanLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        },
        cellTemplate: 'restrictionTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'ComplianceDocumentRuleRequiredTypeId',
        caption: 'Required Type',
        dataType: 'string',
        lookup: {
          dataSource: this.getComplianceDocumentRuleRequiredTypeId(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'IsRequiredReview',
        caption: 'Requires Review',
        dataType: 'boolean',
        lookup: {
          dataSource: this.getBooleanLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'RequiredSituationTypeList',
        caption: 'Required For',
        dataType: 'string',
        allowSearch: false,
        isArray: true,
        cellTemplate: 'RequiredSituationTypesTemplate',
        allowSorting: false
      }),
      new PhxDataTableColumn({
        dataField: 'VisibleProfileTypeList',
        caption: 'Visible To',
        dataType: 'string',
        allowSearch: false,
        isArray: true,
        cellTemplate: 'VisibleProfileTypesTemplate',
        allowSorting: false
      })
    ];
  }

  showRestrictions(documentRule: any) {
    this.selectedDocumentRestrictionList = map(groupBy(documentRule.ComplianceDocumentRuleRestrictions, 'ComplianceDocumentRuleRestrictionTypeId'), (value, key) => {
      const codeValue = this.codeValueService.getCodeValue(+key, this.codeValueGroups.ComplianceDocumentRuleRestrictionType);
      return {
        RestrictionTypeId: codeValue.id,
        RestrictionTypeName: codeValue.text,
        RestrictionTypeCode: codeValue.code,
        IsInclusive: value[0].IsInclusive,
        SelectedRestrictions: value
      };
    });
    this.restrictionsModal.show();
  }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.router.navigateByUrl(`/next/document/rule/edit/${event.data.Id}/details`);
    }
  }

  onContextMenuOpenTab(item) {
    // this.winRef.nativeWindow.open(`/#/document/rule/edit/${item.Id}/details`, '_blank');
    this.winRef.nativeWindow.open(`/#/next/document/rule/edit/${item.Id}/details`, '_blank');
  }

  setDataSourceUrl() {
    switch (this.ruleAreaTypeId) {
      case PhxConstants.ComplianceDocumentRuleAreaType.OrganizationInternal:
      case PhxConstants.ComplianceDocumentRuleAreaType.Assignment:
        this.dataSourceUrl = `ComplianceDocumentRule/getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient/${this.ruleAreaTypeId}/0`;
        break;
      case PhxConstants.ComplianceDocumentRuleAreaType.OrganizationClient:
        this.dataSourceUrl = `ComplianceDocumentRule/getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient/${this.ruleAreaTypeId}/${this.selectedClientId}`;
        break;
      default:
        this.dataSourceUrl = 'ComplianceDocumentRule/getListComplianceDocumentRulesOriginal';
        break;
    }
  }

  oDataOrganizationIdClientCall() {
    if (this.ruleAreaTypeId > 0) {
      const result = { entities: [], listOrganizationClient: [] };

      const oDataFilter = oreq.filter('ComplianceDocumentRuleAreaTypeId').eq(this.ruleAreaTypeId);

      const oDataParams = oreq
        .request()
        .withSelect(['OrganizationIdClient'])
        .withFilter(oDataFilter)
        .url();

      this.documentRuleService.getListComplianceDocumentRulesOriginal(oDataParams).then(response => {
        result.entities = response['Items'];

        if (this.ruleAreaTypeId === this.applicationConstants.ComplianceDocumentRuleAreaType.OrganizationClient && result.entities.length > 0) {
          let oDataFilterOrg = '';
          const oDataFilterOrgArray = [];
          for (let i = 0; i < result.entities.length; i++) {
            const organizationIdClient = result.entities[i].OrganizationIdClient;
            oDataFilterOrgArray.push('Id eq ' + organizationIdClient);
          }
          oDataFilterOrg = oDataFilterOrgArray.join(' or ');

          let oDataParamsOrg = oreq
            .request()
            .withSelect(['Id', 'DisplayName', 'Code'])
            .withFilter(oDataFilterOrg)
            .url();

          oDataParamsOrg =
            oDataParamsOrg ||
            oreq
              .request()
              .withSelect(['Id', 'DisplayName', 'Code'])
              .url();
          this.documentRuleService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParamsOrg).then(orgResponseSuccess => {
            result.listOrganizationClient = orgResponseSuccess['Items'];
            let notAssignedToOrganization = null;
            notAssignedToOrganization = filter(result.entities, ['OrganizationIdClient', null]);
            let tempList = [];
            if (notAssignedToOrganization !== null) {
              let largestValue = 1;
              for (let t = 0; t < result.listOrganizationClient.length; t++) {
                tempList.push(result.listOrganizationClient[t]);
                if (largestValue <= result.listOrganizationClient[t].Id) {
                  largestValue = result.listOrganizationClient[t].Id + 1;
                }
              }
              this.notAssignedId = largestValue;
              const tempObj = { Id: this.notAssignedId, DisplayName: '-- Not assigned to organization --', Code: '-- Not assigned to organization --' };
              tempList.unshift(tempObj);
            } else {
              tempList = result.listOrganizationClient;
            }

            this.listOrganizationClient = tempList;

            if (this.selectedClientId != null) {
              if (this.selectedClientId && parseInt(this.selectedClientId, 0) !== 0) {
                this.currentlyActive = parseInt(this.selectedClientId, 0);
              } else {
                this.currentlyActive = this.notAssignedId;
              }
            } else {
              this.currentlyActive = null;
            }
          });
        }
      });
    }
  }

  onNew() {
    this.documentRuleService
      .complianceDocumentRuleUserActionNew({
        Id: 0,
        ComplianceDocumentRuleAreaTypeId: this.ruleAreaTypeId,
        ComplianceDocumentRuleStatusId: this.applicationConstants.ComplianceDocumentRuleStatus.New,
        OrganizationIdClient: 0,
        ComplianceDocumentRuleEntityTypeId:
          this.ruleAreaTypeId === this.applicationConstants.ComplianceDocumentRuleAreaType.OrganizationClient || this.ruleAreaTypeId === this.applicationConstants.ComplianceDocumentRuleAreaType.Assignment
            ? this.applicationConstants.ComplianceDocumentRuleEntityType.WorkOrder
            : null
      })
      .then(
        responseSucces => {
          this.router.navigateByUrl(`/next/document/rule/edit/${responseSucces.EntityId}/details`);
        },
        responseError => {
          console.error('Error on creating new. ', responseError);
        }
      );
  }

  organizationClientOnChange(selectedObjEvent: any = null) {
    if (selectedObjEvent.value) {
      const selectedClientId = selectedObjEvent.value;
      if (selectedClientId !== this.notAssignedId) {
        this.selectedClientId = selectedClientId;
        this.currentlyActive = selectedClientId;
        this.router.navigate(['/next', 'compliance', 'document-rule', 'search', this.ruleAreaTypeId, selectedClientId]);
      } else {
        this.selectedClientId = 0;
        this.currentlyActive = selectedClientId;
        this.router.navigate(['/next', 'compliance', 'document-rule', 'search', this.ruleAreaTypeId, 0]);
      }
    } else {
      this.clearOrganizationClient();
    }

    this.setDataSourceUrl();
  }

  clearOrganizationClient() {
    this.selectedClientId = null;
    this.currentlyActive = null;
    this.router.navigate(['/next', 'compliance', 'document-rule', 'search', this.ruleAreaTypeId]);
  }

  getBooleanLookup() {
    return [
      {
        value: true,
        text: 'Yes'
      },
      {
        value: false,
        text: 'No'
      }
    ];
  }

  getComplianceDocumentRuleStatusId() {
    return this.codeValueService.getCodeValues(this.codeValueGroups.ComplianceDocumentRuleStatus, true).map((codeValue: CodeValue) => {
      return {
        text: codeValue.text,
        value: codeValue.id
      };
    });
  }

  getComplianceDocumentRuleRequiredTypeId() {
    return this.codeValueService.getCodeValues(this.codeValueGroups.ComplianceDocumentRuleRequiredType, true).map((codeValue: CodeValue) => {
      return {
        text: codeValue.text,
        value: codeValue.id
      };
    });
  }

  getComplianceDocumentRuleEntityTypeId() {
    return this.codeValueService.getCodeValues(this.codeValueGroups.ComplianceDocumentRuleEntityType, true).map((codeValue: CodeValue) => {
      return {
        text: codeValue.text,
        value: codeValue.id
      };
    });
  }
}
