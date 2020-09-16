import { Component, OnInit, Input, SimpleChange, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { ExpenseItem } from '../../model';
import { DocumentService } from '../../../common/services/document.service';
import { CommonService, PhxConstants, DialogService } from '../../../common';
import { PhxDocument, EntityList, PhxDocumentFileUploadConfiguration, PhxDocumentFileUploadFileItemActionEventArg, PhxDocumentFileUploaderOptions } from '../../../common/model';
import { ExpenseClaimService } from '../../service/expense-claim.service';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';
import { PhxLocalizationService } from '../../../common';

@Component({
  selector: 'app-expense-item-attachments',
  templateUrl: './expense-item-attachments.component.html',
  styleUrls: ['./expense-item-attachments.component.less']
})
export class ExpenseItemAttachmentsComponent implements OnInit, OnChanges {
  @Input() item: ExpenseItem;
  @Input() editable: boolean;

  @Output() onAddItemAttachment: EventEmitter<PhxDocumentFileUploadConfiguration> = new EventEmitter<PhxDocumentFileUploadConfiguration>();
  @Output() onPreviewAttachment: EventEmitter<PhxDocument> = new EventEmitter<PhxDocument>();

  docs: Array<PhxDocument> = [];
  oldId: number;
  expenseModuleResourceKeys: any;

  constructor(
    private documentService: DocumentService,
    private commonService: CommonService,
    private expenseClaimService: ExpenseClaimService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService,
  ) {
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.item && changes.item.currentValue) {
      if (this.oldId !== this.item.Id) {
        this.oldId = this.item.Id;
        this.loadAttachments(this.item.Id);
      }
    }
  }

  loadAttachments(expenseItemId: number) {
    this.docs = [];
    const expenseItemEntityType = PhxConstants.EntityType.ExpenseItem;
    this.documentService.getEntityDocuments(expenseItemEntityType, expenseItemId)
      .then((documents: EntityList<PhxDocument>) => {
        documents.Items.forEach(item => this.docs.push(item));
      });
  }

  createUploadConfiguration(): PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      UploadTitle: this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.uploadTitle),
      WorkflowPendingTaskId: 0,
      entityTypeId: PhxConstants.EntityType.ExpenseItem,
      entityId: this.item.Id,
      customId1: 0,
      customId2: 0,
      customMethodata: null,
      description: '',
      documentTypeId: PhxConstants.DocumentType.ExpenseItemDocument
    });
  }

  createSanitizeUrl(publicId: string): SafeResourceUrl {
    return this.documentService.createSanitizedThumbnailDocumentLink(publicId, 100, 100);
  }

  openFileUploader() {
    this.onAddItemAttachment.emit(this.createUploadConfiguration());
  }

  deleteAttachment(doc: PhxDocument) {
    const message = this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.deleteConfirmation, doc.Name);
    this.dialogService.confirmDelete(message).then((button) => {
      this.expenseClaimService.deleteExpenseItemAttachment(doc.EntityId, doc.PublicId)
        .then(() => {
          this.commonService.logSuccess(this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.successDelete, doc.Name));
          this.loadAttachments(this.item.Id);
        })
        .catch(err => {
          this.commonService.logError(this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.errorDelete, doc.Name));
        });
    });
  }

  openPreview(doc: PhxDocument) {
    this.onPreviewAttachment.emit(doc);
  }
}
