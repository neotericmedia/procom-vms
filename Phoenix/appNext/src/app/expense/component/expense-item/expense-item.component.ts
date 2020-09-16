import { ExpenseItem } from './../../model';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PhxDocumentFileUploadConfiguration, PhxDocument } from '../../../common/model';
import { ExpenseItemDetailComponent } from '../expense-item-detail/expense-item-detail.component';
import { PhxLocalizationService } from '../../../common';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-expense-item',
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.less']
})
export class ExpenseItemComponent implements OnInit {
  @Input() item: ExpenseItem;
  @Input() isNew: boolean;
  @Input('editable') editable = true;
  @Output() onAddItemAttachment: EventEmitter<PhxDocumentFileUploadConfiguration> = new EventEmitter<PhxDocumentFileUploadConfiguration>();
  @Output() onPreviewAttachment: EventEmitter<PhxDocument> = new EventEmitter<PhxDocument>();
  @ViewChild('itemDetail') itemDetail: ExpenseItemDetailComponent;

  expenseModuleResourceKeys: any;

  constructor(
    private localizationService: PhxLocalizationService
  ) {
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
  }

  emitAddItemAttachment(config: PhxDocumentFileUploadConfiguration) {
    this.onAddItemAttachment.emit(config);
  }

  loadAttachments() {
    this.itemDetail.loadAttachments();
  }

  previewAttachment(doc: PhxDocument) {
    this.onPreviewAttachment.emit(doc);
  }

  onCategorySelected(item: ExpenseItem) {
    this.item = Object.assign({}, item);
  }
}
