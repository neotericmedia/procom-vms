import { Component, OnInit, Input, Output, EventEmitter, forwardRef, SimpleChanges, group } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeValue } from '../../model/code-value';
import { CodeValueService } from '../../services/code-value.service';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { CodeValueGroups } from '../../model/index';
import { retry } from 'rxjs/operator/retry';

@Component({
  selector: 'app-phx-select-box-code-value',
  templateUrl: './phx-select-box-code-value.component.html',
  styleUrls: ['./phx-select-box-code-value.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PhxSelectBoxCodeValueComponent),
    }
  ]
})
export class PhxSelectBoxCodeValueComponent implements OnInit, ControlValueAccessor, OnChanges {

  @Input() groupName: string;
  @Input() sortByFieldName: string; // id, code, text, sortOrder (default = sortOrder)
  @Input() relatedGroupName: string;
  @Input() relatedValue: number;
  @Input() placeholder: string;
  @Input() showClearButton: boolean = true;
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() searchable: boolean = true;
  @Input() filter: Function;
  @Input() prioritizeCanadaUSA: boolean = true;

  // tslint:disable-next-line:no-input-rename
  @Input('value') _value: any;
  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  items: Array<CodeValue> = [];

  constructor(
    private codeValueService: CodeValueService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.groupName) {
      this.loadCodeValues(changes.groupName.currentValue, this.sortByFieldName);
    }

    if (changes.sortByFieldName && changes.sortByFieldName.currentValue) {
      this.loadCodeValues(this.groupName, changes.sortByFieldName.currentValue);
    }

    if (changes.relatedValue) {
      this.loadRelatedCodeValues(this.groupName, this.sortByFieldName, this.relatedGroupName, changes.relatedValue.currentValue);
    }

    if (changes.relatedGroupName) {
      this.loadRelatedCodeValues(this.groupName, this.sortByFieldName, changes.relatedGroupName.currentValue, this.relatedValue);
    }
  }

  refresh() {
    if (this.relatedGroupName) {
      this.loadRelatedCodeValues(this.groupName, this.sortByFieldName, this.relatedGroupName, this.relatedValue);
    } else {
      this.loadCodeValues(this.groupName, this.sortByFieldName);
    }
  }

  loadRelatedCodeValues(groupName: string, sortBy: string, relatedGroupName: string, relatedValue: number) {

    if (this.groupName == null || this.relatedGroupName == null || this.relatedValue == null) {
      this.items = [];
      return;
    }

    const data = this.codeValueService.getRelatedCodeValues(groupName, this.relatedValue, this.relatedGroupName);
    const sortedData = this.sortCodeValues(data, sortBy);
    this.items = this.filterCodeValues(sortedData, this.filter);
  }

  loadCodeValues(groupName: string, sortBy: string) {

    if (this.groupName == null) {
      this.items = [];
      return;
    }

    const data = this.codeValueService.getCodeValues(groupName, true);
    const sortedData = this.sortCodeValues(data, sortBy);
    this.items = this.filterCodeValues(sortedData, this.filter);
  }

  sortCodeValues(data: Array<CodeValue>, sortBy: string): Array<CodeValue> {
    let sortedData: Array<CodeValue> = [];
    switch ((sortBy || '').toLowerCase()) {
      case 'code': {
        sortedData = data.sort((a: CodeValue, b: CodeValue) => {
          if (a.code < b.code) {
            return -1;
          }
          if (a.code > b.code) {
            return 1;
          }
          return 0;
        });
        break;
      }
      case 'id': {
        sortedData = data.sort((a: CodeValue, b: CodeValue) => b.id - a.id);
        break;
      }
      case 'text': {
        sortedData = data.sort((a: CodeValue, b: CodeValue) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
        break;
      }
      case 'sortorder':
      default:
        {
          sortedData = data.sort((a: CodeValue, b: CodeValue) => b.sortOrder - a.sortOrder);
        }
    }

    if (this.groupName === CodeValueGroups.Country && this.prioritizeCanadaUSA) {
      sortedData = sortedData.filter(country => country.code === 'CA' || country.code === 'US')
        .concat(sortedData.filter(country => country.code !== 'CA' && country.code !== 'US'));
    } else if (this.groupName === CodeValueGroups.Currency && this.prioritizeCanadaUSA) {
      sortedData = sortedData.filter(currency => currency.code === 'CAD' || currency.code === 'USD')
        .concat(sortedData.filter(currency => currency.code !== 'CAD' && currency.code !== 'USD'));
    }

    return sortedData;

  }

  filterCodeValues(data: Array<CodeValue>, filter: Function) {
    let filteredData = data;
    if (filter) {
      filteredData = data.filter(item => filter(item));
    }

    return filteredData;
  }

  writeValue(value: any) {
    this.value = value;
  }

  onChange = (_) => { };

  onTouched = () => { };

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  onValueChanged(event: any) {
    // event contains `value` and `previousValue`
    this.value = event.value;
    this.valueChanged.emit(event);
  }

}
