import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableColumn } from '../../common/model/index';
import { DialogService, CommonService, CodeValueService, ApiService, LoadingSpinnerService, PhxConstants } from '../../common/index';
import { VmsPreprocessDetailBaseComponent } from './vms-preprocess-detail-base.component';
import { VmsPreprocessDetailService } from './vms-preprocess-detail.service';
import { VmsService } from '../shared/Vms.service';
import { AuthService } from '../../common/services/auth.service';

@Component({
    templateUrl: './vms-preprocess-detail-base.component.html',
    styleUrls: ['./vms-preprocess-detail-base.component.less']
})
export class VmsPreprocessDetailFixedPriceComponent extends VmsPreprocessDetailBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'WorkOrderReference',
            caption: 'VMS WorkOrder',
        }),
        this.colDefs.importDate,
        this.colDefs.firstName,
        this.colDefs.lastName,
        this.colDefs.startDate,
        this.colDefs.endDate,
        new PhxDataTableColumn({
            dataField: 'BillAmount',
            caption: 'Bill Amount',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'PayAmount',
            caption: 'Pay Amount',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'VmsInvoiceReference',
            caption: 'Invoice ID',
        }),
        new PhxDataTableColumn({
            dataField: 'VmsFixedPriceImportedRecordTypeIdFinal',
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
        detailService: VmsPreprocessDetailService,
        dialogService: DialogService,
        private apiService: ApiService,
        codeValueService: CodeValueService,
        authService: AuthService
    ) {
        super(commonService, route, detailService, dialogService, codeValueService, authService);

        this.apiEndpointPathParameter = 'vms/getVmsFixedPriceImportedRecords/';
        this.tableComponentNameSuffix = '-fixedprice';

        this.getRowCssClass = (record) => {
            return this.getRowCssClassBase(record.VmsFixedPriceImportedRecordTypeIdFinal, PhxConstants.VmsFixedPriceImportedRecordType);
        };

        this.downloadRecordFunc = this.vmsService.getVmsFixedPriceImportedRecord;

        this.markRecordAsReadyToProcess = (record) => {
            this.changeRecordType(record, PhxConstants.VmsFixedPriceImportedRecordType.PendingTransactionCreation, 'Import as Ready to Process');
        };

        this.markRecordAsDiscarded = (record) => {
            this.changeRecordType(record, PhxConstants.VmsFixedPriceImportedRecordType.Discarded, 'Discard');
        };

        this.markRecordAsConflict = (record) => {
            this.changeRecordType(record, PhxConstants.VmsFixedPriceImportedRecordType.Conflict, 'Import as Conflict');
        };

        this.editRecordNote = (record) => {
            this.openEditNoteDialog(record.UserNotes)
                .then((note) => {
                    this.detailService.updateVmsFixedPriceImportRecordUserNotes({
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
            return record.VmsFixedPriceImportedRecordTypeIdInitial;
        };
        this._initTableStateActions();
    }

    changeRecordType(record, newType: number, actionName: string) {
        this.createReasonDialog(record.UserNotes, actionName)
            .then((reason) => {
                this.vmsService.vmsFixedPriceImportRecordTypeUpdate({
                    EntityIds: [record.Id],
                    VmsFixedPriceImportedRecordTypeIdFinal: newType,
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


}
