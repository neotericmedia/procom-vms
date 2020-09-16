import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// 
import * as _ from 'lodash';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';

import { StateService } from './../../common/state/service/state.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { CodeValue } from './../../common/model/code-value';
import { NavigationService } from './../../common/services/navigation.service';
import { WindowRefService, PhxConstants, CommonService, LoadingSpinnerService } from '../../common/index';
import { OrganizationApiService } from '../organization.api.service';

declare var oreq: any;

@Component({
    selector: 'app-organization-search',
    templateUrl: './organization-search.component.html',
    styleUrls: ['./organization-search.component.less']
})
export class OrganizationSearchComponent implements OnInit {


    organizations: any;
    totalColumnFormat = { type: 'fixedPoint', precision: 2 };
    pageTitle: string = 'Organization Search';
    dataSourceUrl: string = 'org/getListOriginalOrganizations';
    dataGridComponentName: string = 'OrganizationSearch';
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        showOpenInNewTab: true
    });
    oDataParams: string;
    oDataParameterSelectFields: string = oreq.request().withSelect([
        'Id',
        'DisplayName',
        'Code',
        'LegalName',
        'IsOrganizationClientRole',
        'IsOrganizationIndependentContractorRole',
        'IsOrganizationLimitedLiabilityCompanyRole',
        'IsOrganizationInternalRole',
        'IsOrganizationSubVendorRole',
        'IsDraft',
        'OrganizationStatusId'
    ]).url();

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'Id',
            width: 100,
            caption: 'ID',
            dataType: 'number'
        }),
        new PhxDataTableColumn({
            dataField: 'DisplayName',
            caption: 'Display Name',
            dataType: 'string',
            width: 400
        }),
        new PhxDataTableColumn({
            dataField: 'Code',
            caption: 'Org Code',
            dataType: 'string'
        }),
        new PhxDataTableColumn({
            dataField: 'LegalName',
            caption: 'Legal Name',
            dataType: 'string',
            width: 400
        }),
        new PhxDataTableColumn({
            dataField: 'Roles',
            caption: 'Roles',
            alignment: 'center',
            allowExporting: false,
            allowFiltering: true,
            allowSorting: false,
            allowGrouping: false,
            cellTemplate: 'orgRolesTemplate',
            calculateFilterExpression: (filterValue, selectedFilterOperation) => {
                const get = function (value, op) {
                    switch (value) {
                        case 1:
                            return ['IsOrganizationClientRole', '=', true];
                        case 2:
                            return ['IsOrganizationIndependentContractorRole', '=', true];
                        case 3:
                            return ['IsOrganizationInternalRole', '=', true];
                        case 4:
                            return ['IsOrganizationSubVendorRole', '=', true];
                        case 5:
                            return ['IsOrganizationLimitedLiabilityCompanyRole', '=', true];
                        default:
                            return selectedFilterOperation ? ['', selectedFilterOperation, filterValue] : null;
                    }
                };

                if (_.isArray(filterValue) && filterValue.length) {
                    const filters = [];
                    for (let i = 0; i < filterValue.length; i++) {
                        if (i !== 0) {
                            filters.push('or');
                        }
                        filters.push(get(filterValue[i], selectedFilterOperation));
                    }
                    return filters;
                } else {
                    return get(filterValue, selectedFilterOperation);
                }
            },
            lookup: {
                dataSource: this.getOrganizationRolesLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            }
        }),
        new PhxDataTableColumn({
            dataField: 'OrganizationStatusId',
            caption: 'Status',
            alignment: 'left',
            lookup: {
                dataSource: this.getStatusLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
            dataType: 'string',
        }),

    ];

    constructor(
        private activatedRoute: ActivatedRoute,
        private navigationService: NavigationService,
        private winRef: WindowRefService,
        private router: Router,
        private codeValueService: CodeValueService,
        private organizationApiService: OrganizationApiService,
        private commonService: CommonService,
        private loaderService: LoadingSpinnerService,

    ) {

    }

    navigateTo(organizationIdNavigateTo: number, tabNavigationName: PhxConstants.OrganizationNavigationName, roleId: number = null) {
        const navigatePath = `/next/organization/${organizationIdNavigateTo}/${tabNavigationName}` + (roleId ? `/${roleId}` : ``);
        this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
            console.error(`app-organization: error navigating to ${organizationIdNavigateTo} , ${tabNavigationName}`, err);
        });
    }

    getOrganizationRolesLookup() {
        const codeValues = this.codeValueService.getCodeValues('org.CodeOrganizationRoleType', true);
        return codeValues.map((codeValue) => {
            return {
                value: codeValue.id,
                text: codeValue.text
            };
        });
    }

    public onRowClick(event: any) {
        if (event && event.data) {
            this.viewOrganizationDetail(event.data);
        } else {
            console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
        }
    }
    viewOrganizationDetail(rowdata) {
        this.organizationApiService.getLatestId(rowdata.Id)
            .then((latestVersionId: number) => {
                // this.$state.go('org.edit.details', { organizationId: latestVersionId });
                this.navigateTo(latestVersionId, PhxConstants.OrganizationNavigationName.details);
            })
            .catch((err) => {
                // fix me
                // this.$state.go('org.edit.details', { organizationId: rowdata.Id });
                // this.$state.go('org.edit.details', { organizationId: rowdata.Id });
            });
    }

    createOrg() {
        this.loaderService.show();
        this.organizationApiService.createOrganization().then(response => {
            this.loaderService.hide();
            this.navigateTo(response.EntityId, PhxConstants.OrganizationNavigationName.details);
        }, error => {
            console.log(error);
            this.commonService.logError('An error occured on loading organization details.');
        });
    }

    onContextMenuOpenTab(event) {
        this.winRef.openUrl('#/next/organization/' + event.Id + '/details');
    }

    getStatusLookup() {
        return this.codeValueService.getCodeValues('org.CodeOrganizationStatus', true)
            .filter(item => item.id !== 7)
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
                    text: codeValue.text,
                    value: '' + codeValue.id
                };
            });
    }

    ngOnInit() {
        this.activatedRoute.data
            .subscribe(d => {
                this.dataSourceUrl = d.dataSourceUrl || this.dataSourceUrl;
                this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
                this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
                this.pageTitle = d.pageTitle || this.pageTitle;
            });

        this.navigationService.setTitle('organization-search');

    }
}
