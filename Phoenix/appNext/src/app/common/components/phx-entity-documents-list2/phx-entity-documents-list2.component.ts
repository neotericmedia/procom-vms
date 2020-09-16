import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { PhxConstants } from '../..';
import { PhxDocument, EntityList, PhxDataTableConfiguration, PhxDataTableColumn } from '../../model';
import { CommonService } from '../../services/common.service';
import { CodeValueService } from '../../services/code-value.service';
import { isEqual, cloneDeep, forEach, sortBy } from 'lodash';
import * as moment from 'moment';
import { DialogService } from '../../services/dialog.service';
import { PhxDataTableComponent } from '../phx-data-table/phx-data-table.component';

declare var oreq: any;

@Component({
    selector: 'phx-entity-documents-list2',
    templateUrl: './phx-entity-documents-list2.component.html',
    styleUrls: ['./phx-entity-documents-list2.component.less']
})
export class PhxEntityDocumentsList2Component implements OnInit {

    @Input() entityTypeId: PhxConstants.EntityType;
    @Input() entityId: number;
    @Input() canDeleteDocumentFn: Function;
    @Input() documentTypesList: PhxConstants.DocumentType[];
    @Output() rowClick = new EventEmitter<PhxDocument>();
    @Output() contextMenuOpenTab = new EventEmitter<PhxDocument>();
    @Output() documentDeleteFailed = new EventEmitter<any>();
    @ViewChild('grd') grd: PhxDataTableComponent;

    totalColumnFormat = { type: 'fixedPoint', precision: 2 };
    dataSourceUrl: string;
    columns: Array<PhxDataTableColumn> = [];
    dataGridComponentName: string = 'DocumentSearch';
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        showOpenInNewTab: true
    });

    constructor(private documentService: DocumentService,
        private commonService: CommonService,
        private dialogs: DialogService) {
    }

    ngOnInit() {
        this.dataSourceUrl = `document/${this.entityTypeId}/${this.entityId}`;
        this.columns = [
            new PhxDataTableColumn({
                dataField: 'Name',
                caption: 'File Name',
                dataType: 'string',
                width: 400,
                allowFiltering: true,
            }),
            new PhxDataTableColumn({
                dataField: 'UploadedByFullName',
                caption: 'Uploaded By',
                dataType: 'string'
            }),
            new PhxDataTableColumn({
                dataField: 'DocumentTypeId',
                caption: 'Document Type',
                dataType: 'string',
                lookup: {
                    dataSource: this.documentTypesList,
                    valueExpr: 'id',
                    displayExpr: 'text'
                }
            }),
            new PhxDataTableColumn({
                dataField: 'UploadedDatetime',
                caption: 'Date',
                dataType: 'date'
            }),
            new PhxDataTableColumn({
                dataField: 'PublicId',
                caption: '',
                dataType: 'string',
                cellTemplate: 'actionCellTemplate',
                allowExporting: false,
                allowFiltering: false,
                allowSorting: false,
                allowGrouping: false,
                allowSearch: false
            }),
        ];
    }

    oDataParams: string;
    oDataParameterSelectFields: string = oreq
        .request()
        .withSelect(['Name', 'UploadedByFullName', 'DocumentTypeId', 'UploadedDatetime', 'PublicId'])
        .url();

    canDeleteDocument(document: PhxDocument) {
        if (this.canDeleteDocumentFn) {
            return this.canDeleteDocumentFn(document);
        } else {
            return true;
        }
    }

    documentDelete(document: PhxDocument) {
        const that = this;
        const dlg = this.dialogs.confirm('Document Delete', 'This document will be deleted. Continue?');
        dlg.then((btn) => {
            this.documentService.deleteDocumentByPublicId(document.PublicId).then(
                (responseSucces) => {
                    if (responseSucces.IsValid) {
                        this.loadDocumentsList();
                    }
                },
                (responseError) => {
                    this.loadDocumentsList();
                    if (this.documentDeleteFailed) {
                        this.documentDeleteFailed.emit();
                    } else {
                        // this.html.validationMessages = this.commonService.parseResponseError(responseError);
                        this.commonService.parseResponseError(responseError).forEach(m => {
                            this.commonService.logError(m.Message);
                        });
                    }
                }
            );
        }, (btn) => {
            console.log('User cancelled the operation');
        });
    }

    loadDocumentsList() {
        this.grd.refresh();
    }

    getPdfStreamByPublicId(publicId: string) {
        return this.documentService.createPdfDocumentLink(publicId);
    }

    onRowClick($event) {
        if (this.rowClick) {
            this.rowClick.emit($event);
        }
    }

    onContextMenuOpenTab($event) {
        if (this.contextMenuOpenTab) {
            this.contextMenuOpenTab.emit($event);
        }
    }
}
