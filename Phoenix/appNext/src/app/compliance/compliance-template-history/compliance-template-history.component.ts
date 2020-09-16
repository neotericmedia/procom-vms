import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { ComplianceTemplateService, ComplianceTemplate } from '../shared/index';

@Component({
  selector: 'app-compliance-template-history',
  templateUrl: './compliance-template-history.component.html',
  styleUrls: ['./compliance-template-history.component.less']
})
export class ComplianceTemplateHistoryComponent implements OnInit, OnDestroy {
  entityTypeId: number;
  entityId: number;
  changeHistoryBlackList: any[];
  template: ComplianceTemplate;
  isAlive: boolean = true;

  templateDocumentType = PhxConstants.DocumentType.ComplianceTemplateTemplate;
  sampleDocumentType = PhxConstants.DocumentType.ComplianceTemplateSample;

  constructor(
    private route: ActivatedRoute,
    private complianceTemplateService: ComplianceTemplateService

  ) { }

  ngOnInit() {
    this.route.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.entityId = +params['Id'];
        this.loadTemplate(this.entityId);
      });

    this.entityTypeId = PhxConstants.EntityType.ComplianceTemplate;

    this.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'ComplianceDocumentTypeId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'ComplianceTemplateId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'ComplianceTemplateRestrictionTypeId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' }
    ];
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadTemplate(id: number, force: boolean = false) {
    this.complianceTemplateService.getTemplateById(id, null, force)
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe((data) => {
        this.template = data;
      });
  }

}
