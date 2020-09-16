// angular
import { Component, OnInit, Input } from '@angular/core';
// common
import { PhxConstants, CommonService } from '../../common/index';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { AccessAction } from '../../common/model';
// organization
import { OrganizationObservableService } from './../state/organization.observable.service';
import { IOrganization, IReadOnlyStorage } from '../state';

@Component({
  selector: 'app-organization-tab-history',
  templateUrl: './organization-tab-history.component.html',
  styleUrls: ['./organization-tab-history.component.less']
})
export class OrganizationTabHistoryComponent extends BaseComponentOnDestroy implements OnInit {
  public organization: IOrganization = null;
  public readOnlyStorage: IReadOnlyStorage;

  html: {
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    entityTypeId: number;
    entityId: number;
    changeHistoryBlackList: any[];
    codeValueLists: {
      // listCountry: Array<CodeValue>;
    };
    commonLists: {
      // listUserProfileInternal: Array<ICommonListsItem>;
    };
    access: {
      // organizationIndependentContractorRoleGarnisheeView: boolean;
      // organizationIndependentContractorRoleGarnisheeNew: boolean;
      // organizationIndependentContractorRoleGarnisheeSubmit: boolean;
    };
  } = {
    codeValueGroups: null,
    phxConstants: null,
    entityTypeId: null,
    entityId: null,
    changeHistoryBlackList: null,
    codeValueLists: {
      // listCountry: [],
    },
    commonLists: {
      // listUserProfileInternal: null
    },
    access: {
      // organizationIndependentContractorRoleGarnisheeView: false,
      // organizationIndependentContractorRoleGarnisheeNew: false,
      // organizationIndependentContractorRoleGarnisheeSubmit: false
    }
  };

  constructor(private commonService: CommonService, private organizationObservableService: OrganizationObservableService) {
    super();
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {
    console.log(this.constructor.name + '.ngOnInit');
    this.organizationObservableService
      .organizationOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(organization => {
        if (organization) {
          this.onInitOrganization(organization);
        }
      });
  }

  onInitOrganization(organization: IOrganization) {
    this.organization = organization;
    this.readOnlyStorage = organization.ReadOnlyStorage;
    this.html.entityTypeId = PhxConstants.EntityType.Organization;
    this.html.entityId = this.organization.IsOriginal ? this.organization.Id : this.organization.SourceId;

    this.recalcCodeValueLists(organization);
    this.recalcLocalProperties(organization);
    this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
  }

  getCodeValuelistsStatic() {}

  recalcCodeValueLists(organization: IOrganization) {}

  recalcLocalProperties(organization: IOrganization) {
    this.html.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationClientRoleId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationInternalRoleId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationIndependentContractorRoleId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationLimitedLiabilityCompanyRoleId' },
      { TableSchemaName: 'org', TableName: 'OrganizationClientRoleLOB', ColumnName: 'LineOfBusinessId' },
      { TableSchemaName: 'payment', TableName: 'PaymentMethod', ColumnName: 'PaymentMethodTypeId' },
      { TableSchemaName: 'org', TableName: 'OrganizationAddress', ColumnName: 'IsPrimary' }
    ];
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {}
}
