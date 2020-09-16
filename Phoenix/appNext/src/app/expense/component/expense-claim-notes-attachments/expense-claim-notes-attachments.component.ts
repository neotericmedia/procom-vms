import { PhxDocument } from './../../../common/model/phx-document';
import { CommonService } from '../../../common/services/common.service';
import { DocumentService } from './../../../common/services/document.service';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { ExpenseClaim, ExpenseClaimStatus } from './../../model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DialogService } from '../../../common/services/dialog.service';
import { PhxDocumentFileUploadConfiguration, PhxDocumentFileUploadFileItemActionEventArg } from '../../../common/model/index';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';
import { PhxLocalizationService } from '../../../common';
import { PhxDocumentFileUploadResourceKeys } from '../../../common/components/phx-document-file-upload/phx-document-file-upload.resource-keys';

@Component({
  selector: 'app-expense-claim-notes-attachments',
  templateUrl: './expense-claim-notes-attachments.component.html',
  styleUrls: ['./expense-claim-notes-attachments.component.less']
})
export class ExpenseClaimNotesAttachmentsComponent implements OnInit, OnDestroy {
  expenseClaim: ExpenseClaim;
  id: number;
  editable = true;
  isAlive: boolean = true;

  documentList: Array<PhxDocument> = [];
  documentUploadConfiguration: PhxDocumentFileUploadConfiguration;
  uploadedBy = 'Uploaded by:';
  formatDateTimeHM: any;
  categoryIds: Array<number> = [];
  documentUploadableExtraStatuses = [ExpenseClaimStatus.PendingSupportingDocumentUpload, ExpenseClaimStatus.PendingSupportingDocumentReview];
  documentRemovableExtraStatuses = [ExpenseClaimStatus.PendingSupportingDocumentReview];
  expenseModuleResourceKeys: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private expenseClaimService: ExpenseClaimService,
    private documentService: DocumentService,
    private commonService: CommonService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService,
  ) {
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.formatDateTimeHM = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy_HH_mm;

    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadExpense(this.id);
      });

  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadExpense(id: number, force: boolean = false) {
    this.expenseClaimService.getExpenseClaim(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.expenseClaim = data;
        this.setExpenseClaimEditableStatus(this.expenseClaim);

        if (this.expenseClaim && this.expenseClaim.Id) {
          this.documentUploadConfiguration = new PhxDocumentFileUploadConfiguration({
            UploadTitle: this.localizationService.translate(ExpenseModuleResourceKeys.notesAndAttachments.uploadTitle),
            WorkflowPendingTaskId: data.WorkflowPendingTaskId,
            entityTypeId: this.commonService.ApplicationConstants.EntityType.ExpenseClaim,
            entityId: this.expenseClaim.Id,
            customId1: 0,
            customId2: 0,
            customMethodata: null,
            description: '',
            documentTypeId: this.commonService.ApplicationConstants.DocumentType.ExpenseClaimDocument
          });

          // set the unique expense categories
          const expenseItems = this.expenseClaim.ExpenseItems;
          if (expenseItems) {
            for (const expenseItem of expenseItems) {
              if (this.categoryIds.indexOf(expenseItem.ExpenseCategory.Id) < 0) {
                this.categoryIds.push(expenseItem.ExpenseCategory.Id);
              }
            }
          }

          this.loadDocuments();
        }

      });

    this.expenseClaimService.getExpenseClaimDocumentByIdFromState(id)
      .takeWhile(() => this.isAlive)
      .subscribe((dt: Array<PhxDocument>) => {
        this.documentList = dt || [];
      });
  }

  setExpenseClaimEditableStatus(expenseClaim: ExpenseClaim) {
    this.expenseClaimService.isEditable(expenseClaim)
      .first()
      .subscribe((data) => this.editable = data);
  }

  updateProp(field: string, val: any) {
    this.expenseClaim[field] = val;
    this.expenseClaimService.updateExpenseClaimState(this.expenseClaim);

    this.expenseClaimService.executePartialSaveCommand(this.expenseClaim.Id, this.expenseClaim.WorkOrderId, field, val);

  }

  createPdfDocumentLink(doc: PhxDocument): string {
    return this.documentService.createPdfDocumentLink(doc.PublicId);
  }

  loadDocuments() {
    this.expenseClaimService.getExpenseClaimDocumentById(this.expenseClaim.Id, true);
  }

  getUploadCompleteNotification(event: PhxDocumentFileUploadFileItemActionEventArg) {
    if (event && event.response) {
      this.commonService.logSuccess(this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadSuccessMessage, [event.item.file.name]), event);
    }
  }

  onUploadComplete() {
    this.expenseClaimService.getExpenseClaim(this.expenseClaim.Id, null, true);
    this.loadDocuments();
  }

  deleteDocument(doc: PhxDocument) {
    const message = this.localizationService.translate(ExpenseModuleResourceKeys.notesAndAttachments.uploadTitle, [doc.Name]);
    this.dialogService.confirmDelete(message).then((button) => {
      this.expenseClaimService.deleteDocument(
        this.expenseClaim.Id,
        doc.PublicId
      );
    });
  }
}
