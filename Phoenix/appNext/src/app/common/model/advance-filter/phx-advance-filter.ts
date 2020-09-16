import { PhxConstants } from './../phx-constants';
export interface InputFilter {
  filterType: PhxConstants.FilterType;
  filterConfiguration: TextBoxFilter | CheckBoxFilter | DateFilter;
}

export interface TextBoxFilter {
  inputText: string;
  selectedDropdownValue: any;
  usePrefix: boolean;
  items: {
    dropDownList: Array<any>;
    textField: string;
    valueField: string;
    prefixField: string;
  };
  dataSafeRestrictInput?: string;
  numberFilter?: NumberFilter;
}

export interface DateFilter {
  inputDate: string;
  selectedDropdownValue: any;
  usePrefix: boolean;
  items: {
    dropDownList: Array<any>;
    textField: string;
    valueField: string;
    prefixField: string;
    displayDateFormat?: string;
  };
}

export interface CheckBoxFilter {
  selectedValues: Array<any>;
  items: {
    list: Array<any>;
    textField: string;
    valueField: string;
  };
}

export interface NumberFilter {
  from: number;
  to: number;
  decimalplaces: number;
  // { 'from': 0, 'to': 999999999999.99, 'decimalplaces': 2 }
}
