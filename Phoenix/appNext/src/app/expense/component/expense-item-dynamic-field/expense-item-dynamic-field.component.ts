import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ExpenseItemFieldValue } from '../../model/index';
import { CommonService, CodeValuePipe } from '../../../common/index';
import { PhxFormControlLayoutType } from '../../../common/model';

@Component({
  selector: 'app-expense-item-dynamic-field',
  templateUrl: './expense-item-dynamic-field.component.html',
  styleUrls: ['./expense-item-dynamic-field.component.less']
})
export class ExpenseItemDynamicFieldComponent implements OnInit, OnChanges {
  @Input('editable') editable = true;
  @Input() field: ExpenseItemFieldValue;
  @Output('fieldValueChanged') fieldValueChanged: EventEmitter<any> = new EventEmitter();
  @Input('currencyId') currencyId: number;

  codeValueGroups: any;
  fieldLabel: string;
  controlLayoutType : PhxFormControlLayoutType = PhxFormControlLayoutType.Stacked;

  constructor(
    private commonService: CommonService,
    private codeValuePipe: CodeValuePipe,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.field && changes.field.currentValue) {
      this.fieldLabel = this.field.ExpenseCategoryFieldDefinitionTitle;
      if (this.field.ExpenseCategoryFieldDefinitionIsMandatory === true && this.editable === true) {
        this.fieldLabel += ' *';
      }
    }

    if (changes.editable) {
      if (changes.editable.currentValue === true) {
        this.controlLayoutType = PhxFormControlLayoutType.Stacked;
      } else {
        this.controlLayoutType = PhxFormControlLayoutType.Inline;
      }
    }

  }

  updateProp(val: any) {
    // list
    if (this.field.ExpenseCategoryFieldUIControlTypeId === 1) {
      this.fieldValueChanged.emit({
        listValueId: val,
        textValue: null,
      });
    } else {
      this.fieldValueChanged.emit({
        listValueId: null,
        textValue: val
      });
    }
  }

}
