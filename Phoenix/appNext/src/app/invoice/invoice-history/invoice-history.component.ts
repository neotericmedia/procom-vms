import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhxConstants } from '../../common';
import { InvoiceService } from '../shared/invoice.service';
import { PhxWorkflowEventHistoryComponent } from '../../common/components/phx-workflow-event-history/phx-workflow-event-history.component';

@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.less']
})
export class InvoiceHistoryComponent implements OnInit, OnDestroy {
  @ViewChild('wokflowHistory') wokflowHistory: PhxWorkflowEventHistoryComponent;

  entityTypeId: number;
  id: number;
  isAlive: boolean = true;
  changeHistoryBlackList: any[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private invoiceService: InvoiceService
  ) {
    this.entityTypeId = PhxConstants.EntityType.Invoice;
  }

  ngOnInit() {
    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadInvoice(this.id);
      });

    this.setupChangeHistoryBlackList();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  setupChangeHistoryBlackList() {
    this.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'InvoiceId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'InvoiceTransactionId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationClientRoleAlternateBillId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'BillingTransactionId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'BillingInvoiceTermId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'DocumentId' },

	  { TableSchemaName: 'inv', TableName: 'InvoiceRecipient', ColumnName: 'InvoiceRecipientTypeId' },
	  { TableSchemaName: 'inv', TableName: 'InvoiceRecipient', ColumnName: 'InvoiceRecipientUserProfileId' },
	  { TableSchemaName: 'inv', TableName: 'InvoiceRecipient', ColumnName: 'DeliveryMethodId' },

      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'PublicId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'ParentId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'ServerDocumentId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'ServerName' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'BatchId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'Extension' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'Size' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'Description' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'EntityTypeId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'EntityId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'DocumentTypeId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'UploadedByProfileId' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'ContentType' },
      { TableSchemaName: 'dbo', TableName: 'Document', ColumnName: 'UploadedDatetime' },
    ];
  }

  loadInvoice(id: number, force: boolean = false) {
    this.invoiceService.getInvoice(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.reloadWorkflowHistory();
      });
  }

  reloadWorkflowHistory() {
    if (this.wokflowHistory) {
      this.wokflowHistory.reload();
    }
  }
}
