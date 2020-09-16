import { Component, OnInit, OnDestroy, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import * as moment from 'moment';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxDataTableShowCheckboxesMode, StateAction, StateActionDisplayType, StateActionButtonStyle, PhxConstants } from '../../common/model/index';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';

import { Router, ActivatedRoute } from '@angular/router';

import { TransactionService } from '../transaction.service';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { DialogService } from './../../common/services/dialog.service';
import { DialogResultType } from './../../common/model/index';
import { ApiService } from './../../common/services/api.service';
import * as _ from 'lodash';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { VmsService } from '../shared/Vms.service';
import { AuthService } from '../../common/services/auth.service';
import { PhoenixCommonModuleResourceKeys } from '../../common/PhoenixCommon.module';
import { CodeValueGroups } from '../../common/model/phx-code-value-groups';

declare var oreq: any;

const localizedContent: any = {

    trnDateRange: 'One of the transaction dates is outside the range of the work order date',
    dateRangeError: 'Transaction dates should be within Work Order Version Effective dates.',
    startDateError: 'Transaction start date cannot be greater than end date.',
    rateUnitNegative: 'Rate Units cannot be negative'
};

@Component({
    selector: 'app-vms-transaction-conflict-search',
    templateUrl: './vms-transaction-conflict-search.component.html',
    styleUrls: ['./vms-transaction-conflict-search.component.less'],
    encapsulation: ViewEncapsulation.None  // Enable dynamic HTML styles
})
export class VmsTransactionConflictSearchComponent implements OnInit, OnDestroy {
    routeData: any;
    selectedAction: any = null;
    selectedIds: any[] = [];
    OrgClients: any[];
    organizationIdInternal: any;
    organizationIdClient: any;
    showClients: boolean = true;
    listOrganizationsInternal: any[];
    transferToOrganization: any;
    exportFileName: string;
    WorkOrderMappingDataset: any[];
    WorkOrderMappingDatasetOriginal: any[];
    WorkOrderMappingDatasetParent: any;
    codeRateType: any[];
    workOrderVersionStatuses: any[];
    canEdit: boolean = false;
    phxConstants: typeof PhxConstants = null;

    @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
    phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

    @ViewChild('phxTable') phxTable: PhxDataTableComponent;
    // Action dropdown options
    actionsArr: any = [
        { Id: 1, actionId: PhxConstants.StateAction.VmsTimesheetProcessedRecordIntercompanyTransfer, DisplayName: 'Inter-Company Change' },
        { Id: 2, actionId: PhxConstants.StateAction.VmsTimesheetProcessedRecordDiscard, DisplayName: 'Delete Record' },
        { Id: 3, actionId: PhxConstants.StateAction.VmsTimesheetProcessedRecordAutoResolve, DisplayName: 'Revalidate Records' }
    ];
    stateActions: StateAction[] = [];
    availableStateActions: StateAction[];
    actions: any[] = [];
    notifyName: any;
    unregisterList: any[] = [];
    ValidationMessages: any;
    pageTitle: string = 'Search';
    dataSourceUrl: string;
    initialDataSourceUrl: string;
    selectV2RateTypeId: any = null;
    dataGridComponentName: string = 'ConflictSearch';
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        selectionMode: PhxDataTableSelectionMode.Single,
        showFilter: true,
        enableExport: true,
        // showCheckBoxesMode:PhxDataTableShowCheckboxesMode.Always
    });
    oDataParams: string;

    oDataParameterSelectFields: string;

    // oDataParameterSelectFields: string = oreq.request().withSelect([
    //     'ImportDate',
    //     'ThirdPartyWorkerId',
    //     'FirstName',
    //     'LastName',
    //     'V1RateTypeId',
    //     'V1BillRate',
    //     'V1BillUnits',
    //     'V2RateTypeId ',
    //     'V2BillRate',
    //     'V2BillUnits',
    //     'StartDate',
    //     'EndDate',
    //     'InvoiceReference',
    //     'ValidationMessages',
    //     'CurrencyId'
    //   ]).url();

    currencyColumnFormat = { type: 'fixedPoint', precision: 2 };

    columns: Array<PhxDataTableColumn> = [

        new PhxDataTableColumn({
            dataField: 'ImportDate',
            caption: 'Import Date',
            dataType: 'date',
        }),
        new PhxDataTableColumn({
            dataField: 'ThirdPartyWorkerId',
            caption: 'Third Party Worker Id'
        }),
        new PhxDataTableColumn({
            dataField: 'FirstName',
            caption: 'First Name'
        }),
        new PhxDataTableColumn({
            dataField: 'LastName',
            caption: 'Last Name'
        }),
        new PhxDataTableColumn({
            dataField: 'V1RateTypeId',
            caption: 'Type-1',
            lookup: {
                dataSource: this.vmsRateType(),
                valueExpr: 'value',
                displayExpr: 'text'
            }
        }),
        new PhxDataTableColumn({
            dataField: 'V1BillRate',
            caption: 'Rate-1',
            // format: this.currencyColumnFormat,
            dataType: 'decimal',
            alignment: 'right',
            cellTemplate: 'currencyTemplate'
        }),
        new PhxDataTableColumn({
            dataField: 'V1BillUnits',
            caption: 'Units-1',
            dataType: 'decimal',
            alignment: 'right',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'V2RateTypeId',
            caption: 'Type-2',
            lookup: {
                dataSource: this.vmsRateType(),
                valueExpr: 'value',
                displayExpr: 'text'
            }
        }),
        new PhxDataTableColumn({
            dataField: 'V2BillRate',
            caption: 'Rate-2',
            format: this.currencyColumnFormat,
            dataType: 'decimal',
            alignment: 'right'
        }),
        new PhxDataTableColumn({
            dataField: 'V2BillUnits',
            caption: 'Units-2',
            dataType: 'decimal',
            alignment: 'right',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'StartDate',
            caption: 'Start Date',
            dataType: 'date',
        }),
        new PhxDataTableColumn({
            dataField: 'EndDate',
            caption: 'End Date',
            dataType: 'date',
        }),
        new PhxDataTableColumn({
            dataField: 'InvoiceReference',
            caption: 'TRN. Ref.',
            alignment: 'right'
        }),
        new PhxDataTableColumn({
            dataField: 'FileName',
            caption: 'Import File Name',
        }),
        new PhxDataTableColumn({
            dataField: 'ValidationMessages',
            caption: 'Reason',
            cellTemplate: 'reasonTemplate',
            calculateFilterExpression: function (filterValue, selectedFilterOperation) {
                let newFilterValue = '';
                if (filterValue.length > 1000) {
                    newFilterValue = filterValue.substring(0, 1000);
                } else {
                    newFilterValue = filterValue;
                }
                return this.defaultCalculateFilterExpression(
                    newFilterValue
                    , selectedFilterOperation
                );
            }
        }),
        new PhxDataTableColumn({
            dataField: 'UserNotes',
            caption: 'Processing Note'
        }),
        new PhxDataTableColumn({
            dataField: 'Id',
            caption: 'Action',
            cellTemplate: 'actionTemplate',
            allowFiltering: false,
            allowSorting: false,
            allowSearch: false,
            allowExporting: false,
            allowGrouping: false,
            fixed: true,
            fixedPosition: 'right',
        })

    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private loadingSpinnerService: LoadingSpinnerService,
        protected commonService: CommonService,
        private authService: AuthService,
        private navigationService: NavigationService,
        protected codeValueService: CodeValueService,
        private trnService: TransactionService,
        private orgService: OrganizationApiService,
        private dialogService: DialogService,
        private apiService: ApiService,
        private vmsService: VmsService,
        private localizationService: PhxLocalizationService,
    ) {
        this.phxConstants = PhxConstants;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.organizationIdInternal = +params['OrganizationIdInternal'];
            this.organizationIdClient = params['OrganizationIdClient'] === undefined ? 0 : +params['OrganizationIdClient'];
        });

        this.getOrganizationClients();
        this.getListOrganizationsInternal();
        this.workOrderVersionStatuses = this.getWorkorderVersionStatusLookup();

        this.route.data
            .subscribe(d => {
                this.routeData = d;
                this.initialDataSourceUrl = d.dataSourceUrl.toString().replace(':OrganizationIdInternal', this.organizationIdInternal);
                this.dataSourceUrl = this.initialDataSourceUrl.replace(':OrganizationIdClient', this.organizationIdClient);
                this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
                this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
                this.pageTitle = d.pageTitle || this.pageTitle;
                this.exportFileName = d.exportFileName || 'VmsDocuments';
            });

        this.navigationService.setTitle('thirdpartyimport-timesheet-conflict');

        this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
    }

    vmsRateType() {
        this.codeRateType = this.codeValueService.getCodeValues('workorder.CodeRateType', true)
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
                    value: codeValue.id
                };
            });
        return this.codeRateType;
    }

    getOrganizationClients() {
        const orgClientDataParams = oreq.request().withSelect(['ConflictCount', 'ClientOrgDisplayName', 'OrganizationIdClient', 'OrganizationIdInternal'])
            .withFilter(oreq.filter('OrganizationIdInternal').eq(this.organizationIdInternal).and().filter('ConflictCount').gt(0)).url();
        this.trnService.getOrganizationClients(orgClientDataParams)
            .subscribe(response => {
                this.OrgClients = response.Items;
            },
                error => {
                    console.log(error);
                }
            );
    }

    getListOrganizationsInternal() {
        const orgOrgDataParams = oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest'])
            .withFilter(oreq.filter('Id').ne(this.organizationIdInternal)).url();

        this.orgService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(orgOrgDataParams)
            .subscribe(response => {
                this.listOrganizationsInternal = response.Items;
            },
                error => {
                    console.log(error);
                });
    }

    getWorkorderVersionStatusLookup() {
        const codeValues = this.codeValueService.getCodeValues(CodeValueGroups.WorkOrderVersionStatus, true);
        return codeValues.map((i) => {
            return {
                value: i.id,
                text: i.text,
            };
        });
    }

    getRateType(rateTypeId) {
        const rate = this.codeRateType.find((x) => x.value === rateTypeId);
        return rate ? rate.text : 'N/A';
    }

    getWorkOrderVersionStatus(statusId) {
        const statusEntry = this.workOrderVersionStatuses.find((x) => x.value === statusId);
        return statusEntry && statusEntry.text;
    }

    transferOrganization(id) {
        this.transferToOrganization = id;
    }

    actionSelect(actionId) {
        if (!actionId) {
            this.actionSelectRemoved();
            return;
        }
        this.WorkOrderMappingDataset = null;
        this.WorkOrderMappingDatasetParent = null;
        this.phxTable.clearSelection();
        this.selectedAction = actionId;
        const isRevalidate = actionId === PhxConstants.StateAction.VmsTimesheetProcessedRecordAutoResolve;
        this.dataTableConfiguration.selectionMode = actionId && !isRevalidate ? PhxDataTableSelectionMode.Multiple : PhxDataTableSelectionMode.Single;

        if (isRevalidate) {
            this.revalidateRecords();
        }
    }

    actionSelectRemoved() {
        this.dataTableConfiguration.selectionMode = PhxDataTableSelectionMode.Single;
        this.WorkOrderMappingDataset = null;
        this.selectedAction = null;
    }

    revalidateRecords() {
        this.dialogService.confirm('Confirm', 'Do you want to revalidate all records?')
            .then((button) => {
                const commandName = this.codeValueService.getCodeValueCode(this.selectedAction, this.commonService.CodeValueGroups.StateAction);
                this.actionSelectRemoved();
                if (button === DialogResultType.Yes) {
                    this.loadingSpinnerService.show();
                    const payload = {
                        EntityIds: this.selectedIds,
                        EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
                        OrganizationIdInternal: this.organizationIdInternal,
                        OrganizationIdClient: this.organizationIdClient,
                    };
                    this.vmsService.executeStateCommand(commandName, payload)
                        .then(
                            (success: any) => {
                                this.loadingSpinnerService.hideAll();
                                if (success.ValidationMessages && success.ValidationMessages[0].Message > 0) {
                                    this.commonService.logSuccess(`${success.ValidationMessages[0].Message} number of conflicts have been resolved and moved to Pending transaction creation`);
                                }
                                this.refreshAndDecreaseCount(success.ValidationMessages[0].Message);
                            },
                            (error) => {
                                this.loadingSpinnerService.hideAll();
                                this.onErrorResponse(error, 'VMS Record object is not valid');
                            });
                }
            },
                () => {
                    this.actionSelectRemoved();
                });
    }

    newClientOrgSelected(id) {
        if (id) {
            this.router.navigate(['/next', 'transaction', 'vms-timesheet-conflict', 'search', this.organizationIdInternal, 'client', id]);
            this.dataSourceUrl = this.initialDataSourceUrl.replace(':OrganizationIdClient', id);
            this.actionSelectRemoved();
            this.WorkOrderMappingDataset = null;
        } else {
            this.organizationIdClientRemoved();
        }
    }

    organizationIdClientRemoved() {
        this.router.navigate(['/next', 'transaction', 'vms-timesheet-conflict', 'search', this.organizationIdInternal]);
        this.dataSourceUrl = null;
        this.actionSelectRemoved();
        this.WorkOrderMappingDataset = null;
    }


    selections(e: any) {
        if (e && e.selectedRowsData) {
            this.selectedIds = e.selectedRowsData.map((i: any) => { return i.Id; });
        } else {
            console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
        }
        this.ValidationMessages = {};
    }

    dxRowClick(e) {

        if (this.dataTableConfiguration.selectionMode === PhxDataTableSelectionMode.Single) {
            this.getWorkOrderMappings(e.data);
        }
    }

    dataReceived(data: any[]) {

        this.availableStateActions = _(data).map('AvailableStateActions').flatten().uniq().value();
        this.initStateActions();
        // this.stateActions = this.availableStateActions; // .filter(a => availableStateActions.includes(a.actionId));
        this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
    }

    initStateActions() {
        const self = this;

        this.stateActions = [
            { // change Internal Org
                actionId: PhxConstants.StateAction.VmsTimesheetProcessedRecordIntercompanyTransfer,
                displayText: 'Transfer',
                style: StateActionButtonStyle.PRIMARY,
                hiddenFn: (action, componentOption) => {
                    return this.selectedAction !== action.actionId;
                },
                disabledFn: (action, componentOption) => {
                    return !this.selectedIds || !(this.selectedIds.length > 0) || !this.transferToOrganization;
                },
                onClick: (action, componentOption, actionOption) => {
                    const payload = {
                        EntityIds: this.selectedIds,
                        EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
                        OrganizationIdInternal: this.transferToOrganization,
                    };
                    this.vmsService.executeStateCommand(action.commandName, payload)
                        .then(
                            (success: any) => {
                                this.loadingSpinnerService.hideAll();
                                self.refreshAndDecreaseCount(self.selectedIds.length || 0);
                            },
                            (error) => {
                                this.loadingSpinnerService.hideAll();
                                this.onErrorResponse(error, 'VMS Record object is not valid');
                            });

                }
            },
            { // Discard
                actionId: PhxConstants.StateAction.VmsTimesheetProcessedRecordDiscard,
                displayText: 'Delete Record',
                style: StateActionButtonStyle.PRIMARY,
                hiddenFn: (action, componentOption) => {
                    return this.selectedAction !== action.actionId;
                },
                disabledFn: (action, componentOption) => {
                    return !this.selectedIds || !(this.selectedIds.length > 0);
                },
                onClick: (action, componentOption, actionOption) => {
                    const payload = {
                        EntityIds: this.selectedIds,
                        EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
                    };
                    this.loadingSpinnerService.show();
                    this.vmsService.executeStateCommand(action.commandName, payload)
                        .then(
                            (success: any) => {
                                self.refreshAndDecreaseCount(self.selectedIds.length || 0);
                            },
                            (error) => {
                                this.loadingSpinnerService.hideAll();
                                this.onErrorResponse(error, 'VMS Record object is not valid');
                            });
                }
            },
            {
                actionId: PhxConstants.StateAction.VmsTimesheetProcessedRecordManualResolve,
                displayText: 'Resolve',
                style: StateActionButtonStyle.PRIMARY,
                hiddenFn: (action, componentOption) => {
                    return !(this.canEdit && !this.selectedAction && this.WorkOrderMappingDatasetParent && this.WorkOrderMappingDatasetParent.Id);
                },
                disabledFn: (action, componentOption) => {
                    return this.anythingToResolve();
                },
                onClick: (action, componentOption, actionOption) => {
                    this.resolve();
                }
            },
            { // cancel
                displayText: self.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.cancel),
                hiddenFn: (action, componentOption) => {
                    return !(
                        [PhxConstants.StateAction.VmsTimesheetProcessedRecordIntercompanyTransfer
                            , PhxConstants.StateAction.VmsTimesheetProcessedRecordDiscard
                            , PhxConstants.StateAction.VmsTimesheetProcessedRecordManualResolve].includes(self.selectedAction)
                        || (self.WorkOrderMappingDataset && self.WorkOrderMappingDataset.length > 0)
                    );
                },
                onClick: (action, componentOption, actionOption) => {
                    this.actionSelectRemoved();
                }
            },

        ];
    }

    getWorkOrderMappings(datarow: any) {
        let versions = _.filter(datarow.VMSWorkOrderVersions, (i: any) => i.OrganizationIdInternal === datarow.OrganizationIdInternal);

        versions = _.chain(versions)
            .filter(function (wv) {
                wv.StartDate = moment(wv.StartDate).toDate();
                wv.EndDate = wv.EndDate ? moment(wv.EndDate).toDate() : null;
                if (wv.VMSWorkOrderId === datarow.ThirdPartyWorkerId &&
                    wv.FirstName === datarow.FirstName && wv.LastName === datarow.LastName &&
                    wv.V1RateTypeId === datarow.V1RateTypeId &&
                    wv.V1BillRate === datarow.V1BillRate &&
                    wv.V2RateTypeId === datarow.V2RateTypeId &&
                    wv.V2BillRate === datarow.V2BillRate &&
                    wv.StartDate <= moment(datarow.StartDate).toDate() &&
                    wv.EndDate >= moment(datarow.EndDate).toDate()
                ) {
                    wv.TrnStartDate = JSON.parse(JSON.stringify(datarow.StartDate));
                    wv.TrnEndDate = JSON.parse(JSON.stringify(datarow.EndDate));
                    wv.V1BillUnits = datarow.V1BillUnits;
                    wv.V2BillUnits = datarow.V2BillUnits;
                }
                return wv.WorkOrderVersionId > 0;
            })
            .uniqBy('WorkOrderVersionId')
            .value();

        this.WorkOrderMappingDatasetParent = datarow;
        this.WorkOrderMappingDataset = versions;
        this.WorkOrderMappingDatasetOriginal = JSON.parse(JSON.stringify(versions));
    }

    conflictRowClick(wov, e) {
        switch (e.target.checked) {
            case true:
                const trnStartDate = moment(this.WorkOrderMappingDatasetParent.StartDate);
                wov.TrnStartDate = trnStartDate.isValid() ? trnStartDate.toDate() : null;
                const trnEndDate = moment(this.WorkOrderMappingDatasetParent.EndDate);
                wov.TrnEndDate = trnEndDate.isValid() ? trnEndDate.toDate() : null;
                wov.V1BillUnits = this.WorkOrderMappingDatasetParent.V1BillUnits;
                // wov.V1BillUnits = Math.max(this.WorkOrderMappingDatasetParent.V1BillUnits - _.sumBy(this.WorkOrderMappingDataset, (i) => +i.V1BillUnits), 0);
                if (this.WorkOrderMappingDatasetParent.V2BillUnits) {
                    wov.V2BillUnits = this.WorkOrderMappingDatasetParent.V2BillUnits;
                    // wov.V2BillUnits = Math.max(this.WorkOrderMappingDatasetParent.V2BillUnits - _.sumBy(this.WorkOrderMappingDataset, (i) => +i.V2BillUnits), 0);
                }
                break;
            default:
                // rollback
                const o = this.WorkOrderMappingDatasetOriginal.find(x => x.WorkOrderVersionId === wov.WorkOrderVersionId);
                wov.TrnStartDate = o.TrnStartDate;
                wov.TrnEndDate = o.TrnEndDate;
                wov.V1BillUnits = o.V1BillUnits;
                wov.V2BillUnits = o.V2BillUnits;
                break;
        }

    }

    getOrgClientListTemplate(obj: any) {
        return `<div class="pull-left" style="margin-top:-1px;margin-right:10px;z-index:100;pointer-events: none;">${obj['ClientOrgDisplayName']}</div>
     <span style="pointer-events: none;" class="pull-left badge badge-warning badge-conflict">${obj['ConflictCount']}</span>`;
    }

    setDate(dateProperty, e) {
        dateProperty = e.value;
    }

    formatDate(x) {
        return moment(x).format('MMM DD, YYYY');
    }

    anythingToResolve() {
        return this.WorkOrderMappingDataset && this.WorkOrderMappingDataset.filter(x => x.IsSelected).length === 0;
    }

    resolve() {
        if (this.WorkOrderMappingDataset instanceof Array) {
            const criticalErrors = this.validateCritical();
            if (criticalErrors.length > 0) {
                this.dialogService.notify('Errors on resolving conflicts', criticalErrors.join('<br>'));
            } else {
                const errors = this.validateNonCritical();
                if (errors.length > 0) {
                    this.dialogService.confirm('Warning', errors.join('<br><br>') + '  <br><br>Continue?')
                        .then((btn) => {
                            if (btn === DialogResultType.Yes) {
                                this.validateAndResolve();
                            }
                        }, (btn) => {
                        });
                } else {
                    this.validateAndResolve();
                }
            }
        }
    }

    validateCritical() {

        const errors = [];
        let item = null;
        const checkedRows = this.WorkOrderMappingDataset.filter(x => x.IsSelected);
        const parent = this.WorkOrderMappingDatasetParent;
   
        for (let i = 0; i < checkedRows.length; i++) {
            item = checkedRows[i];
            if (item.TrnStartDate == null ) {
                errors.push('Work Order Mapping records must have Start Date.');
                break;
            } else if (item.TrnEndDate == null ) {
                errors.push('Work Order Mapping records must have End Date.');
                break;
            }
        }
        return errors;
    }

    validateNonCritical() {
        const errors = [];
        let item = null;
        const checkedRows = this.WorkOrderMappingDataset.filter(x => x.IsSelected);
        const parent = this.WorkOrderMappingDatasetParent;
        for (let i = 0; i < checkedRows.length; i++) {
            item = JSON.parse(JSON.stringify(checkedRows[i]));
            if (moment(item.TrnStartDate) < moment(item.StartDate)) {
                if (moment(item.TrnEndDate) >= moment(item.StartDate) && moment(item.TrnEndDate) <= moment(item.EndDate)) {
                    errors.push(localizedContent.trnDateRange);
                    break;
                }
            } else {
                if (moment(item.TrnStartDate) < moment(item.EndDate) && moment(item.TrnEndDate) > moment(item.EndDate)) {
                    errors.push(localizedContent.trnDateRange);
                    break;
                }
            }
        }
        for (let i = 0; i < checkedRows.length; i++) {
            item = checkedRows[i];
            if ((parent.V1BillRate !== item.V1BillRate) || (item.V2BillRate > 0 && parent.V2BillRate > 0 && parent.V2BillRate !== item.V2BillRate)) {
                errors.push('VMS rate doesn\'t match selected Work Order Version rate.');
                break;
            }
        }

        for (let i = 0; i < checkedRows.length; i++) {
            item = checkedRows[i];
            if (item.V1BillRate > 0 && parent.V1BillUnits !== 0 && item.V1BillUnits === 0) {
                errors.push('VMS timesheet doesn\'t have any Units-1 to submit');
                break;
            }
        }

        for (let i = 0; i < checkedRows.length; i++) {
            item = checkedRows[i];
            if (item.V2BillRate > 0 && parent.V2BillUnits !== 0 && item.V2BillUnits === 0) {
                errors.push('VMS timesheet doesn\'t have any Units-2 to submit');
                break;
            }
        }

        let aggregateV1RateUnits = 0, aggregateV2RateUnits = 0;
        checkedRows.forEach(value => {
            value.V1BillUnits = (value && value.V1BillUnits) ? +((+value.V1BillUnits).toFixed(2)) : 0;
            value.V2BillUnits = (value && value.V2BillUnits) ? +((+value.V2BillUnits).toFixed(2)) : 0;
            aggregateV1RateUnits += value.V1BillUnits / 1;
            aggregateV2RateUnits += value.V2BillUnits / 1;
        });

        if (aggregateV1RateUnits >= parent.V1BillUnits && aggregateV1RateUnits !== 0) {
            if (aggregateV2RateUnits !== 0 && aggregateV2RateUnits < parent.V2BillUnits) {
                errors.push('Units aggregate less than VMS item Units.');
            }
        } else if (aggregateV1RateUnits !== 0) {
            errors.push('Units aggregate less than VMS item Units.');
        }

        return errors;
    }

    validateAndResolve() {
        const conflictedRows = this.WorkOrderMappingDataset.filter(x => x.IsSelected);

        if (conflictedRows.length > 0) {

            const errors = this.validateConflicts();
            if (errors.length > 0) {
                this.dialogService.notify('Errors on resolving conflicts', errors.join('<br>'));
            } else {

                const mapedConflicts = [];
                const rowsToResolve = JSON.parse(JSON.stringify(this.WorkOrderMappingDataset.filter(x => x.IsSelected)));
                rowsToResolve.forEach(value => {
                    const tempConflict = {
                        WorkOrderVersionId: value.WorkOrderVersionId,
                        V1RateTypeId: value.V1RateTypeId,
                        V1BillRate: value.V1BillRate,
                        V1BillUnits: value.V1BillUnits,
                        V2RateTypeId: value.V2RateTypeId,
                        V2BillRate: value.V2BillRate,
                        V2BillUnits: value.V2BillUnits,
                        TransactionStartDate: value.TrnStartDate,
                        TransactionEndDate: value.TrnEndDate
                    };
                    mapedConflicts.push(tempConflict);
                });

                const parent = this.WorkOrderMappingDatasetParent;
                const self = this;
                const payload = {
                    EntityIds: this.selectedIds,
                    EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
                    ...{ VmsProcessResolvedRecords: mapedConflicts }
                };
                const commandName = this.codeValueService.getCodeValueCode(PhxConstants.StateAction.VmsTimesheetProcessedRecordManualResolve, this.commonService.CodeValueGroups.StateAction);
                this.vmsService.executeStateCommand(commandName, payload)
                    .then(
                        (success: any) => {
                            this.loadingSpinnerService.hideAll();
                            self.commonService.logSuccess('Record resolved successfully');
                            self.refreshAndDecreaseCount(1);
                        },
                        (error) => {
                            this.loadingSpinnerService.hideAll();
                            this.onErrorResponse(error, 'VMS Record object is not valid');
                        });
            }
        }
    }

    onErrorResponse(responseError, message) {
        if (message && message.length > 0) {
            this.commonService.logError(message);
            this.ValidationMessages = responseError;
        }
    }

    refreshAndDecreaseCount(decreaseCount: number) {
        this.phxTable.grid.instance.refresh().then(() => {
            this.loadingSpinnerService.hideAll();
        });
        this.WorkOrderMappingDataset = null;
        const org = _.find(this.OrgClients, i => i.OrganizationIdClient === this.organizationIdClient);
        if (org) {
            org.ConflictCount = Math.max(org.ConflictCount - decreaseCount, 0);
            this.showClients = false;
            setTimeout(() => this.showClients = true, 100);
        }
    }

    validateConflicts(): any[] {
        const errors = [];
        let tempItem = null;

        const parent = this.WorkOrderMappingDatasetParent;
        const selectedMappings = this.WorkOrderMappingDataset.filter(x => x.IsSelected);

        for (let j = 0; j < selectedMappings.length; j++) {
            tempItem = JSON.parse(JSON.stringify(selectedMappings[j]));
            if (moment(tempItem.TrnStartDate) < moment(tempItem.StartDate) && (moment(tempItem.TrnEndDate) > moment(tempItem.EndDate) || moment(tempItem.TrnEndDate) < moment(tempItem.StartDate))) {
                errors.push(localizedContent.dateRangeError);
                break;
            }
            if (moment(tempItem.TrnStartDate) > moment(tempItem.EndDate)) {
                errors.push(localizedContent.startDateError);
                break;
            }
            if ((parent.V2BillUnits > 0) && ((parent.V2RateTypeId > 0 && parent.V2BillRate >= 0 && !tempItem.V2RateTypeId) || (tempItem.V2RateTypeId && tempItem.V2RateTypeId !== this.WorkOrderMappingDatasetParent.V2RateTypeId))) {
                errors.push('VMS item rate type 2 doesn\'t match the selected Work Order Version rate type 2.');
                break;
            }
            if ((parent.V1RateTypeId !== selectedMappings[j].V1RateTypeId)) {
                errors.push('VMS item rate type 1 doesn\'t match the selected Work Order Version rate type 1.');
                break;
            }
            if (selectedMappings[j].V1BillUnits < 0 || selectedMappings[j].V2BillUnits < 0) {
                errors.push(localizedContent.rateUnitNegative);
                break;
            }
        }

        let aggregateV1RateUnits = 0, aggregateV2RateUnits = 0;
        selectedMappings.forEach(value => {
            value.V1BillUnits = (value && value.V1BillUnits) ? +((+value.V1BillUnits).toFixed(2)) : 0;
            value.V2BillUnits = (value && value.V2BillUnits) ? +((+value.V2BillUnits).toFixed(2)) : 0;
            aggregateV1RateUnits += value.V1BillUnits / 1;
            aggregateV2RateUnits += value.V2BillUnits / 1;
        });

        if (aggregateV1RateUnits <= parent.V1BillUnits) {
            if (parent.V2BillUnits && parent.V2BillUnits !== '' && +aggregateV2RateUnits > parent.V2BillUnits) {
                errors.push('Units aggregate cannot exceed VMS item Units.');
            }
            if (!parent.V2BillUnits && aggregateV2RateUnits !== 0) {
                errors.push('Units aggregate cannot exceed VMS item Units.');
            }
        } else {
            errors.push('Units aggregate cannot exceed VMS item Units.');
        }

        return errors;
    }

    onV2BillRateChanged(wov, value) {
        const rate = wov['V2Rate' + value];
        wov.V2BillRate = rate;
        if (rate) {
            wov.V2RateTypeId = value;
        }
    }

    displayCurrencyCode(currencyId): string {
        // return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
        return '';
    }

    getCodeValue(codeTable: string) {
        return this.codeValueService.getCodeValues(codeTable, true)
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
                    id: codeValue.id,
                    code: codeValue.code,
                };
            });
    }

    editNote(item, event) {
        event.stopPropagation();
        const record = item.row.data;
        this.phxDialogComponentConfigModel = {
            HeaderTitle: 'Edit Note',
            Buttons: [
                { Id: 1, Name: 'Cancel', SortOrder: 1, Class: 'btn-default' },
                {
                    Id: 2, Name: 'Save', SortOrder: 2, CheckValidation: true, Class: 'btn-primary',
                    ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                        this.vmsService.updateVmsTimesheetProcessedRecordUserNotes({
                            EntityIds: [record.Id],
                            UserNotes: callBackObj.config.ObjectComment.Value
                        })
                            .then((response) => {
                                this.commonService.logSuccess('Note updated successfully.');
                                this.phxTable.refresh();
                            })
                            .catch((error) => {
                                this.commonService.logError('Error on updating note.', error);
                            });
                    }
                },
            ],
            ObjectComment: { Label: `Enter the note:`, HelpBlock: '', Value: record.UserNotes, IsRequared: false, LengthMin: 0, LengthMax: 256 },
        };
        this.phxDialogComponent.open();
    }

    ngOnDestroy() {
        if (this.unregisterList && this.unregisterList.length) {
            for (const sub of this.unregisterList) {
                if (sub && sub.unsubscribe) {
                    sub.unsubscribe();
                }
            }
        }
    }
}
