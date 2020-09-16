import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, DialogService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import * as moment from 'moment';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxDataTableShowCheckboxesMode, StateAction, StateActionDisplayType, StateActionButtonStyle, PhxConstants } from '../../common/model/index';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';
import { PhoenixCommonModuleResourceKeys } from '../../common/PhoenixCommon.module';

import { Router, ActivatedRoute } from '@angular/router';

import { TransactionService } from '../transaction.service';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { DialogResultType } from './../../common/model/index';
import { ApiService } from './../../common/services/api.service';
import * as _ from 'lodash';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { VmsService } from '../shared/Vms.service';
import { AuthService } from '../../common/services/auth.service';

declare var oreq: any;
const localizedContent = {

    trnDateRange: 'One of the transaction dates is outside the range of the work order date',
    dateRangeError: 'Transaction dates should be within Work Order Version Effective dates.',
    startDateError: 'Transaction start date cannot be greater than end date.'
};

@Component({
    selector: 'app-vms-transaction-fixedprice-conflict-search',
    templateUrl: './vms-transaction-fixedprice-conflict-search.component.html',
    styleUrls: ['./vms-transaction-fixedprice-conflict-search.component.less']
})
export class VmsTransactionFixedPriceConflictSearchComponent implements OnInit, OnDestroy {

    routeData: any;
    codeValueGroups: any;
    selectedAction: any;
    OrgClients: any[];
    organizationIdInternal: any;
    organizationIdClient: any;
    showClients: boolean = true;
    listOrganizationsInternal: any[];
    transferToOrganization: any;
    exportFileName: string;
    WorkOrderMappingDataset: any[] = null;
    WorkOrderMappingDatasetOriginal: any[];
    WorkOrderMappingDatasetParent: any;
    codeRateType: any[];
    canEdit: boolean = false;
    phxConstants: typeof PhxConstants = null;
    @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
    phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

    @ViewChild('phxTable') phxTable: PhxDataTableComponent;
    @ViewChild('phxTableWorkOrderMappings') phxTableWorkOrderMappings: PhxDataTableComponent;
    // Action dropdown options
    actionsArr: any = [
        { Id: 1, actionId: PhxConstants.StateAction.VmsFixedPriceProcessedRecordIntercompanyTransfer, DisplayName: 'Inter-Company Change' },
        { Id: 2, actionId: PhxConstants.StateAction.VmsFixedPriceProcessedRecordDiscard, DisplayName: 'Delete Record' },
        { Id: 3, actionId: PhxConstants.StateAction.VmsFixedPriceProcessedRecordAutoResolve, DisplayName: 'Revalidate Records' }
    ];
    actions: any[] = [];
    notifyName: any;
    unregisterList: any[] = [];
    ValidationMessages: any;
    pageTitle: string = 'Search';
    dataSourceUrl: string;
    stateActions: StateAction[] = [];
    availableStateActions: StateAction[];
    selectedIds: any[] = [];
    initialDataSourceUrl: string;
    dataGridComponentName: string = 'ConflictSearch';
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        selectionMode: PhxDataTableSelectionMode.Single,
        showFilter: true,
        enableExport: true,
        // showCheckBoxesMode:PhxDataTableShowCheckboxesMode.Always
    });
    dataTableConfigurationWorkOrderMappings: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        selectionMode: PhxDataTableSelectionMode.Single,
        columnHidingEnabled: true,
        stateSavingMode: PhxDataTableStateSavingMode.None,
        enableExport: false,
        showColumnChooser: false,
        showGrouping: false,
        showSearch: false,
        showTotalCount: false,
        noDataText: 'There are no Work Orders associated with selected Vms Fixed Price item.'
    });
    oDataParams: string;
    oDataParameterSelectFields: string;
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
            dataField: 'AmountBillable',
            caption: 'Fixed Bill Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'AmountPayable',
            caption: 'Fixed Pay Amount',
            alignment: 'right',
            dataType: 'decimal',
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
            caption: 'Processing Note',
            encodeHtml: false,
        }),
        new PhxDataTableColumn({
            dataField: 'Id',
            caption: 'Action',
            cellTemplate: 'actionTemplate',
            allowFiltering: false,
            allowSearch: false,
            allowSorting: false,
            allowExporting: false,
            allowGrouping: false,
            fixed: true,
            fixedPosition: 'right',
        })

    ];
    columnsWorkOrderMappings: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'WorkOrderNumber',
            caption: 'Work Order Number'
        }),
        new PhxDataTableColumn({
            dataField: 'WorkOrderId',
            caption: 'Work Order Id'
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
            dataField: 'StartDate',
            caption: 'Start Date',
            dataType: 'date',
        }),
        new PhxDataTableColumn({
            dataField: 'EndDate',
            caption: 'End Date',
            dataType: 'date',
        }),
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
        this.codeValueGroups = this.commonService.CodeValueGroups;
        this.phxConstants = PhxConstants;
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.organizationIdInternal = +params['OrganizationIdInternal'];
            this.organizationIdClient = params['OrganizationIdClient'] === undefined ? 0 : +params['OrganizationIdClient'];
        });

        this.getOrganizationClients();
        this.getListOrganizationsInternal();

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
        this.navigationService.setTitle('thirdpartyimport-fixedprice-conflict');

        this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
        if (!this.canEdit) {
            this.dataTableConfigurationWorkOrderMappings.selectionMode = PhxDataTableSelectionMode.None;
        }
    }

    getOrganizationClients() {
        const orgClientDataParams = oreq.request().withSelect(['FixedPriceConflictCount', 'ClientOrgDisplayName', 'OrganizationIdClient', 'OrganizationIdInternal'])
            .withFilter(oreq.filter('OrganizationIdInternal').eq(this.organizationIdInternal).and().filter('FixedPriceConflictCount').gt(0)).url();
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
                }
            );
    }

    newClientOrgSelected(id) {
        if (id) {
            this.router.navigate(['/next', 'transaction', 'vms-fixedprice-conflict', 'search', this.organizationIdInternal, 'client', id]);
            this.dataSourceUrl = this.initialDataSourceUrl.replace(':OrganizationIdClient', id);
            this.actionSelectRemoved();
            this.WorkOrderMappingDataset = null;
        } else {
            this.organizationIdClientRemoved();
        }
    }

    organizationIdClientRemoved() {
        this.router.navigate(['/next', 'transaction', 'vms-fixedprice-conflict', 'search', this.organizationIdInternal]);
        this.dataSourceUrl = null;
        this.actionSelectRemoved();
        this.WorkOrderMappingDataset = null;
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
        const isRevalidate = actionId === PhxConstants.StateAction.VmsFixedPriceProcessedRecordAutoResolve;
        this.dataTableConfiguration.selectionMode = this.selectedAction && !isRevalidate ? PhxDataTableSelectionMode.Multiple : PhxDataTableSelectionMode.Single;
        this.WorkOrderMappingDataset = null;
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
                        EntityTypeId: PhxConstants.EntityType.VmsCommissionProcessedRecord,
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

    dxRowClick(e) {
        if (this.dataTableConfiguration.selectionMode === PhxDataTableSelectionMode.Single) {
            const rowData: any = e.data;
            this.WorkOrderMappingDatasetParent = rowData;
            this.WorkOrderMappingDataset = _.cloneDeep(rowData.VmsFixedPriceWorkOrders);
            this.WorkOrderMappingDatasetOriginal = rowData.VmsFixedPriceWorkOrders;
            // tslint:disable-next-line:no-unused-expression
            this.phxTableWorkOrderMappings && this.phxTableWorkOrderMappings.clearSelection();
            this.ValidationMessages = null;
        }
    }

    dataReceived(data: any[]) {
        this.availableStateActions = _(data).map('AvailableStateActions').flatten().uniq().value();
        this.initStateActions();
        this.canEdit = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
        // this.actions = this.actionsArr.filter(a => availableActions.find(action => action.CommandName === a.CommandName));
        // if (this.actions.length > 0) {
        //   this.actions.push({ Id: 3, CommandName: 'VmsFixedPriceRevalidateRecords', DisplayName: 'Revalidate Records' });
        // }
    }

    selections(e: any) {
        if (e && e.selectedRowsData) {
            this.selectedIds = e.selectedRowsData.map((i: any) => { return i.Id; });
        } else {
            console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
        }
    }

    selectedItemCount() {
        return (this.phxTable && this.phxTable.grid && this.phxTable.grid.instance && this.phxTable.grid.instance.getSelectedRowKeys().length) || 0;
    }

    selectedConflictItemCount() {
        return (this.phxTableWorkOrderMappings && this.phxTableWorkOrderMappings.grid && this.phxTableWorkOrderMappings.grid.instance && this.phxTableWorkOrderMappings.grid.instance.getSelectedRowKeys().length) || 0;
    }

    private getTaskIdsToBatch(): number[] {
        const selectedRows: any = this.phxTable.grid.instance.getSelectedRowsData();
        const taskIdsToBatch = _.map(selectedRows, (item: any) => {
            return item.WorkflowPendingTaskId;
        });
        return taskIdsToBatch;
    }

    resolve() {

        if (this.phxTableWorkOrderMappings.getSelectedRowsData() instanceof Array) {
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

    validateNonCritical() {
        const errors = [];
        let item = null;
        const checkedRows = this.phxTableWorkOrderMappings.getSelectedRowsData();
        const parent = this.WorkOrderMappingDatasetParent;
        for (let i = 0; i < checkedRows.length; i++) {
            item = JSON.parse(JSON.stringify(checkedRows[i]));
            if (moment(parent.StartDate) < moment(item.StartDate)) {
                if (moment(parent.EndDate) >= moment(item.StartDate) && moment(parent.EndDate) <= moment(item.EndDate)) {
                    errors.push(localizedContent.trnDateRange);
                    break;
                }
            } else {
                if (moment(parent.StartDate) < moment(item.EndDate) && moment(parent.EndDate) > moment(item.EndDate)) {
                    errors.push(localizedContent.trnDateRange);
                    break;
                }
            }
        }
        return errors;
    }
    validateAndResolve() {
        const parent = this.WorkOrderMappingDatasetParent;
        const conflictedRows = this.phxTableWorkOrderMappings.getSelectedRowsData();

        if (conflictedRows.length > 0) {

            const errors = this.validateConflicts();
            if (errors.length > 0) {
                this.dialogService.notify('Errors on resolving conflicts', errors.join('<br>'));
            } else {
                const commandName = this.codeValueService.getCodeValueCode(PhxConstants.StateAction.VmsFixedPriceProcessedRecordManualResolve, this.commonService.CodeValueGroups.StateAction);
                this.trnService.executeStateCommand(commandName,
                    {
                        EntityTypeId: PhxConstants.EntityType.VmsCommissionProcessedRecord,
                        EntityIds: [parent.Id],
                        WorkOrderId: this.phxTableWorkOrderMappings.getSelectedRowsData()[0].WorkOrderId
                    }
                ).then(
                    (success) => {
                        this.commonService.logSuccess('Record resolved successfully');
                        this.refreshAndDecreaseCount(1);
                    },
                    (error) => {
                        this.onErrorResponse(error, 'VMS Record object is not valid');
                    });
            }
        }
    }

    validateConflicts(): any[] {
        const errors = [];
        let tempItem = null;

        const parent = this.WorkOrderMappingDatasetParent;
        const selectedMappings = this.phxTableWorkOrderMappings.getSelectedRowsData();

        for (let j = 0; j < selectedMappings.length; j++) {
            tempItem = JSON.parse(JSON.stringify(selectedMappings[j]));
            if (moment(parent.StartDate) < moment(tempItem.StartDate) && (moment(parent.EndDate) > moment(tempItem.EndDate) || moment(parent.EndDate) < moment(tempItem.StartDate))) {
                errors.push(localizedContent.dateRangeError);
                break;
            }
            if (moment(parent.StartDate) > moment(tempItem.EndDate)) {
                errors.push(localizedContent.startDateError);
                break;
            }
        }
        return errors;
    }

    onErrorResponse(responseError, message) {
        if (message && message.length > 0) {
            this.commonService.logError(message);
            // [{PropertyName: 'WOrkorderId', Message: "abc"}]
            // const validationMessages = this.commonService.responseErrorMessages(responseError, null);
            // this.commonService.logValidationMessages(validationMessages);
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
            org.FixedPriceConflictCount = Math.max(org.FixedPriceConflictCount - decreaseCount, 0);
            this.showClients = false;
            setTimeout(() => this.showClients = true, 100);
        }
    }

    onContentReady(event) {
        const disabled: boolean = this.WorkOrderMappingDatasetParent.ValidationMessages.indexOf('not Fixed Price Eligible') >= 0;
        // event.element.find('.dx-select-checkbox').dxCheckBox('instance').option('disabled', disabled);
    }

    onRowPrepare(event) {
        if (event.rowType === 'data') {

        }
    }

    onCellPrepared(event) {
        const disabled: boolean = this.WorkOrderMappingDatasetParent.ValidationMessages.indexOf('not Fixed Price Eligible') >= 0;
        if (event.rowType === 'data' && event.column.command === 'select' && disabled) {
            // event.cellElement.find('.dx-select-checkbox').dxCheckBox('instance').option('disabled', true);
            // event.cellElement.off();
        }
    }

    onEditorPreparing(event) {

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

    anythingToResolve() {
        return this.selectedConflictItemCount() === 0;
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
                        this.vmsService.updateVmsFixedPriceProcessedRecordUserNotes({
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

    initStateActions() {
        const self = this;

        this.stateActions = [
            { // change Internal Org
                actionId: PhxConstants.StateAction.VmsFixedPriceProcessedRecordIntercompanyTransfer,
                displayText: 'Transfer',
                skipSecurityCheck: true,
                style: StateActionButtonStyle.PRIMARY,
                hiddenFn: (action, componentOption) => {
                    return this.selectedAction !== action.actionId;
                },
                disabledFn: (action, componentOption) => {
                    return !this.selectedItemCount || !(this.selectedIds.length > 0) || !this.transferToOrganization;
                },
                onClick: (action, componentOption, actionOption) => {
                    const payload = {
                        EntityIds: this.selectedIds,
                        EntityTypeId: PhxConstants.EntityType.VmsFixedPriceProcessedRecord,
                        OrganizationIdInternal: this.transferToOrganization,
                    };
                    this.trnService.executeStateCommand(action.commandName, payload)
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
                actionId: PhxConstants.StateAction.VmsFixedPriceProcessedRecordDiscard,
                displayText: 'Delete Record',
                skipSecurityCheck: true,
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
                        EntityTypeId: PhxConstants.EntityType.VmsFixedPriceProcessedRecord,
                    };
                    this.loadingSpinnerService.show();
                    this.trnService.executeStateCommand(action.commandName, payload)
                        .then(
                            (success: any) => {
                                self.refreshAndDecreaseCount(this.selectedIds.length || 0);
                            },
                            (error) => {
                                this.loadingSpinnerService.hideAll();
                                this.onErrorResponse(error, 'VMS Record object is not valid');
                            });
                }
            },
            { // Resolve
                actionId: PhxConstants.StateAction.VmsFixedPriceProcessedRecordManualResolve,
                displayText: 'Resolve',
                style: StateActionButtonStyle.PRIMARY,
                skipSecurityCheck: true,
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
                skipSecurityCheck: true,
                hiddenFn: (action, componentOption) => {
                    return !(
                        [PhxConstants.StateAction.VmsFixedPriceProcessedRecordIntercompanyTransfer
                            , PhxConstants.StateAction.VmsFixedPriceProcessedRecordDiscard
                            , PhxConstants.StateAction.VmsFixedPriceProcessedRecordManualResolve].includes(self.selectedAction)
                        || (self.WorkOrderMappingDataset && self.WorkOrderMappingDataset.length > 0)
                    );
                },
                onClick: (action, componentOption, actionOption) => {
                    this.actionSelectRemoved();
                }
            },

        ];
    }

}
