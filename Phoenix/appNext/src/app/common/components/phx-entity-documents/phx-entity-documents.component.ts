import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PhxConstants, CommonService } from '../../index';
import { DocumentService } from '../../services/document.service';
import { PhxDataTableConfiguration, PhxDataTableColumn } from '../../model/index';

declare var oreq: any;

@Component({
  selector: 'app-phx-entity-documents',
  templateUrl: './phx-entity-documents.component.html',
  styleUrls: ['./phx-entity-documents.component.less']
})
export class PhxEntityDocumentsComponent implements OnInit, OnChanges {

  @Input() entityTypeId: PhxConstants.EntityType;
  @Input() entityId: number;
  @Input() documentTypeId: PhxConstants.DocumentType;
  @Input() activePublicId: string;
  @Input() showStatusColumn: boolean = false;

  oDataParams: string = oreq.request()
    .withOrderby(['UploadedDatetime desc'])
    .url();

  componentName: string = 'EntityDocuments';

  dateColumnFormat = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy_HH_mm;
  dataSourceUrl: string = '';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});

  columns: Array<PhxDataTableColumn>;

  constructor(
    private commonService: CommonService,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.createColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.entityTypeId || changes.entityId || changes.documentTypeId) {
      this.dataSourceUrl = `document/${this.entityTypeId}/${this.entityId}/${this.documentTypeId}`;
    }

    if (changes.entityTypeId || changes.documentTypeId) {
      this.componentName = `EntityDocuments-${this.entityTypeId}-${this.documentTypeId}`;
    }
  }

  createColumns() {

    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Name',
        caption: 'Name',
        dataType: 'string',
        cellTemplate: 'NameTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'UploadedDatetime',
        caption: 'Uploaded Date time',
        dataType: 'date',
        cellTemplate: 'dateCellTemplate',
        sortOrder: 'desc',
      }),
      new PhxDataTableColumn({
        dataField: 'UploadedByFullName',
        caption: 'Uploaded By',
        dataType: 'string',
      }),
    ];

    if (this.showStatusColumn === true) {
      this.columns.push(
        new PhxDataTableColumn({
          dataField: 'PublicId',
          caption: 'Status',
          dataType: 'string',
          allowExporting: false,
          allowFiltering: false,
          allowSorting: false,
          allowSearch: false,
          cellTemplate: 'StatusTemplate'
        }),
      );
    }
  }

  createPdfDocumentLink(publicId: string) {
    return this.documentService.createPdfDocumentLink(publicId);
  }

}
