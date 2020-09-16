import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableColumn } from '../../common/model/index';
import { DialogService, CommonService, CodeValueService, ApiService, PhxConstants } from '../../common/index';
import { CodeValue } from '../../common/model/code-value';
import { VmsPreprocessDetailBaseComponent } from './vms-preprocess-detail-base.component';
import { VmsPreprocessDetailService } from './vms-preprocess-detail.service';
import { VmsService } from '../shared/Vms.service';
import { AuthService } from '../../common/services/auth.service';

@Component({
    templateUrl: './vms-preprocess-detail-base.component.html',
    styleUrls: ['./vms-preprocess-detail-base.component.less']
})
export class VmsPreprocessDetailTimesheetComponent extends VmsPreprocessDetailBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        this.colDefs.workOrderReference,
        this.colDefs.importDate,
        this.colDefs.firstName,
        this.colDefs.lastName,
        new PhxDataTableColumn({
            dataField: 'V1RateTypeId',
            caption: 'Rate Type 1',
            lookup: {
                dataSource: this.rateType(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
        new PhxDataTableColumn({
            dataField: 'V1BillRate',
            caption: 'Bill Rate 1',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'V1BillUnits',
            caption: 'Rate Units 1',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'V2RateTypeId',
            caption: 'Rate Type 2',
            lookup: {
                dataSource: this.rateType(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
        new PhxDataTableColumn({
            dataField: 'V2BillRate',
            caption: 'Bill Rate 2',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'V2BillUnits',
            caption: 'Rate Units 2',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'InvoiceReference',
            caption: 'TRN. Reference',
        }),
        this.colDefs.startDate,
        this.colDefs.endDate,

        new PhxDataTableColumn({
            dataField: 'VmsImportedRecordTypeIdFinal',
            caption: 'Import To',
            lookup: {
                dataSource: this.getTypeLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
        this.colDefs.reason,
        this.colDefs.userNotes,
        this.colDefs.action,
    ];

    constructor(
        commonService: CommonService,
        route: ActivatedRoute,
        private vmsService: VmsService,
        private apiService: ApiService,
        detailService: VmsPreprocessDetailService,
        dialogService: DialogService,
        codeValueService: CodeValueService,
        authService: AuthService
    ) {
        super(commonService, route, detailService, dialogService, codeValueService, authService);

        this.apiEndpointPathParameter = 'transactionHeader/getVmsTimesheetImportedRecords/';
        this.tableComponentNameSuffix = '-timesheet';

        this.getRowCssClass = (record) => {
            return this.getRowCssClassBase(record.VmsImportedRecordTypeIdFinal, PhxConstants.VmsImportedRecordType);
        };

        this.downloadRecordFunc = this.vmsService.getVmsTimesheetImportedRecord;

        this.markRecordAsReadyToProcess = (record) => {
            this.changeRecordType(record, PhxConstants.VmsImportedRecordType.PendingTransactionCreation, 'Import as Ready to Process');
        };

        this.markRecordAsDiscarded = (record) => {
            this.changeRecordType(record, PhxConstants.VmsImportedRecordType.Discarded, 'Discard');
        };

        this.markRecordAsConflict = (record) => {
            this.changeRecordType(record, PhxConstants.VmsImportedRecordType.Conflict, 'Import as Conflict');
        };

        this.editRecordNote = (record) => {
            this.openEditNoteDialog(record.UserNotes)
                .then((note) => {
                    this.detailService.updateVmsTimesheetImportRecordUserNotes({
                        EntityIds: [record.Id],
                        UserNotes: note
                    })
                        .then((response) => {
                            this.commonService.logSuccess('Note updated successfully.');
                            this.refreshPhxTable();
                        })
                        .catch((error) => {
                            this.commonService.logError('Error on updating note.', error);
                        });
                },
                    function (error) { }
                );
        };

        this.getRecordTypeIdInitial = (record) => {
            return record.VmsImportedRecordTypeIdInitial;
        };

        this._initTableStateActions();
    }

    changeRecordType(record, newType: number, actionName: string) {
        this.createReasonDialog(record.UserNotes, actionName)
            .then((reason) => {
                this.vmsService.vmsTimesheetImportRecordTypeUpdate({
                    EntityIds: [record.Id],
                    VmsImportedRecordTypeIdFinal: newType,
                    UserNotes: reason,
                })
                    .then(
                        (response) => {
                            this.onRecordTypeChanged(record);
                        },
                        (error) => {
                            this.commonService.logError('Record is not valid.', error);
                        }
                    );
            },
                function (error) { }
            );
    }

    rateType() {
        const codeValueGroups = this.commonService.CodeValueGroups;
        return this.codeValueService.getCodeValues(codeValueGroups.RateType, true) // 'workorder.CodeRateType'
            .map((i: CodeValue) => {
                return {
                    value: i.id,
                    text: i.text,
                };
            });
    }

}
