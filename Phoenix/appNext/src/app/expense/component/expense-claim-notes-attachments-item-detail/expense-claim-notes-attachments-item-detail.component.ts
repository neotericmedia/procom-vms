import { CommonService } from '../../../common/services/common.service';
import { ExpenseCategory, ExpenseItem } from './../../model';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-expense-claim-notes-attachments-item-detail',
  templateUrl: './expense-claim-notes-attachments-item-detail.component.html',
  styleUrls: ['./expense-claim-notes-attachments-item-detail.component.less']
})
export class ExpenseClaimNotesAttachmentsItemDetailComponent implements OnInit, OnChanges {

  @Input('expenseItems') expenseItems: Array<ExpenseItem>;
  @Input('editable') editable = true;
  @Input('categoryId') categoryId: string;

  dataTargetId: string;
  formatDate: string;
  codeValueGroups: any;

  constructor(private commonService: CommonService) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['expenseItems']) {
      const newExpenseItems = changes['expenseItems'].currentValue;
      if (newExpenseItems != null) {
        this.expenseItems = newExpenseItems.filter(item => item.ExpenseCategory.Id === this.categoryId);
        this.dataTargetId = '#' + this.categoryId;
      }
    }
  }
}
