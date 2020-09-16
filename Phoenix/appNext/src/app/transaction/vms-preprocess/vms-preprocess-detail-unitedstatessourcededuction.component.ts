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
export class VmsPreprocessDetailUnitedstatessourcedeductionComponent extends VmsPreprocessDetailBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'PaymentTransactionNumber',
            caption: 'Transaction No',
        }),
        this.colDefs.lastName,
        new PhxDataTableColumn({
            dataField: 'Date',
            caption: 'Date',
            dataType: 'date',
            // cellTemplate: 'dateCellTemplate',
        }),
        new PhxDataTableColumn({
            dataField: 'GrossAmount',
            caption: 'Gross Amount',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'MedicareAmount',
            caption: 'Medicare',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'SocialSecurityAmount',
            caption: 'SocSec',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'FudiAmount',
            caption: 'Fudi',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'SuiAmount',
            caption: 'Sui',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'VmsUnitedStatesSourceDeductionImportedRecordTypeIdFinal',
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

        this.apiEndpointPathParameter = 'transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecords/';
        this.tableComponentNameSuffix = '-unitedstatessourcededuction';

        this.getRowCssClass = (record) => {
            return this.getRowCssClassBase(record.VmsUnitedStatesSourceDeductionImportedRecordTypeIdFinal, PhxConstants.VmsUnitedStatesSourceDeductionImportedRecordType);
        };

        this.downloadRecordFunc = this.vmsService.getVmsUnitedStatesSourceDeductionImportedRecord;

        this.markRecordAsReadyToProcess = (record) => {
            this.changeRecordType(record, PhxConstants.VmsUnitedStatesSourceDeductionImportedRecordType.PendingTransactionCreation, 'Import as Ready to Process');
        };

        this.markRecordAsDiscarded = (record) => {
            this.changeRecordType(record, PhxConstants.VmsUnitedStatesSourceDeductionImportedRecordType.Discarded, 'Discard');
        };

        this.markRecordAsConflict = (record) => {
            this.changeRecordType(record, PhxConstants.VmsUnitedStatesSourceDeductionImportedRecordType.Conflict, 'Import as Conflict');
        };

        this.editRecordNote = (record) => {
            this.openEditNoteDialog(record.UserNotes)
                .then((note) => {
                    this.detailService.updateVmsUnitedStatesSourceDeductionImportRecordUserNotes({
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
            return record.VmsUnitedStatesSourceDeductionImportedRecordTypeIdInitial;
        };
        this._initTableStateActions();
    }

    changeRecordType(record, newType: number, actionName: string) {
        this.createReasonDialog(record.UserNotes, actionName)
            .then((reason) => {
                this.vmsService.vmsUnitedStatesSourceDeductionImportRecordTypeUpdate({
                    EntityIds: [record.Id],
                    VmsUnitedStatesSourceDeductionImportedRecordTypeIdFinal: newType,
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
