import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableSelectionMode, StateAction, StateActionButtonStyle, PhxConstants } from '../../common/model/index';
import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { DialogService, CommonService, CodeValueService, ApiService, LoadingSpinnerService } from '../../common/index';
import { VmsPreprocessDetailService } from './vms-preprocess-detail.service';
import { CodeValue } from '../../common/model/code-value';
import { PhxDialogComponentConfigModel, PhxDialogComponentEventEmitterInterface } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { AuthService } from '../../common/services/auth.service';


export class VmsPreprocessDetailBaseComponent implements OnInit {

    // Virtual properties - begin
    apiEndpointPathParameter: string;
    getRowCssClass: (record: any) => string;
    tableComponentNameSuffix: string;
    downloadRecordFunc: (recordId: number) => Promise<any>;
    markRecordAsReadyToProcess: (record: any) => void;
    markRecordAsConflict: (record: any) => void;
    markRecordAsDiscarded: (record: any) => void;
    editRecordNote: (record: any) => void;
    getRecordTypeIdInitial: (record: any) => number;
    hasAccess: boolean = false;
    // Virtual properties - end

    documentPublicId: string;
    showTable: boolean = true;
    dataSourceUrl: string;

    @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
    phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
    tableStateActions: StateAction[];

    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>({
        pageSize: 1000,
        selectionMode: PhxDataTableSelectionMode.None,
    }));
    @ViewChild('phxTable') phxTable: PhxDataTableComponent;
    columns: Array<PhxDataTableColumn>;

    currencyColumnFormat = { type: 'fixedPoint', precision: 2 };

    // Common columns
    colDefs = {
        importDate: new PhxDataTableColumn({
            dataField: 'UploadedDatetime',
            caption: 'Import Date',
            dataType: 'date',
        }),
        workOrderReference: new PhxDataTableColumn({
            dataField: 'WorkOrderReference',
            caption: 'Third Party Worker ID',
        }),
        workOrderReferenceShort: new PhxDataTableColumn({
            dataField: 'WorkOrderReference',
            caption: 'Worker ID',
        }),
        firstName: new PhxDataTableColumn({
            dataField: 'FirstName',
            caption: 'First Name',
        }),
        lastName: new PhxDataTableColumn({
            dataField: 'LastName',
            caption: 'Last Name',
        }),
        startDate: new PhxDataTableColumn({
            dataField: 'StartDate',
            caption: 'From',
            dataType: 'date',
        }),
        endDate: new PhxDataTableColumn({
            dataField: 'EndDate',
            caption: 'To',
            dataType: 'date',
        }),
        reason: new PhxDataTableColumn({
            dataField: 'Reason',
            caption: 'Reason',
            encodeHtml: false,
        }),
        userNotes: new PhxDataTableColumn({
            dataField: 'UserNotes',
            caption: 'Processing Note',
            encodeHtml: false,
        }),
        type: new PhxDataTableColumn({
            dataField: 'VmsImportedRecordTypeIdFinal',
            caption: 'Import To',
            lookup: {
                dataSource: this.getTypeLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
        action: new PhxDataTableColumn({
            dataField: 'Id',
            caption: 'Action',
            cellTemplate: 'ChangeRecordTypeTemplate',
            allowFiltering: false,
            allowSorting: false,
            allowSearch: false,
            allowExporting: false,
            allowGrouping: false,
            fixed: true,
            fixedPosition: 'right',
        })
    };


    constructor(
        protected commonService: CommonService,
        private route: ActivatedRoute,
        protected detailService: VmsPreprocessDetailService,
        private dialogService: DialogService,
        public codeValueService: CodeValueService,
        private authService: AuthService
    ) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.documentPublicId = params.get('docPublicId');
            if (this.documentPublicId) {
                this.loadRecords();
            }
        }
        );

        setTimeout(() => {
            if (this.phxTable && this.phxTable.grid && this.phxTable.grid.instance) {
                this.phxTable.grid.instance.option('rowAlternationEnabled', false);
            }
        }, 200);
        this.hasAccess = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.VMSImport);
    }

    loadRecords = () => {
        this.dataSourceUrl = this.apiEndpointPathParameter + this.documentPublicId;
        this.showTable = false;
        setTimeout(() => { this.showTable = true; }, 100);
        this.detailService.refreshTotals(this.documentPublicId);
    }

    refreshPhxTable() {
        this.phxTable.refresh();
    }

    getRowCssClassBase(recordTypeId: number,
        recordTypes:
        typeof PhxConstants.VmsCommissionImportedRecordType |
        typeof PhxConstants.VmsDiscountImportedRecordType |
        typeof PhxConstants.VmsExpenseImportedRecordType |
        typeof PhxConstants.VmsFixedPriceImportedRecordType |
        typeof PhxConstants.VmsImportedRecordType |
        typeof PhxConstants.VmsUnitedStatesSourceDeductionImportedRecordType
    ) {
        switch (recordTypeId) {
            case recordTypes.PendingTransactionCreation:
                return 'bg-success';
            case recordTypes.Conflict:
                return 'bg-warning';
            case recordTypes.Discarded:
                return 'bg-danger';
            default:
                return null;
        }
    }
    onRowPrepare(event) {
        if (event && (event.rowType === 'data')) {
            // event.rowElement.css('background-color', 'red');
            const classList = event.rowElement && event.rowElement.classList;
            if (classList) {
                classList.remove('bg-success');
                classList.remove('bg-warning');
                classList.remove('bg-danger');
                const rowClass = this.getRowCssClass(event.data);
                if (rowClass) {
                    classList.add(rowClass);
                }
            }
        }
    }

    markAsReadyToProcess(item) {
        this.markRecordAsReadyToProcess(item.row.data);
    }

    markAsConflict(item) {
        this.markRecordAsConflict(item.row.data);
    }

    markAsDiscarded(item) {
        this.markRecordAsDiscarded(item.row.data);
    }

    editNote(item) {
        this.editRecordNote(item.row.data);
    }

    onRecordTypeChanged(record) {
        this.downloadRecordFunc(record.Id)
            .then(
                (response) => {
                    // record.LastModifiedDatetime = response.Queryable[0].LastModifiedDatetime;
                    this.refreshPhxTable();
                    this.detailService.refreshTotals(this.documentPublicId);
                    this.commonService.logSuccess('Record status changed.');
                },
                (error) => { }
            );
    }

    createReasonDialog(note, actionName) {
        return new Promise((resolve, reject) => {
            this.phxDialogComponentConfigModel = {
                HeaderTitle: actionName,
                Buttons: [
                    { Id: 1, Name: 'Cancel', SortOrder: 1, Class: 'btn-default', ClickEvent: reject },
                    {
                        Id: 2, Name: 'Ok', SortOrder: 2, CheckValidation: true, Class: 'btn-primary',
                        ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                            resolve(callBackObj.config.ObjectComment.Value);
                        }
                    },
                ],
                ObjectComment: { Label: `Enter the note to ${actionName}:`, HelpBlock: '', Value: note, IsRequared: true, LengthMin: 3, LengthMax: 256 },
            };
            this.phxDialogComponent.open();
        });
    }

    openEditNoteDialog(note) {
        return new Promise((resolve, reject) => {
            this.phxDialogComponentConfigModel = {
                HeaderTitle: 'Edit Note',
                Buttons: [
                    { Id: 1, Name: 'Cancel', SortOrder: 1, Class: 'btn-default', ClickEvent: reject },
                    {
                        Id: 2, Name: 'Save', SortOrder: 2, CheckValidation: true, Class: 'btn-primary',
                        ClickEvent: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
                            resolve(callBackObj.config.ObjectComment.Value);
                        }
                    },
                ],
                ObjectComment: { Label: `Enter the note:`, HelpBlock: '', Value: note, IsRequared: false, LengthMin: 0, LengthMax: 256 },
            };
            this.phxDialogComponent.open();
        });
    }

    canChangeType(record) {
        return this.getRecordTypeIdInitial(record) !== PhxConstants.VmsImportedRecordType.Error;
    }

    canMarkAsReadyToProcess(item) {
        const cssClass = this.getRowCssClass(item.row.data);
        return (cssClass !== 'bg-success') && this.canChangeType(item.row.data)
            && (this.getRecordTypeIdInitial(item.row.data) === PhxConstants.VmsImportedRecordType.PendingTransactionCreation) && this.hasAccess;
    }

    canMarkAsConflict(item) {
        const cssClass = this.getRowCssClass(item.row.data);
        return (cssClass !== 'bg-warning') && this.canChangeType(item.row.data) && this.hasAccess;
    }

    canMarkAsDiscarded(item) {
        const cssClass = this.getRowCssClass(item.row.data);
        return (cssClass !== 'bg-danger') && this.canChangeType(item.row.data) && this.hasAccess;
    }

    getTypeLookup() {
        const codeValueGroups = this.commonService.CodeValueGroups;
        const lookup = this.codeValueService.getCodeValues(codeValueGroups.VmsImportedRecordType, true)
            .map((i: CodeValue) => {
                return {
                    value: i.id,
                    text: i.text,
                };
            });
        // let lookup = [
        //    { value: 1, text: 'To Process' },
        //    { value: 2, text: 'Conflict' },
        //    { value: 3, text: 'Discarded' },
        //    { value: 4, text: 'Error' },
        //    { value: 5, text: 'Completed' },
        // ];
        return lookup;
    }

    _initTableStateActions() {
        const self = this;
        self.tableStateActions = [
            { // Mark as Ready to Process
                displayText: 'Mark as Ready to Process',    // TODO - replace with actionId
                skipSecurityCheck: true,
                style: StateActionButtonStyle.WARNING,

                // TODO - remove this logic once state action is ready!! this is old workflow stuff.
                hiddenFn: function (action, componentOption) {
                    return !self.canMarkAsReadyToProcess(componentOption.refData);
                },
                onClick: function (action, componentOption, actionOption) {
                    // TODO - call new command once state action is ready!!
                    self.markAsReadyToProcess(componentOption.refData);
                }
            },
            { // Mark as Conflict
                displayText: 'Mark as Conflict',    // TODO - replace with actionId
                skipSecurityCheck: true,
                style: StateActionButtonStyle.WARNING,

                // TODO - remove this logic once state action is ready!! this is old workflow stuff.
                hiddenFn: function (action, componentOption) {
                    return !self.canMarkAsConflict(componentOption.refData);
                },
                onClick: function (action, componentOption, actionOption) {
                    // TODO - call new command once state action is ready!!
                    self.markAsConflict(componentOption.refData);
                }
            },
            { // Mark as Discarded
                displayText: 'Mark as Discarded',    // TODO - replace with actionId
                skipSecurityCheck: true,
                style: StateActionButtonStyle.WARNING,

                // TODO - remove this logic once state action is ready!! this is old workflow stuff.
                hiddenFn: function (action, componentOption) {
                    return !self.canMarkAsDiscarded(componentOption.refData);
                },
                onClick: function (action, componentOption, actionOption) {
                    // TODO - call new command once state action is ready!!
                    self.markAsDiscarded(componentOption.refData);
                }
            },
            { // Edit Note
                displayText: 'Edit Note',    // TODO - replace with actionId
                skipSecurityCheck: true,

                // TODO - remove this logic once state action is ready!! this is old workflow stuff.
                hiddenFn: function (action, componentOption) {
                    return !self.hasAccess;
                },
                onClick: function (action, componentOption, actionOption) {
                    // TODO - call new command once state action is ready!!
                    self.editNote(componentOption.refData);
                }
            }
        ];
    }
}
