import { ExpenseClaim } from './../../model/expense-claim';
import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../../common/index';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-expense-header',
  templateUrl: './expense-header.component.html',
  styleUrls: ['./expense-header.component.less']
})
export class ExpenseHeaderComponent implements OnInit {
  @Input('expenseClaim') expenseClaim: ExpenseClaim;
  codeValueGroups: any;
  header: any;

  constructor(private commonService: CommonService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.header = ExpenseModuleResourceKeys.header;
  }

  ngOnInit() {
  }

  calculateTotal(): number {
    if (this.expenseClaim && this.expenseClaim.ExpenseItems) {
      return this.expenseClaim.ExpenseItems.map(item => item.Total).reduce((a, v) => a + v, 0);
    }

    return 0;
  }

}
