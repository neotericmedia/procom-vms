import { ExpenseCategory } from './../../model/expense-category';
import { ExpenseItemFieldValue } from './../../model/expense-item-field-value';
import { CommonService } from '../../../common/services/common.service';
import { CodeValue } from './../../../common/model/code-value';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { Component, OnInit, Input, Output, Inject, ViewChild, SimpleChanges, OnChanges, EventEmitter } from '@angular/core';
import { ExpenseItem, SalesTaxVersionRate } from '../../model/index';
import { CodeValueService } from '../../../common/services/code-value.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { PhxFormControlLayoutType, PhxDocumentFileUploadConfiguration, PhxDocument } from '../../../common/model';
import { ExpenseItemAttachmentsComponent } from '../expense-item-attachments/expense-item-attachments.component';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';
import { ExpenseItemTaxline } from '../../model/expense-item-taxline';
import { PhxConstants } from '../../../common';
import { ExpenseExtension } from '../../service/expense-extension';

@Component({
  selector: 'app-expense-item-detail',
  templateUrl: './expense-item-detail.component.html',
  styleUrls: ['./expense-item-detail.component.less']
})
export class ExpenseItemDetailComponent implements OnInit, OnChanges {
  @Input() item: ExpenseItem;
  @Input('editable') editable = true;
  @ViewChild('countriesSelectBox') countriesSelectBox: DxSelectBoxComponent;
  @ViewChild('subdivisionsSelectBox') subdivisionsSelectBox: DxSelectBoxComponent;
  @ViewChild('itemAttachments') itemAttachments: ExpenseItemAttachmentsComponent;
  @Output() onAddItemAttachment: EventEmitter<PhxDocumentFileUploadConfiguration> = new EventEmitter<PhxDocumentFileUploadConfiguration>();
  @Output() onPreviewAttachment: EventEmitter<PhxDocument> = new EventEmitter<PhxDocument>();

  controlLayoutType: PhxFormControlLayoutType = PhxFormControlLayoutType.Stacked;

  countries: Array<CodeValue>;
  subdivisions: Array<CodeValue>;
  codeValueGroups: any;
  formatDate: string;
  requiredStar: string;
  dynamicFieldsSliced: { [key: string]: Array<ExpenseItemFieldValue> } = {};
  expenseModuleResourceKeys: any;

  constructor(
    private expenseClaimService: ExpenseClaimService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.loadCountries();
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) {
      const newItem = changes['item'].currentValue;
      if (newItem != null) {
        this.loadSubdivisions(this.item.CountryId);
      }
      this.sliceDynamicFields(newItem);
    }

    if (changes.editable) {
      if (changes.editable.currentValue === true) {
        this.controlLayoutType = PhxFormControlLayoutType.Stacked;
        this.requiredStar = ' *';
      } else {
        this.controlLayoutType = PhxFormControlLayoutType.Inline;
        this.requiredStar = '';
      }
    }
  }

  sliceDynamicFields(item: ExpenseItem) {
    this.dynamicFieldsSliced = {};
    if (item) {
      item.FieldValues.forEach(x => {
        const index = Math.trunc(x.ExpenseCategoryFieldDefinitionOrder / 1000) * 1000;
        if (!this.dynamicFieldsSliced[index]) {
          this.dynamicFieldsSliced[index] = [];
        }
        this.dynamicFieldsSliced[index].push(x);
      });

      // sorting dynamic fields
      Object.keys(this.dynamicFieldsSliced).map((key) => {
        this.dynamicFieldsSliced[key] = this.dynamicFieldsSliced[key]
          .sort((a, b) => a.ExpenseCategoryFieldDefinitionOrder - b.ExpenseCategoryFieldDefinitionOrder);
      });
    }
  }

  updateTotal() {
    let taxes = 0;
    this.item.TaxLines.forEach((taxline: ExpenseItemTaxline) => {
      taxes += (taxline.Amount || 0);
    });
    this.item.Total = +((+this.item.Subtotal || 0) + (+this.item.Tip || 0) + taxes).toFixed(2);
  }

  updateProp(field: string, val: any) {
    this.item[field] = val;
    if (field === 'Subtotal') {
      ExpenseExtension.calculateAllTaxes(this.item);
    }
    this.updateTotal();

    this.expenseClaimService.updateCurrentExpenseItemState(this.item);
  }

  updateDynamicProp(field: ExpenseItemFieldValue, data: any) {

    let itemIndex: number;
    if (field.Id && field.Id > 0) {
      itemIndex = this.item.FieldValues.findIndex(x => x.Id === field.Id);
    }

    if (itemIndex != null && itemIndex !== -1) {
      this.item.FieldValues[itemIndex].ExpenseCategoryFieldListValueId = data.listValueId;
      this.item.FieldValues[itemIndex].ExpenseCategoryFieldTextValue = data.textValue;
    }

    if (field.ExpenseCategoryFieldTypeId != null) {
      ExpenseExtension.calculateSubTotal(this.item);
      ExpenseExtension.calculateAllTaxes(this.item);
      this.updateTotal();
    }
    this.expenseClaimService.updateCurrentExpenseItemState(this.item);
  }

  updateTaxProp(taxField: any, val: any) {
    taxField.Amount = val;
    this.updateTotal();
    this.expenseClaimService.updateCurrentExpenseItemState(this.item);
  }

  loadCountries() {
    this.countries = this.codeValueService.getCodeValues(this.codeValueGroups.Country, true);
  }

  loadSubdivisions(countryId: number) {
    this.subdivisions = this.codeValueService.getRelatedCodeValues(
      this.codeValueGroups.Subdivision,
      countryId,
      this.codeValueGroups.Country);
  }

  getTaxLineAmountBySalesTaxIdAndRate(salesTaxId: PhxConstants.SalesTax, salesTaxVersionRatePercentage: number) {
    const index = this.item.TaxLines.findIndex((taxLine: ExpenseItemTaxline) =>
      taxLine.SalesTaxId === salesTaxId && taxLine.SalesTaxVersionRatePercentage === salesTaxVersionRatePercentage);
    return (index !== -1) ? this.item.TaxLines[index].Amount : ExpenseExtension.calculateTax(this.item.Subtotal, salesTaxVersionRatePercentage);
  }

  loadSubdivisionTaxes(forceRecalculateTaxes: boolean = false) {
    if (!this.item.ExpenseCategory.ShowTax || !this.item.SubdivisionId || !this.item.DateIncurred || this.codeValueService.getCodeValue(this.item.CountryId, this.codeValueGroups.Country).code !== 'CA') {
      this.updateProp('TaxLines', []);
      this.updateTotal();
      return;
    }

    this.expenseClaimService.getSubdivisionTaxes(this.item.SubdivisionId, this.item.DateIncurred)
      .then((salesTaxVersionRates: SalesTaxVersionRate[]) => {
        this.item.TaxLines = salesTaxVersionRates.map(salesTaxVersionRate => {
          const taxAmount = forceRecalculateTaxes ? ExpenseExtension.calculateTax(this.item.Subtotal, salesTaxVersionRate.RatePercentage)
            : this.getTaxLineAmountBySalesTaxIdAndRate(salesTaxVersionRate.SalesTaxId, salesTaxVersionRate.RatePercentage);

          return {
            Id: 0,
            Amount: taxAmount,
            SalesTaxId: salesTaxVersionRate.SalesTaxId,
            SalesTaxVersionRateId: salesTaxVersionRate.Id,
            SalesTaxVersionRatePercentage: salesTaxVersionRate.RatePercentage,
          };
        });
        this.updateTotal();
        this.expenseClaimService.updateCurrentExpenseItemState(this.item);
      });
  }

  countrySelected() {
    this.updateProp('CountryId', this.countriesSelectBox.value);
    this.updateProp('SubdivisionId', null);
    this.loadSubdivisions(this.countriesSelectBox.value);
  }

  subdivisionSelected() {
    this.updateProp('SubdivisionId', this.subdivisionsSelectBox.value);
    if (this.editable) {
      this.loadSubdivisionTaxes(true);
    }
  }

  emitAddItemAttachment(config: PhxDocumentFileUploadConfiguration) {
    this.onAddItemAttachment.emit(config);
  }

  loadAttachments() {
    this.itemAttachments.loadAttachments(this.item.Id);
  }

  previewAttachment(doc: PhxDocument) {
    this.onPreviewAttachment.emit(doc);
  }

}
