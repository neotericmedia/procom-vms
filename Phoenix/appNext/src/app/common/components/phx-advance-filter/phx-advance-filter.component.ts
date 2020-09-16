import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, HostListener } from '@angular/core';
import { PhxConstants } from './../../model/phx-constants';
import { InputFilter, TextBoxFilter, CheckBoxFilter, DateFilter } from './../../model/advance-filter/phx-advance-filter';
import { map, cloneDeep } from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-phx-advance-filter',
  templateUrl: './phx-advance-filter.component.html'
})
export class PhxAdvanceFilterComponent implements OnChanges {
  filterType: any;
  isDisplayPopup: boolean = false;
  filterConfigurationValues: any;
  displaySelectedValues: string;

  minDate = new Date(2000, 0, 1);
    maxDate = new Date(2029, 11, 31);
    currentDate = new Date();

  @Input() inputFilter: InputFilter;
  @Input() columnId: string;
  @Input() resetSearchText: boolean = false;
  @Input() canShow: boolean = false;

  @Output('onGo') onGo = new EventEmitter<any>();
  @Output('onClear') onClear = new EventEmitter<any>();
  @Output('onClose') onClose = new EventEmitter<any>();
  @Output('onColumnClick') onColumnClick = new EventEmitter<any>();

  constructor() {
    this.filterType = PhxConstants.FilterType;
  }

  @HostListener('document:click', ['$event'])
  onlick(event) {
    const target = event.target || event.srcElement || event.currentTarget;
    const filter = document.getElementById('filterBox');
    const filterContainer = filter ? document.getElementById('parentFilterBox') : null;
    if (filterContainer && !(filter.contains(target) || filterContainer.contains(target))) {
      this.onClose.emit(this.columnId);
    }
  }

  @HostListener('input', ['$event'])
  change(event) {
    this.inputFilter.filterConfiguration = <TextBoxFilter>this.inputFilter.filterConfiguration;
    try {
      if (this.inputFilter.filterConfiguration.inputText &&
        this.inputFilter.filterConfiguration.dataSafeRestrictInput &&
        event.target.localName === 'input'
      ) {
        event.target.value = this.restrictInputValue(event);
        this.inputFilter.filterConfiguration.inputText = event.target.value === '' ? null : event.target.value;
      }
    } catch (e) {}
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.columnId && changes.columnId.currentValue) {
      this.columnId = changes.columnId.currentValue;
    }

    if (changes.canShow) {
      this.isDisplayPopup = changes.canShow.currentValue;
    }

    if (changes.resetSearchText && changes.resetSearchText.currentValue) {
      this.resetSearchText = changes.resetSearchText.currentValue;
    }

    if (changes.inputFilter && changes.inputFilter.currentValue) {
      this.inputFilter = changes.inputFilter.currentValue;
      if (this.resetSearchText) {
        this.filterConfigurationValues = this.inputFilter.filterConfiguration;
        this.displaySelectedValuesInHtml();
      } else {
        this.inputFilter.filterConfiguration = !this.filterConfigurationValues ? this.inputFilter.filterConfiguration : cloneDeep(this.filterConfigurationValues);
      }
      this.processInput();
    }
  }

  processInput() {
    switch (this.inputFilter.filterType) {
      case this.filterType.Checkbox:
        this.inputFilter.filterConfiguration = <CheckBoxFilter>this.inputFilter.filterConfiguration;
        this.inputFilter.filterConfiguration.items.list = map(this.inputFilter.filterConfiguration.items.list, result => {
          result['isSelected'] = result['isSelected'] ? true : false;
          return result;
        });
        break;
      case this.filterType.Dropdown:
        this.inputFilter.filterConfiguration = <TextBoxFilter>this.inputFilter.filterConfiguration;
        this.inputFilter.filterConfiguration.inputText = this.inputFilter.filterConfiguration.inputText ? this.inputFilter.filterConfiguration.inputText : null;
        this.inputFilter.filterConfiguration.selectedDropdownValue = this.inputFilter.filterConfiguration.selectedDropdownValue
          ? this.inputFilter.filterConfiguration.selectedDropdownValue
          : this.inputFilter.filterConfiguration.items && this.inputFilter.filterConfiguration.items.dropDownList.length > 0
            ? this.inputFilter.filterConfiguration.items.dropDownList[0][this.inputFilter.filterConfiguration.items.valueField]
            : null;
        break;
        case this.filterType.Date:
        this.inputFilter.filterConfiguration = <DateFilter>this.inputFilter.filterConfiguration;
        this.inputFilter.filterConfiguration.inputDate = this.inputFilter.filterConfiguration.inputDate ? this.inputFilter.filterConfiguration.inputDate : null;
        this.inputFilter.filterConfiguration.selectedDropdownValue = this.inputFilter.filterConfiguration.selectedDropdownValue
          ? this.inputFilter.filterConfiguration.selectedDropdownValue
          : this.inputFilter.filterConfiguration.items && this.inputFilter.filterConfiguration.items.dropDownList.length > 0
            ? this.inputFilter.filterConfiguration.items.dropDownList[0][this.inputFilter.filterConfiguration.items.valueField]
            : null;
        break;
      default:
        break;
    }
  }

  getSelectedResult() {
    let result: any;
    this.displaySelectedValuesInHtml();
    switch (this.inputFilter.filterType) {
      case this.filterType.Dropdown:
        result = {};
        result['inputText'] = this.filterConfigurationValues.inputText;
        result['selectedDropdownValue'] = this.filterConfigurationValues.inputText ? this.filterConfigurationValues.selectedDropdownValue : null;
        break;

        case this.filterType.Date:
        result = {};
        result['inputDate'] = this.filterConfigurationValues.inputDate;
        result['selectedDropdownValue'] = this.filterConfigurationValues.inputDate ? this.filterConfigurationValues.selectedDropdownValue : null;
        break;

      case this.filterType.Checkbox:
        result = map(cloneDeep(this.filterConfigurationValues.items.list).filter(a => a.isSelected), value => {
          delete value['isSelected'];
          return value;
        });
        break;
      default:
        break;
    }
    return {
      columnId: this.columnId,
      result: result
    };
  }

  onClickGo() {
    this.filterConfigurationValues = cloneDeep(this.inputFilter.filterConfiguration);
    this.onGo.emit(this.getSelectedResult());
  }

  onClearClick() {
    switch (this.inputFilter.filterType) {
      case this.filterType.Checkbox:
        this.inputFilter.filterConfiguration = <CheckBoxFilter>this.inputFilter.filterConfiguration;
        this.inputFilter.filterConfiguration.items.list = map(this.inputFilter.filterConfiguration.items.list, result => {
          result['isSelected'] = false;
          return result;
        });
        break;
      case this.filterType.Dropdown:
        this.inputFilter.filterConfiguration = <TextBoxFilter>this.inputFilter.filterConfiguration;
        this.inputFilter.filterConfiguration.inputText = null;
        this.inputFilter.filterConfiguration.selectedDropdownValue =
          this.inputFilter.filterConfiguration.items.dropDownList && this.inputFilter.filterConfiguration.items.dropDownList.length > 0 ? this.inputFilter.filterConfiguration.items.dropDownList[0].valueField : null;
        break;
        case this.filterType.Date:
        this.inputFilter.filterConfiguration = <DateFilter>this.inputFilter.filterConfiguration;
        this.inputFilter.filterConfiguration.inputDate = null;
        this.inputFilter.filterConfiguration.selectedDropdownValue =
          this.inputFilter.filterConfiguration.items.dropDownList && this.inputFilter.filterConfiguration.items.dropDownList.length > 0 ? this.inputFilter.filterConfiguration.items.dropDownList[0].valueField : null;
        break;
      default:
        break;
    }
    this.filterConfigurationValues = cloneDeep(this.inputFilter.filterConfiguration);
    this.onClear.emit(this.getSelectedResult());
  }

  displaySelectedValuesInHtml() {
    let value;
    switch (this.inputFilter.filterType) {
      case this.filterType.Checkbox:
        const selectedValues = this.filterConfigurationValues.items.list.filter(a => a['isSelected']).map(a => a[this.filterConfigurationValues.items.textField]);
        value = selectedValues.join(',');
        break;
      case this.filterType.Dropdown:
        value =
          this.filterConfigurationValues.usePrefix && this.filterConfigurationValues.inputText
            ? this.filterConfigurationValues.items.dropDownList.find(a => a[this.filterConfigurationValues.items.valueField] === this.filterConfigurationValues.selectedDropdownValue)[this.filterConfigurationValues.items.prefixField] +
              ' ' +
              this.filterConfigurationValues.inputText
            : this.filterConfigurationValues.inputText;
        break;
        case this.filterType.Date:
        const dateString = this.filterConfigurationValues.inputDate ? moment(this.filterConfigurationValues.inputDate).format(this.filterConfigurationValues.items.displayDateFormat ? this.filterConfigurationValues.items.displayDateFormat : 'YYYY-MM-DD') : null;
        value =
          this.filterConfigurationValues.usePrefix && this.filterConfigurationValues.inputDate
            ? this.filterConfigurationValues.items.dropDownList.find(a => a[this.filterConfigurationValues.items.valueField] === this.filterConfigurationValues.selectedDropdownValue)[this.filterConfigurationValues.items.prefixField] +
              ' ' +
              dateString
            : dateString;
        break;
      default:
        break;
    }
    this.displaySelectedValues = value;
  }

  onClickOnColumn() {
    if (!this.isDisplayPopup) {
      const columnId = this.columnId;
      setTimeout(() => {
        this.onColumnClick.emit(columnId);
      });
    } else {
      this.onClose.emit(this.columnId);
    }
  }

  selectCheckboxValue(index: number) {
    this.inputFilter.filterConfiguration = <CheckBoxFilter>this.inputFilter.filterConfiguration;
    this.inputFilter.filterConfiguration.items.list[index].isSelected = !this.inputFilter.filterConfiguration.items.list[index].isSelected;
  }

  restrictInputValue(event) {
    this.inputFilter.filterConfiguration = <TextBoxFilter>this.inputFilter.filterConfiguration;
    const filterValues = this.inputFilter.filterConfiguration.numberFilter;
        const initialValue = event.target.value;
        let valueStr = event.target.value;
        const value = parseFloat(event.target.value);
        if (filterValues.decimalplaces === 0) {
            valueStr = initialValue.replace(/[^0-9]+/g, '');
        }
        const replaceStr = '/\.{' + filterValues.decimalplaces.toString() + ',}/';
        valueStr = initialValue.replace(new RegExp(this.inputFilter.filterConfiguration.dataSafeRestrictInput, 'g'), '').replace(replaceStr, '.');
        if (initialValue !== valueStr) {
            event.stopPropagation();
        }
        const valueArray = valueStr.split('.');
        if (valueArray.length >= 2) {
            valueStr = valueArray[0] + '.' + valueArray[1].slice(0, filterValues.decimalplaces);
        }
        if (valueStr.substr(0, 1) === '.' && valueArray[0] === '') {
            valueStr = filterValues.from + '.' + valueArray[1];
        }
        if ((valueArray[1] || []).length > filterValues.decimalplaces) {
            valueStr = valueArray[0] + '.' + valueArray[1].substr(0, filterValues.decimalplaces);
        }
        if (value < filterValues.from) {
            valueStr = filterValues.from.toString();
        } else if (value > filterValues.to) {
            const valStrLength = valueStr.length;
            for (let i = 0; i < valStrLength; i++) {
                if (parseFloat(valueStr) > filterValues.to) {
                    valueStr = valueArray[0].substr(0, valueStr.length - 1);
                }
            }
        }
        if (valueStr.substr(0, 1) === '0' && valueStr.length > 1) {
            if (valueStr.substr(1, 1) !== '0' && valueStr.substr(1, 1) !== '.') {
                valueStr = valueStr.substr(1, valueStr.length);
            } else if (valueStr.substr(1, 1) === '0') {
                valueStr = valueStr.substr(0, 1);
            }
        }
        return valueStr;
  }
}

