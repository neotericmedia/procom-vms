import { expenseCategoryActions } from './../state/expense-category/expense-category.action';
import { Injectable, Inject } from '@angular/core';
import { StateService } from '../../common/state/state.module';
import { ExpenseCategory } from '../model/index';
import { ApiService } from '../../common/services/api.service';
import { EntityList } from '../../common/model';

@Injectable()
export class ExpenseCategoryService {

  constructor(
    private apiService: ApiService,
    private state: StateService
  ) { }

  private param(oDataParams) {
    return oDataParams
      ? `?${oDataParams}`
      : '';
  }

  public getExpenseCategories(workOrderId: number, forceGet = true) {

    const state = this.state.value;
    const targetValue = state && state.expenseCategory.expenseCategories;

    if (targetValue === null || targetValue === undefined || forceGet) {

      this.apiService.query(`expenseCategory/expenseCategoriesByWorkOrderCurrent/${workOrderId}`)
        .then(response => {
          this.state.dispatch(expenseCategoryActions.expenseCategories.loadList, response);
        });
    }

    return this.state.select<EntityList<ExpenseCategory>>(`expenseCategory.expenseCategories`);
  }
}
