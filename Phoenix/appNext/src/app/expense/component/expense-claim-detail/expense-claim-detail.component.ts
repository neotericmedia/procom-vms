import 'rxjs/add/operator/distinctUntilChanged';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { CodeValueService } from './../../../common/services/code-value.service';
import { CodeValue } from './../../../common/model/code-value';
import { ExpenseClaimService } from './../../service/expense-claim.service';
import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { CommonService } from '../../../common/index';
import { ExpenseClaim } from '../../model';
import { ExpenseModuleResourceKeys } from '../../expense-module-resource-keys';

@Component({
  selector: 'app-expense-claim-detail',
  templateUrl: './expense-claim-detail.component.html',
  styleUrls: ['./expense-claim-detail.component.less']
})
export class ExpenseClaimDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input('expenseClaim') expenseClaim: ExpenseClaim;
  @Input('editable') editable = true;

  isAlive: boolean = true;
  myform: FormGroup;
  codeValueGroups: any;
  currencies: Array<CodeValue>;
  expenseModuleResourceKeys: any;
  constructor(
    private expenseClaimService: ExpenseClaimService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private fb: FormBuilder
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.expenseModuleResourceKeys = ExpenseModuleResourceKeys;
  }

  ngOnInit() {
    this.currencies = this.codeValueService.getCodeValuesSortByCode(this.codeValueGroups.Currency, true);

    this.myform = this.fb.group({
      Title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128)]],
      Description: ['', [Validators.maxLength(255)]],
      CurrencyId: ['', [Validators.required]]
    });

    this.updateFormValues();

    // this.myform.valueChanges
    //   .takeWhile(() => this.isAlive)
    //   .debounceTime(300)
    //   .distinctUntilChanged()
    //   .subscribe(value => {
    //     console.log('formChange', value);
    //     Object.assign(this.expenseClaim, value);
    //     this.expenseClaimService.updateExpenseClaimState(this.expenseClaim);
    //   });

    this.myform.get('Title').valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        this.updateProp('Title', value);
      });

    this.myform.get('Description').valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        this.updateProp('Description', value);
      });

    this.myform.get('CurrencyId').valueChanges
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe(value => {
        this.updateProp('CurrencyId', value);
      });

  }


  ngOnDestroy() {
    this.isAlive = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.expenseClaim) {
      if (changes.expenseClaim.currentValue) {
        this.updateFormValues();
      }
    }
  }

  updateFormValues() {
    if (this.expenseClaim && this.myform) {
      this.myform.patchValue(this.expenseClaim, { emitEvent: false });
    }
  }

  updateProp(field: string, value: any) {
    Object.assign(this.expenseClaim, { [field]: value });
    this.expenseClaimService.updateExpenseClaimState(this.expenseClaim);
    this.expenseClaimService.executePartialSaveCommand(this.expenseClaim.Id, this.expenseClaim.WorkOrderId, field, value);
  }


}
