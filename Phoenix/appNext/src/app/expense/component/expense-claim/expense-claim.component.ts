import { NavigationService } from './../../../common/services/navigation.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { ExpenseItem, ExpenseClaim, ExpenseClaimStatus } from './../../model';
import { StateService } from '../../../common/state/state.module';
import { DialogService } from '../../../common/services/dialog.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PhxDocumentFileUploadComponent } from '../../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { PhxDocumentFileUploaderOptions, PhxDocumentFileUploadFileItemActionEventArg, PhxDocumentFileUploadConfiguration, PhxDocument, PhxButton, DialogResultType } from '../../../common/model';
import { CommonService, WindowRefService, PhxLocalizationService } from '../../../common';
import { ExpenseItemComponent } from '../expense-item/expense-item.component';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../../common/services/document.service';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';
import { PhxDocumentFileUploadResourceKeys } from '../../../common/components/phx-document-file-upload/phx-document-file-upload.resource-keys';
import { PhxModalComponent } from '../../../common/components/phx-modal/phx-modal.component';

@Component({
  selector: 'app-expense-claim',
  templateUrl: './expense-claim.component.html',
  styleUrls: ['./expense-claim.component.less'],
})
export class ExpenseClaimComponent implements OnInit, OnDestroy {
  expenseClaim: ExpenseClaim;
  id: number;
  editable: boolean = true;
  isAlive: boolean = true;
  expenseModuleResourceKeys: any;
  itemButtons: Array<PhxButton>;

  @ViewChild('itemModal') itemModal: PhxModalComponent;
  @ViewChild('previewModal') previewModal: any;
  @ViewChild('itemFileUpload') itemFileUpload: PhxDocumentFileUploadComponent;
  @ViewChild('expenseItem') expenseItem: ExpenseItemComponent;

  private _currentItem: ExpenseItem;
  set currentItem(val: ExpenseItem) {
    this._currentItem = val;
    this.expenseClaimService.updateCurrentExpenseItemState(this._currentItem);
  }
  get currentItem(): ExpenseItem {
    return this._currentItem;
  }

  currentAttachment: PhxDocument;
  currentAttachmentUrl: SafeResourceUrl;

  isItemRemoveButtoVisible = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private state: StateService,
    private expenseClaimService: ExpenseClaimService,
    private navigationService: NavigationService,
    private dialogService: DialogService,
    private commonService: CommonService,
    private documentService: DocumentService,
    private winRef: WindowRefService,
    private localizationService: PhxLocalizationService,
  ) {
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.initItemButtons();
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

  printExpenseClaim() {
    this.expenseClaimService.printExpenseClaim(this.expenseClaim);
  }

  loadExpense(id: number, force: boolean = false) {
    this.expenseClaimService.getExpenseClaim(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.expenseClaim = data;
        this.setExpenseClaimEditableStatus(this.expenseClaim);
      });
  }

  setExpenseClaimEditableStatus(expenseClaim: ExpenseClaim) {
    this.expenseClaimService.isEditable(expenseClaim)
      .first()
      .subscribe((data) => {
        this.editable = data;
        this.initItemButtons();
      });
  }

  itemSelected(event) {
    const item = JSON.parse(JSON.stringify(event));
    this.editItem(item);
  }

  addItem() {
    if (this.expenseClaim.CurrencyId == null || this.expenseClaim.CurrencyId === 0) {
      this.dialogService.error('Error', 'Please select currency!');
      return;
    }

    this.isItemRemoveButtoVisible = false;
    this.setCurrentItem(
      <ExpenseItem>{
        ExpenseClaimId: this.expenseClaim.Id,
        WorkOrderId: this.expenseClaim.WorkOrderId,
        CurrencyId: this.expenseClaim.CurrencyId,
        DateIncurred: new Date()
      });

    this.itemModal.show();
  }

  editItem(item) {
    this.setCurrentItem(item);
    this.isItemRemoveButtoVisible = true;
    this.itemModal.show();
  }

  cancelItem() {
    this.expenseClaimService.updateCurrentExpenseItemState(null);
    this.itemModal.hide();
  }

  onSaveItem(message: string): void {
    this.saveItem();
  }

  onRemoveItem(message: string): void {
    this.removeItem();
  }

  saveItem() {
    this.expenseClaimService.getCurrentExpenseItemFromState()
      .first()
      .subscribe(data => {
        this.setCurrentItem(data);
        this.expenseClaimService.saveExpenseItem(this.currentItem).then((item) => {
          this.setCurrentItem(<ExpenseItem>item);
          this.expenseClaimService.updateExpenseItemState(this.currentItem);
          this.itemModal.hide();
        });
      });
  }

  removeItem() {
    this.expenseClaimService.deleteExpenseItem(this.currentItem.Id, this.currentItem.LastModifiedDatetime).then(() => {
      this.expenseClaimService.removeExpenseItemFromState(this.currentItem);
      this.setCurrentItem(null);
      this.itemModal.hide();
    });
  }

  setCurrentItem(data: ExpenseItem) {
    this.currentItem = data;
    this.initItemButtons();
  }

  closeItem() {
    this.expenseClaimService.updateCurrentExpenseItemState(null);
    this.itemModal.hide();
  }

  openItemUploadDialog(config: PhxDocumentFileUploadConfiguration) {
    const fileUploaderOptions: PhxDocumentFileUploaderOptions = {
      queueLimit: 10,
      maxFileSize: 20 * 1024 * 1024,
      allowedFileType: [
        'compress',
        'xls',
        'ppt',
        'image',
        'pdf',
        'doc',
      ],
    };
    this.itemFileUpload.configuration = config;
    this.itemFileUpload.showModal(fileUploaderOptions);
  }

  itemUploadCompleteNotification(event: PhxDocumentFileUploadFileItemActionEventArg) {
    if (event && event.response) {
      this.expenseItem.loadAttachments();
      this.commonService.logSuccess(this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadSuccessMessage, [event.item.file.name]), event);
    }
  }

  previewAttachment(doc: PhxDocument) {
    if (['jpg', 'png', 'jpeg', 'bmp', 'gif'].includes(doc.Extension.toLowerCase())) {
      this.currentAttachment = doc;
      this.currentAttachmentUrl = this.documentService.createSanitizedDocumentLink(doc.PublicId);
      this.previewModal.show();
    } else {
      this.winRef.nativeWindow.open(this.documentService.createDocumentLink(doc.PublicId), '_blank');
    }
  }

  closePreview() {
    this.currentAttachment = null;
    this.currentAttachmentUrl = null;
    this.previewModal.hide();
  }

  initItemButtons() {
    if (this.editable === true && this.currentItem && this.currentItem.ExpenseCategoryId) {
      this.itemButtons = [
        {
          icon: 'done',
          tooltip: this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.saveBtn),
          btnType: 'primary',
          action: () => { this.onSaveItem('save'); }
        },
        {
          icon: 'delete_forever',
          tooltip: this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.removeBtn),
          btnType: 'default',
          action: () => {
            this.dialogService.confirmDelete().then((button) => {
              if (button === DialogResultType.Yes) {
                this.removeItem();
              }
            });
          }
        },
        {
          icon: 'clear',
          tooltip: this.localizationService.translate(ExpenseModuleResourceKeys.itemAdd.cancelBtn),
          btnType: 'default',
          action: () => { this.cancelItem(); }
        },
      ];
    } else {
      this.itemButtons = [];
    }
  }
}
