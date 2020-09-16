import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhxConstants } from '../../../common';
import { ExpenseClaimService } from '../../service/expense-claim.service';
import { PhxWorkflowEventHistoryComponent } from '../../../common/components/phx-workflow-event-history/phx-workflow-event-history.component';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-expense-claim-history',
  templateUrl: './expense-claim-history.component.html',
  styleUrls: ['./expense-claim-history.component.less']
})
export class ExpenseClaimHistoryComponent implements OnInit, OnDestroy {
  @ViewChild('wokflowHistory') wokflowHistory: PhxWorkflowEventHistoryComponent;

  entityTypeId: number;
  id: number;
  isAlive: boolean = true;
  changeHistoryBlackList: any[];
  expenseModuleResourceKeys: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private expenseClaimService: ExpenseClaimService,
  ) {
    this.entityTypeId = PhxConstants.EntityType.ExpenseClaim;
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadExpense(this.id);
      });

	this.setupChangeHistoryBlackList();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadExpense(id: number, force: boolean = false) {
    this.expenseClaimService.getExpenseClaim(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.reloadHistory();
      });
  }

  reloadHistory() {
    if (this.wokflowHistory) {
      this.wokflowHistory.reload();
    }
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
	  { TableSchemaName: '', TableName: '', ColumnName: 'GroupName' },

	  { TableSchemaName: 'expense', TableName: 'ExpenseClaim', ColumnName: 'WorkOrderId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseClaim', ColumnName: 'WorkOrderVersionIdAtSubmission' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseClaim', ColumnName: 'ExpenseClaimStatusId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseClaim', ColumnName: 'IsCustomFieldVersionLocked' },
	  
	  { TableSchemaName: 'expense', TableName: 'ExpenseItem', ColumnName: 'ExpenseClaimId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItem', ColumnName: 'WorkOrderId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItem', ColumnName: 'ExpenseCategoryId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItem', ColumnName: 'ExpenseCategoryTemplateVersionId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItem', ColumnName: 'ProjectId' },
	  
	  { TableSchemaName: 'expense', TableName: 'ExpenseItemTaxLine', ColumnName: 'ExpenseItemId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItemTaxLine', ColumnName: 'SalesTaxVersionRateId' },

	  { TableSchemaName: 'expense', TableName: 'ExpenseItemFieldValue', ColumnName: 'ExpenseItemId' },
      { TableSchemaName: 'expense', TableName: 'ExpenseItemFieldValue', ColumnName: 'ExpenseCategoryFieldDefinitionId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItemFieldValue', ColumnName: 'ExpenseCategoryFieldListValueId' },
	  { TableSchemaName: 'expense', TableName: 'ExpenseItemFieldValue', ColumnName: 'ExpenseCategoryFieldTextValue' },
	  
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
}
