import { ExpenseClaimService } from './../../service/expense-claim.service';
import { CommonService } from '../../../common/services/common.service';
import { ExpenseClaim, ExpenseItem } from './../../model';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, Renderer } from '@angular/core';
import { CodeValueService } from './../../../common/services/code-value.service';
import {
  PhxDataTableConfiguration,
  PhxDataTableColumn,
  PhxDataTableStateSavingMode,
  DialogResultType
} from '../../../common/model/index';
import { DialogService } from '../../../common/services/dialog.service';
import * as moment from 'moment';
import { PhxLocalizationService } from '../../../common';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-expense-item-list',
  templateUrl: './expense-item-list.component.html',
  styleUrls: ['./expense-item-list.component.less']
})
export class ExpenseItemListComponent implements OnInit, OnChanges {
  formatDate: string;
  lastSelectedItem: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  codeValueGroups: any;

  @Input('expenseClaim') expenseClaim: ExpenseClaim;
  @Input('editable') editable = true;
  @Output() itemSelectionChanged: EventEmitter<ExpenseItem> = new EventEmitter<ExpenseItem>();
  @Output() itemSelected: EventEmitter<ExpenseItem> = new EventEmitter<ExpenseItem>();
  @Output() onAddItem: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('expenseItemGrid') expenseItemGrid;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    stateSavingMode: PhxDataTableStateSavingMode.Automatic,
    showTotalCount: false,
    loadPanelEnabled: false,
  });

  columns: Array<PhxDataTableColumn>;

  expenseModuleResourceKeys: any;

  constructor(
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private expenseClaimService: ExpenseClaimService,
    private localizationService: PhxLocalizationService,
    private dialogService: DialogService,
    private renderer: Renderer
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
    this.initColumns();
  }

  initColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'ExpenseCategory',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.itemList.categoryColumnHeader),
        hidingPriority: 5,
        cellTemplate: 'categoryCellTemplate',
        calculateFilterExpression: (filterValue, selectedFilterOperation) => {
          return [
            (rowData) => { return rowData.ExpenseCategory.DisplayName; },
            selectedFilterOperation,
            filterValue
          ];
        },
        calculateSortValue: (rowData) => {
          return rowData.ExpenseCategory.DisplayName;
        },
        calculateDisplayValue: (rowData) => {
          return rowData.ExpenseCategory.DisplayName;
        }
      }),
      new PhxDataTableColumn({
        dataField: 'DateIncurred',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.itemList.dateColumnHeader),
        dataType: 'date',
        hidingPriority: 2,
        calculateGroupValue: (rowData) => {
          if (rowData.DateIncurred) {
            return new Date(moment(rowData.DateIncurred).format('l'));
          }
        },
        customizeText: (e) => {
          let formattedDate: string = '';
          if (e.value) {
            formattedDate = moment(e.value).format('ll');
          }
          return formattedDate;
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Merchant',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.itemList.merchantColumnHeader),
        hidingPriority: 3,
      }),
      new PhxDataTableColumn({
        dataField: 'Note',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.itemList.noteColumnHeader),
        hidingPriority: 1,
      }),
      new PhxDataTableColumn({
        dataField: 'Total',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.itemList.totalColumnHeader),
        dataType: 'money',
        hidingPriority: 6,
      }),
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: this.localizationService.translate(ExpenseModuleResourceKeys.itemList.actionColumnHeader),
        cellTemplate: 'actionCellTemplate',
        hidingPriority: 4,
        allowFiltering: false,
        allowSearch: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false,
        fixed: true,
        fixedPosition: 'right',
        width: 60,
      }),
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['expenseClaim']) {
      if (changes['expenseClaim'].currentValue) {
        const expenseClaim = changes['expenseClaim'].currentValue;
        const currency = this.codeValueService.getCodeValue(expenseClaim.CurrencyId, this.codeValueGroups.Currency);
        let currencyCode = '';
        if (currency) {
          currencyCode = currency['code'];
        }
      }
    }
  }

  refresh() {
    if (this.expenseItemGrid != null) {
      this.expenseItemGrid.grid.instance.refresh();
    }
  }

  removeItem(e: any) {
    // tslint:disable-next-line:max-line-length
    const message = this.localizationService.translate(ExpenseModuleResourceKeys.itemList.deleteItemMessage, e.data.ExpenseCategory.DisplayName, e.data.DateIncurred ? ' on ' + moment(e.data.DateIncurred).format('MMM DD YYYY') : '');
    this.dialogService.confirmDelete(message).then((button) => {
      if (button === DialogResultType.Yes) {
        this.expenseClaimService.deleteExpenseItem(e.data.Id, e.data.LastModifiedDatetime).then(() => {
          this.expenseClaimService.removeExpenseItemFromState(e.data);
        });
      }
    });
  }

  cellClick(e: any) {
    if (e.rowType === 'data' &&
      e.column.cellTemplate !== 'actionCellTemplate' &&
      e.column.command !== 'adaptive') {
      const selectedItem: any = e.data;
      this.itemSelected.emit(selectedItem);
      if (selectedItem !== this.lastSelectedItem) {
        this.lastSelectedItem = selectedItem;
        this.itemSelectionChanged.emit(selectedItem);
      }
    }
  }

  rowPrepared(e: any) {
    if (e.rowType === 'data') {
      const item = <ExpenseItem>e.data;
      if (item.IsValid != null && item.IsValid === false) {
        this.renderer.setElementClass(e.rowElement, 'error', true);
      }
    }
  }

  onAddItemClick() {
    this.onAddItem.emit();
  }
}
