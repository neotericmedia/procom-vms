import { select } from '@angular-redux/store';
import { Component, OnInit, Output, EventEmitter, Input, OnDestroy, Inject, ViewChild } from '@angular/core';
import { DocumentService } from '../../common/services/document.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonService, PhxConstants, WindowRefService, CodeValuePipe, ReportService, DatexPipe, PhxLocalizationService } from '../../common';
import { Invoice, InvoiceExtension, InvoiceBillingTransaction, InvoiceTransactionDocument } from '../shared';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../shared/invoice.service';
import { DxTreeViewComponent } from 'devextreme-angular';
import { uuid } from '../../common/PhoenixCommon.module';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice-billing-transaction-documents',
  templateUrl: './invoice-billing-transaction-documents.component.html',
  styleUrls: ['./invoice-billing-transaction-documents.component.less']
})
export class InvoiceBillingTransactionDocumentsComponent implements OnInit, OnDestroy {
  @ViewChild('treeview') treeview: DxTreeViewComponent;

  INVOICE_TYPE = 1;
  TRANSACTION_TYPE = 2;
  DOCUMENT_TYPE = 3;
  RECIPIENT_TYPE = 4;

  invoice: Invoice;
  id: number;

  formatDate: string;
  editable: boolean = true;
  isAlive: boolean = true;
  forceEdit: boolean = false;
  isCurrentUserHasClientRelatedRoles: boolean = true;

  currentTransaction: any = {};
  currentDoc: any = {};
  currentPublicId: string = null;
  currentItemType: number;
  url: SafeResourceUrl;
  isInvoiceLoading: boolean = false;
  tree = [];

  codeValueGroups: any;
  invoiceModuleResourceKeys: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private documentService: DocumentService,
    private commonService: CommonService,
    private invoiceService: InvoiceService,
    private winRef: WindowRefService,
    private codeValuePipe: CodeValuePipe,
    private datePipe: DatexPipe,
    private reportService: ReportService,
    private localizationService: PhxLocalizationService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {

    this.invoiceService.isCurrentUserHasClientRelatedRoles()
      .takeWhile(() => this.isAlive)
      .subscribe((result: boolean) => {
        this.isCurrentUserHasClientRelatedRoles = result;
        this.activatedRoute.parent.params
          .takeWhile(() => this.isAlive)
          .subscribe((params) => {
            this.id = +params['Id'];
            this.loadInvoice(this.id);
          });
      });

  }

  ngOnDestroy() {
    this.isAlive = false;
  }


  loadInvoice(id: number, force: boolean = false) {
    this.invoiceService.getInvoice(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {

        let oldStatus: PhxConstants.InvoiceStatus = null;
        if (this.invoice) {
          oldStatus = this.invoice.StatusId;
        }

        this.invoice = data;
        this.setInvoiceEditableStatus(this.invoice, this.forceEdit);

        if (this.tree.length === 0) {
          this.initTree();
          this.previewInvoice(false);
        }

        if (oldStatus !== this.invoice.StatusId && this.currentItemType === this.INVOICE_TYPE) {
          this.previewInvoice(true);
        }

      });

    this.invoiceService.getInvoiceEditMode(this.id)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.forceEdit = data;
        this.setInvoiceEditableStatus(this.invoice, this.forceEdit);
      });
  }

  setInvoiceEditableStatus(invoice: Invoice, forceEdit: boolean) {
    this.editable = InvoiceExtension.isEditable(invoice, forceEdit);
  }

  initTree() {
    this.tree = [];
    this.tree.push({
      id: uuid.create(),
      text: this.localizationService.translate(InvoiceModuleResourceKeys.documents.invoiceLabel),
      itemType: this.INVOICE_TYPE,
      isSelected: true,
      items: this.invoice.ClientCourtesyCopies
        .filter(recipient => recipient.InvoiceRecipientUserProfileId != null && recipient.InvoiceRecipientUserProfileId !== 0)
        .map(recipient => {
          return {
            id: uuid.create(),
            text: recipient.InvoiceRecipientUserProfileName,
            itemType: this.RECIPIENT_TYPE,
            invoiceRecipientId: recipient.Id
          };
        })
    });

    this.tree = this.tree.concat(Array.from(this.invoice.InvoiceBillingTransactions
      .sort(this.sortTransaction.bind(this))
      .filter(trn =>
        trn.InvoiceTransactionDocuments &&
        trn.InvoiceTransactionDocuments.length &&
        trn.InvoiceTransactionDocuments
          .filter(doc => this.filterTransactionDocumentsWhenUserHasClientRole(doc)).length
      )
      .map(trn => {
        return {
          id: uuid.create(),
          text: this.generateTransactionText(trn),
          itemType: this.TRANSACTION_TYPE,
          BillingTransactionId: trn.BillingTransactionId,
          BillingTransactionNumber: trn.BillingTransactionNumber,
          TransactionTypeId: trn.TransactionTypeId,
          WorkerName: trn.WorkerName,
          WorkOrderNumber: trn.WorkOrderNumber,
          StartDate: trn.StartDate,
          EndDate: trn.EndDate,
          SumUnits: trn.SumUnits,
          BillRateUnitId: trn.BillRateUnitId,
          TotalAmount: trn.TotalAmount,
          CurrencyId: trn.CurrencyId,
          CurrentWorkOrderVersionId: trn.CurrentWorkOrderVersionId,
          WorkOrderId: trn.WorkOrderId,
          AssignmentId: trn.AssignmentId,
          TransactionHeaderId: trn.TransactionHeaderId,
          TransactionHeaderTimeSheetId: trn.TransactionHeaderTimeSheetId,
          items: trn.InvoiceTransactionDocuments
            .filter(doc => this.filterTransactionDocumentsWhenUserHasClientRole(doc))
            .map((doc, index) => {
              return {
                id: uuid.create(),
                itemType: this.DOCUMENT_TYPE,
                text: this.generateDocumentText(trn, doc),
                isSelected: doc.InvoiceTransactionDocumentStatusId === PhxConstants.InvoiceTransactionDocumentStatus.Included,
                url: this.sanitizer.bypassSecurityTrustResourceUrl(this.documentService.createPdfDocumentLink(doc.DocumentPublicId)),
                index: index + 1,
                InvoiceTransactionDocumentId: doc.Id,
                InvoiceTransactionId: trn.Id,
                DocumentId: doc.DocumentId,
                DocumentName: doc.DocumentName,
                DocumentPublicId: doc.DocumentPublicId,
                DocumentTypeId: doc.DocumentTypeId,
                InvoiceTransactionDocumentStatusId: doc.InvoiceTransactionDocumentStatusId,
                LastModifiedDatetime: trn.LastModifiedDatetime
              };
            }),
        };
      })));
  }

  private filterTransactionDocumentsWhenUserHasClientRole(doc: InvoiceTransactionDocument): boolean {
    return this.isCurrentUserHasClientRelatedRoles === false ||
      doc.InvoiceTransactionDocumentStatusId === PhxConstants.InvoiceTransactionDocumentStatus.Included;
  }
  private sortTransaction(a: InvoiceBillingTransaction, b: InvoiceBillingTransaction) {
    if (a.WorkerName > b.WorkerName) {
      return 1;
    } else if (a.WorkerName < b.WorkerName) {
      return -1;
    }

    const aType = this.codeValuePipe.transform(a.TransactionTypeId, this.codeValueGroups.TransactionType);
    const bType = this.codeValuePipe.transform(b.TransactionTypeId, this.codeValueGroups.TransactionType);
    if (aType > bType) {
      return 1;
    } else if (aType < bType) {
      return -1;
    }

    if (a.StartDate > b.StartDate) {
      return 1;
    } else if (a.StartDate < b.StartDate) {
      return -1;
    }

    if (a.EndDate > b.EndDate) {
      return 1;
    } else if (a.EndDate < b.EndDate) {
      return -1;
    }

    return 0;
  }

  private generateTransactionText(trn: InvoiceBillingTransaction): string {
    return `
    Number:${trn.BillingTransactionNumber}
    -Worker:${trn.WorkerName}
    -WO:${trn.WorkOrderNumber}
    -Start:${this.datePipe.transform(trn.StartDate, this.formatDate)}
    -End:${this.datePipe.transform(trn.EndDate, this.formatDate)}
    -Units:${trn.SumUnits}
    -Amount:${trn.TotalAmount}
    -RateUnit:${this.codeValuePipe.transform(trn.BillRateUnitId, this.codeValueGroups.RateUnit)}
    -Type:${this.codeValuePipe.transform(trn.TransactionTypeId, this.codeValueGroups.TransactionType)}
    -Currency:${this.codeValuePipe.transform(trn.CurrencyId, this.codeValueGroups.Currency, 'code')}
    `;
  }

  private generateDocumentText(trn: InvoiceBillingTransaction, doc: InvoiceTransactionDocument) {
    return `
      ${this.generateTransactionText(trn)}
      -File:${doc.DocumentName}
      -Id:${doc.DocumentId}
      -DocType:${this.codeValuePipe.transform(doc.DocumentTypeId, this.codeValueGroups.DocumentType)}
      `;
  }

  onItemClick(item) {
    this.currentItemType = item.itemData.itemType;
    switch (item.itemData.itemType) {
      case this.DOCUMENT_TYPE:
        {
          this.currentDoc = item.itemData;
          this.currentTransaction = item.node.parent.itemData;
          this.selectDoc(this.currentDoc);
          break;
        }
      case this.TRANSACTION_TYPE: {
        this.currentTransaction = item.itemData;
        if (item.itemData.items && item.itemData.items.length) {
          this.currentDoc = item.itemData.items[0];
          this.selectDoc(this.currentDoc);
        } else {
          this.currentDoc = null;
          this.currentPublicId = null;
        }
        break;
      }
      case this.INVOICE_TYPE: {
        this.previewInvoice(false);
        break;
      }
      case this.RECIPIENT_TYPE: {
        this.previewInvoiceForRecipient(item.itemData.invoiceRecipientId);
        break;
      }
    }
  }

  previewInvoice(force: boolean) {
    this.currentTransaction = null;
    this.currentDoc = null;
    this.currentPublicId = null;
    this.currentItemType = this.INVOICE_TYPE;

    // we add random to url to make angular refresh the preview when status is changed
    const random = force ? `&rand=${new Date().toISOString()}` : '';
    const tempLink = this.reportService.createLink(`invoice/${this.id}`) + random;
    const url = this.sanitizer.bypassSecurityTrustResourceUrl(tempLink);

    if (JSON.stringify(url) !== JSON.stringify(this.url)) {
      this.isInvoiceLoading = true;
      this.url = url;
    }
  }

  previewInvoiceForRecipient(invoiceRecipientId?: number) {
    this.currentTransaction = null;
    this.currentDoc = null;
    this.currentPublicId = null;
    this.currentItemType = this.RECIPIENT_TYPE;
    const url = this.reportService.createSanitizedLink(`invoice/recipient/${invoiceRecipientId}/deliverymethod/${PhxConstants.DeliveryMethod.SoftCopy}`);
    if (JSON.stringify(url) !== JSON.stringify(this.url)) {
      this.isInvoiceLoading = true;
      this.url = url;
    }
  }

  selectDoc(data) {
    const publicId = data.DocumentPublicId;
    if (publicId !== this.currentPublicId) {
      this.currentPublicId = publicId;
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentService.createPdfDocumentLink(publicId));
    }
  }

  openWorkOrder(data) {
    this.winRef.nativeWindow.open(`#/workorder/${data.AssignmentId}/${data.WorkOrderId}/${data.CurrentWorkOrderVersionId}/core`, '_blank');
  }

  openTransaction(data) {
    this.winRef.nativeWindow.open(`#/transaction/${data.TransactionHeaderId}/detail`, '_blank');
  }

  openTimeSheet(data) {
    this.winRef.nativeWindow.open(`#/next/timesheet/${data.TransactionHeaderTimeSheetId}`, '_blank');
  }

  updateDocumentStatus(event, data) {
    this.invoiceService.executeInvoiceTransactionDocumentUpdateStatusCommand(
      this.id,
      data.InvoiceTransactionId,
      [data.InvoiceTransactionDocumentId],
      event.value ? PhxConstants.InvoiceTransactionDocumentStatus.Included : PhxConstants.InvoiceTransactionDocumentStatus.Excluded,
      data.LastModifiedDatetime
    )
      .catch((err) => {
        this.commonService.logError('Error changing document status');
        this.initTree();
        this.previewInvoice(true);
      });
  }

  onInvoiceLoaded() {
    this.isInvoiceLoading = false;
  }
}
