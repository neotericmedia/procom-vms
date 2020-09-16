import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PhxConstants } from '../../common/index';


@Component({
  selector: 'app-document-type-history',
  templateUrl: './document-type-history.component.html',
  styleUrls: ['./document-type-history.component.less']
})
export class DocumentTypeHistoryComponent implements OnInit {
  entityTypeId: number;
  @Input() entityId: number;
  changeHistoryBlackList: any[];

  constructor() { }

  ngOnInit() {
    this.entityTypeId = PhxConstants.EntityType.UserDefinedCodeComplianceDocumentType;

    this.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'UserDefinedCodeComplianceDocumentTypeStatusId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'SortOrder' },
      { TableSchemaName: '', TableName: '', ColumnName: 'TableName' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsSystem' },
      { TableSchemaName: '', TableName: '', ColumnName: 'ParentId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'ParentTableName' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Code' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Value' }
    ];
  }
}
