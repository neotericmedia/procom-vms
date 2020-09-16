import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { PhxDataColumnLookup } from './phx-data-column-lookup';
import { PhxDataTableEditorOptions } from './../index';
import { EdmLiteral } from 'devextreme/data/odata/utils';
// https://js.devexpress.com/Documentation/17_1/ApiReference/UI_Widgets/dxDataGrid/Configuration/columns/
export class PhxDataTableColumn {
  dataField: string;
  caption: string;
  dataType?: string = 'string';
  name?: string;
  width?: any;
  minWidth?: number;
  visible?: boolean;
  showInColumnChooser?: boolean;
  visibleIndex?: number;
  hidingPriority?: number;
  format?: any;
  filterValue?: any;
  filterValues?: any[];
  editorOptions?: PhxDataTableEditorOptions;
  fixed?: boolean = false;
  alignment?: string = 'left'; // left, right, center
  allowFixing?: boolean = true;
  allowResizing?: boolean = true;
  allowHiding?: boolean = true;
  allowReordering?: boolean = true;
  allowFiltering?: boolean = true;
  allowSearch?: boolean = true;
  allowGrouping?: boolean = true;
  allowExporting?: boolean = true;
  allowHeaderFiltering?: boolean = true;
  allowSorting?: boolean = true;
  sortOrder?: string; // asc, desc
  sortIndex?: number;
  lookup?: PhxDataColumnLookup;
  precision?: number;
  // "string"	[ "contains", "notcontains", "startswith", "endswith", "=", "<>" ]
  // "numeric"	[ "=", "<>", "<", ">", "<=", ">=", "between" ]
  // "date"	[ "=", "<>", "<", ">", "<=", ">=", "between" ]
  filterOperations?: Array<string>;
  selectedFilterOperation?: string; // '=' | '<>' | '<' | '<=' | '>' | '>=' | 'notcontains' | 'contains' | 'startswith' | 'endswith' | 'between'

  cssClass?: string;
  fixedPosition?: string; // left, right , default is undefined
  cellTemplate?: any;
  headerCellTemplate?: any;
  isArray?: boolean = false;
  calculateDisplayValue?: any;
  calculateFilterExpression?: any;
  calculateSortValue?: any;
  calculateGroupValue?: any;
  customizeText?: any;
  encodeHtml?: boolean;
  isFromOdata?: boolean = true;

  constructor(params: PhxDataTableColumn) {
    params = Object.assign(
      {
        isFromOdata: true
      },
      params
    );

    if (params.dataType === 'money') {
      params.format = { type: 'fixedPoint', precision: 2 };
      params.alignment = 'right';
    }
    if (params.dataType === 'decimal' || params.dataType === 'money') {
      params.dataType = 'number';
      if (params.isFromOdata) {
        params.calculateFilterExpression =
          params.calculateFilterExpression ||
          function(filterValue, selectedFilterOperation) {
            let value = filterValue;
            if (Number.isFinite(filterValue)) {
              value = new EdmLiteral(filterValue + 'm');
            } else if (selectedFilterOperation === 'between') {
              if (Number.isFinite(filterValue[0]) && Number.isFinite(filterValue[1])) {
                const filterExpression = [[(<any>this).dataField, '>=', new EdmLiteral(filterValue[0] + 'm')], 'and', [(<any>this).dataField, '<=', new EdmLiteral(filterValue[1] + 'm')]];
                return filterExpression;
              }
              return undefined;
            }
            return [(<any>this).dataField, selectedFilterOperation || '=', value];
          };
      }
    }
    if (params.dataType === 'date' && (params.cellTemplate == null || params.cellTemplate === '')) {
      params.cellTemplate = 'defaulDateCellTemplate';
    }
    if (params.lookup) {
      params.calculateFilterExpression =
        params.calculateFilterExpression ||
        function(filterValue, selectedFilterOperation) {
          if (filterValue && filterValue.length) {
            const filterExpression = [];
            for (let i = 0; i < filterValue.length; i++) {
              const filterExpr = [this.dataField, selectedFilterOperation || '=', filterValue[i]];
              if (i > 0) {
                if (selectedFilterOperation === 'notcontains') {
                  filterExpression.push('and');
                } else {
                  filterExpression.push('or');
                }
              }
              filterExpression.push(filterExpr);
            }
            return filterExpression;
          }
        };
    }

    Object.assign(this, params);
  }

  static isTest = {
    lookupDataSource: (localizationService: PhxLocalizationService) => {
      return [
        {
          id: 1,
          code: 'Test',
          text: localizationService.translate('common.phxDataTable.implementationCellTest'),
          value: true
        },
        {
          id: 2,
          code: 'Live',
          text: localizationService.translate('common.phxDataTable.implementationCellLive'),
          value: false
        }
      ];
    }
  };
}
