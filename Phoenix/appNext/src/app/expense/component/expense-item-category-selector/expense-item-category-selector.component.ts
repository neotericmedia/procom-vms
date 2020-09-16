import { ExpenseItemFieldValue } from './../../model/expense-item-field-value';
import { ExpenseCategoryFieldDefinition } from './../../model/expense-category-field-definition';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { ExpenseCategory } from './../../model/expense-category';
import { ExpenseCategoryService } from './../../service/expense-category.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExpenseItem } from '../../model/index';
import { EntityList } from '../../../common/model';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-expense-item-category-selector',
  templateUrl: './expense-item-category-selector.component.html',
  styleUrls: ['./expense-item-category-selector.component.less']
})
export class ExpenseItemCategorySelectorComponent implements OnInit {
  @Input() item: ExpenseItem;
  @Output() onCategorySelected: EventEmitter<ExpenseItem> = new EventEmitter<ExpenseItem>();
  categories: EntityList<ExpenseCategory>;
  expenseModuleResourceKeys: any;

  constructor(
    private expenseCategoryService: ExpenseCategoryService,
    private expenseClaimService: ExpenseClaimService
  ) {
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.expenseCategoryService.getExpenseCategories(this.item.WorkOrderId).subscribe((data) => {
      this.categories = data;
    });
  }

  selectCategory(category: ExpenseCategory) {
    this.item.ExpenseCategoryId = category.Id;
    this.item.ExpenseCategory = category;
    this.item.ExpenseCategoryTemplateVersionId = category.ExpenseCategoryTemplateVersionId;
    this.item.TaxLines = [];
    this.fillItemFields(category);
    this.expenseClaimService.saveExpenseItem(this.item)
      .then((data) => {
        Object.assign(this.item, data);
        this.onCategorySelected.emit(this.item);
        this.expenseClaimService.updateCurrentExpenseItemState(this.item);
      });
  }

  fillItemFields(category: ExpenseCategory) {
    this.item.FieldValues = [];
    category.FieldDefinitions.forEach(fieldDefinition => {
      this.item.FieldValues.push(<ExpenseItemFieldValue>{
        Id: 0,
        ExpenseCategoryFieldDefinitionId: fieldDefinition.Id,
        ExpenseCategoryFieldDefinitionTitle: fieldDefinition.DisplayName,
        ExpenseCategoryFieldDefinitionIsMandatory: fieldDefinition.IsMandatory,
        ExpenseCategoryFieldDefinitionOrder: fieldDefinition.SortOrder,
        ExpenseCategoryFieldUIControlTypeId: fieldDefinition.UIControlTypeId,
        ListValues: fieldDefinition.ListValues,
      });
    });
  }

}
