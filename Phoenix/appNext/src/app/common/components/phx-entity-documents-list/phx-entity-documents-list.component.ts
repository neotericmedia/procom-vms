import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { PhxConstants } from '../..';
import { PhxDocument, EntityList } from '../../model';
import { CommonService } from '../../services/common.service';
import { CodeValueService } from '../../services/code-value.service';
import { InputFilter, TextBoxFilter, DateFilter, CheckBoxFilter } from '../../model/advance-filter/phx-advance-filter';
import { isEqual, cloneDeep, forEach, sortBy } from 'lodash';
import * as moment from 'moment';
import { DialogService } from '../../services/dialog.service';

declare var oreq: any;

@Component({
  selector: 'phx-entity-documents-list',
  templateUrl: './phx-entity-documents-list.component.html',
  styleUrls: ['./phx-entity-documents-list.component.less']
})
export class PhxEntityDocumentsListComponent implements OnInit {

  @Input() entityTypeId: PhxConstants.EntityType;
  @Input() entityId: number;
  @Input() canDeleteDocumentFn: Function;
  @Input() documentTypesList: PhxConstants.DocumentType[];

  @Output() documentDeleteFailed = new EventEmitter<any>();

  inputFilterForFileName: InputFilter;
  inputFilterForUploadedBy: InputFilter;
  inputFilterForDocumentType: InputFilter;
  inputFilterForDate: InputFilter;

  html: {
    documentsList: EntityList<PhxDocument>
    phxConstants: typeof PhxConstants,
    columnsKey: typeof EntityDocumentsListColumnsKey;
    validationMessages: Array<{ PropertyName: string, Message: string }>;
    scrollConfig: {
      infiniteScrollDistance: number;
      scrollWindow: boolean;
      infiniteScrollThrottle: number;
    };
    filterSelectedStatus: {
      isFileNameClicked: boolean;
      isUploadedByClicked: boolean;
      isDocumentTypeClicked: boolean;
      isDateClicked: boolean;
    };
    tableState: {
      isLoadedFromPreviousState: boolean;
      pagination: {
        currentPage: number;
        number: number;
        pageSize: number;
        start: number;
      };
      search: {
        predicateObject: any;
      };
      sort: {
        predicate: any;
        reverse: boolean;
      };
    };
  } = {
      validationMessages: [],
      columnsKey: EntityDocumentsListColumnsKey,
      scrollConfig: {
        infiniteScrollDistance: 2,
        scrollWindow: false,
        infiniteScrollThrottle: 750
      },
      filterSelectedStatus: {
        isFileNameClicked: false,
        isUploadedByClicked: false,
        isDocumentTypeClicked: false,
        isDateClicked: false
      },
      documentsList: {
        Count: 0,
        Items: [],
        NextPageLink: null
      },
      phxConstants: PhxConstants,
      tableState: {
        isLoadedFromPreviousState: false,
        pagination: {
          currentPage: 1,
          number: 20,
          pageSize: 20,
          start: 0
        },
        search: {
          predicateObject: {}
        },
        sort: {
          predicate: EntityDocumentsListColumnsKey.FileName,
          reverse: false
        }
      }
    };

  sortNumber: number;

  constructor(private documentService: DocumentService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private dialogs: DialogService) {

  }

  ngOnInit() {

  }

  sortBy(key: any) {
    if (this.html.tableState.sort.predicate === key) {
      this.sortNumber++;
      this.sortNumber = this.sortNumber > 2 ? 0 : this.sortNumber;
      switch (this.sortNumber) {
        case 0:
          this.html.tableState.sort.reverse = false;
          break;
        case 1:
          this.html.tableState.sort.reverse = true;
          break;
        case 2:
          this.html.tableState.sort.predicate = null;
          this.html.tableState.sort.reverse = false;
          break;
        default:
          break;
      }
    } else {
      this.html.tableState.sort.predicate = key;
      this.sortNumber = 0;
    }

    this.resetTableStateConfig();
    this.loadDocumentsList();
  }

  resetTableStateConfig() {
    this.html.documentsList = {
      Count: null,
      Items: [],
      NextPageLink: null
    };
    this.html.tableState.pagination.currentPage = 1;
    this.html.tableState.pagination.start = 0;
  }

  getDocumentTypeName(documentType: PhxConstants.DocumentType) {
    return this.codeValueService.getCodeValue(documentType, this.commonService.CodeValueGroups.DocumentType).text;
  }

  loadDocumentsList() {
    const oDataParams = oreq
      .request()
      .withSelect(['Name', 'UploadedByFullName', 'DocumentTypeId', 'UploadedDatetime', 'PublicId'])
      .url();

    this.documentService.getEntityDocumentsList(this.entityTypeId, this.entityId, this.html.tableState, oDataParams).subscribe(result => {
      this.html.documentsList = result;
    }, error => {
      const errMsg = 'An error occured on loading document list';
      console.log(`${errMsg} -----------------------------------------`);
      console.log(error);
      this.commonService.logError(errMsg);
    });
  }

  setTableStatePredicateObjectFromFilterOutput(event) {
    this.html.tableState.search.predicateObject[event.columnId] = this.processResult(event);
  }

  processResult(event) {
    let result: any = null;
    switch (event.columnId) {
      case this.html.columnsKey.FileName:
      case this.html.columnsKey.UploadedByFullName:
        result = event.result.inputText ? '\'' + event.result.inputText + '\'' + event.result.selectedDropdownValue : null;
        break;
      case this.html.columnsKey.DocumentTypeId:
        return event.result.map(i => i.value);
      case this.html.columnsKey.UploadedDatetime:
        result = this.processDateFilterInput(event);
        break;
    }

    return result;
  }

  processDateFilterInput(event) {
    let prefixName: string;
    let result: string;
    let dateFormat: string;
    let joinOperator: string;
    if (!event.result.selectedDropdownValue) {
      return;
    }
    let value = event.result.selectedDropdownValue.split(',');
    value = value.map(a => a && a.trim());
    switch (event.columnId) {
      case this.html.columnsKey.FileName:
        prefixName = 'Name';
        break;
      case this.html.columnsKey.UploadedByFullName:
        prefixName = 'UploadedByFullName';
        break;
      case this.html.columnsKey.DocumentTypeId:
        prefixName = 'DocumentTypeId';
        break;
      case this.html.columnsKey.UploadedDatetime:
        prefixName = 'UploadedDatetime';
        break;
    }

    if (value.length === 1) {
      dateFormat = value[0] === 'le datetime' || value[0] === 'gt datetime' ? 'YYYY-MM-DDTHH:mm:ss' : 'YYYY-MM-DD';
    } else {
      if (value.length > 1 && value.filter(a => a === 'ge datetime').length === 1) {
        joinOperator = 'and';
      }
      if (value.length > 1 && value.filter(a => a === 'gt datetime').length === 1) {
        joinOperator = 'or';
      }
      dateFormat = 'YYYY-MM-DD';
    }

    forEach(value, (val: string, index: number) => {
      let noOfDays: number = 0;
      if (index > 0) {
        noOfDays = 1;
      }
      if (dateFormat === 'YYYY-MM-DD') {
        result =
          (result ? result + ' ' + joinOperator + ' ' : '') +
          prefixName +
          ' ' +
          val +
          '\'' +
          moment(event.result.inputDate)
            .add(noOfDays, 'days')
            .format(dateFormat) +
          '\'';
      } else {
        result =
          (result ? result + ' ' + joinOperator + ' ' : '') +
          prefixName +
          ' ' +
          val +
          '\'' +
          moment(event.result.inputDate)
            .add(23, 'hour')
            .add(59, 'minute')
            .add(59, 'second')
            .format(dateFormat) +
          '\'';
      }
    });
    console.log('result::', result);
    return result;
  }

  onColumnClicked(event) {
    this.closeAllFilterPopup(event.columnId);
    switch (event) {
      case this.html.columnsKey.FileName:
        this.inputFilterForFileName = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: false,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.columnsKey.FileName),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: null
            }
          }
        };
        this.html.filterSelectedStatus.isFileNameClicked = true;
        break;
      case this.html.columnsKey.UploadedDatetime:
        this.inputFilterForDate = {
          filterType: PhxConstants.FilterType.Date,
          filterConfiguration: <DateFilter>{
            inputDate: null,
            selectedDropdownValue: 'gt datetime',
            usePrefix: true,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.columnsKey.UploadedDatetime),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: 'prefixSymbol',
              displayDateFormat: PhxConstants.DateFormat.mediumDate
            }
          }
        };
        this.html.filterSelectedStatus.isDateClicked = true;
        break;
      case this.html.columnsKey.UploadedByFullName:
        this.inputFilterForUploadedBy = {
          filterType: PhxConstants.FilterType.Dropdown,
          filterConfiguration: <TextBoxFilter>{
            inputText: null,
            selectedDropdownValue: null,
            usePrefix: false,
            items: {
              dropDownList: this.getFilterInputDropdownList(this.html.columnsKey.FileName),
              textField: 'textField',
              valueField: 'valueField',
              prefixField: null
            }
          }
        };
        this.html.filterSelectedStatus.isUploadedByClicked = true;
        break;
      case this.html.columnsKey.DocumentTypeId:
        this.inputFilterForDocumentType = {
          filterType: PhxConstants.FilterType.Checkbox,
          filterConfiguration: <CheckBoxFilter>{
            selectedValues: [],
            items: {
              list: this.documentTypesList,
              textField: 'text',
              valueField: 'value'
            }
          }
        };
        this.html.filterSelectedStatus.isDocumentTypeClicked = true;
        break;
      default:
        break;
    }
  }

  getFilterInputDropdownList(columnKey) {
    const textBoxFilter = [
      {
        valueField: '000',
        textField: 'Equal(Exact Value)',
        prefixSymbol: '='
      },
      {
        valueField: '100',
        textField: 'Not Equal',
        prefixSymbol: '!='
      },
      {
        valueField: '200',
        textField: 'Greater Than',
        prefixSymbol: '>'
      },
      {
        valueField: '300',
        textField: 'Greater than or equal',
        prefixSymbol: '>='
      },
      {
        valueField: '400',
        textField: 'Less than',
        prefixSymbol: '<'
      },
      {
        valueField: '500',
        textField: 'Less than or equal',
        prefixSymbol: '<='
      }
    ];
    const dateFilter = [
      {
        valueField: 'ge datetime, lt datetime',
        textField: 'On the selected day',
        prefixSymbol: '='
      },
      {
        valueField: 'lt datetime, gt datetime',
        textField: 'Any other day',
        prefixSymbol: '!='
      },
      {
        valueField: 'gt datetime',
        textField: 'All days above selected date',
        prefixSymbol: '>'
      },
      {
        valueField: 'ge datetime',
        textField: 'All days above and including the day',
        prefixSymbol: '>='
      },
      {
        valueField: 'lt datetime',
        textField: 'All days prior to the day',
        prefixSymbol: '<'
      },
      {
        valueField: 'le datetime',
        textField: 'All days prior to and including the day',
        prefixSymbol: '<='
      }
    ];

    const stringFilter = [
      {
        valueField: '000',
        textField: 'Found within'
      },
      {
        valueField: '100',
        textField: 'Start\'s with'
      },
      {
        valueField: '200',
        textField: 'Ends\'s with'
      }
    ];

    let selectedFilter: any = [];
    switch (columnKey) {
      case this.html.columnsKey.FileName:
      case this.html.columnsKey.UploadedByFullName:
        selectedFilter = cloneDeep(stringFilter);
        break;
      case this.html.columnsKey.UploadedDatetime:
        selectedFilter = cloneDeep(dateFilter);
        break;
      case this.html.columnsKey.UploadedByFullName:
        selectedFilter = cloneDeep(textBoxFilter);
        break;
      default:
        break;
    }

    return selectedFilter;
  }

  closeAllFilterPopup(event) {
    forEach(Object.keys(this.html.filterSelectedStatus), key => {
      this.html.filterSelectedStatus[key] = false;
    });
  }

  onGo(event) {
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup(event.columnId);
    this.loadDocumentsList();
  }

  onClear(event) {
    this.setTableStatePredicateObjectFromFilterOutput(event);
    this.closeAllFilterPopup(event.columnId);
    this.loadDocumentsList();
  }

  sortAndFilter() {
    if (this.html.tableState.sort.predicate) {
      let key: string;
      switch (this.html.tableState.sort.predicate) {
        case this.html.columnsKey.FileName:
          key = 'Name';
          break;
        case this.html.columnsKey.DocumentTypeId:
          key = 'StartDate';
          break;
        case this.html.columnsKey.DocumentTypeId:
          key = 'DocumentTypeId';
          break;
        case this.html.columnsKey.UploadedByFullName:
          key = 'UploadedByFullName';
          break;
        case this.html.columnsKey.UploadedDatetime:
          key = 'UploadedDatetime';
          break;
        default:
          key = this.html.tableState.sort.predicate;
          break;
      }

      this.html.documentsList.Items = sortBy(this.html.documentsList.Items, key);

      if (this.html.tableState.sort.reverse) {
        this.html.documentsList.Items = this.html.documentsList.Items.reverse();
      }
    }
  }

  canDeleteDocument(document: PhxDocument) {
    if (this.canDeleteDocumentFn) {
      return this.canDeleteDocumentFn(document);
    } else {
      return true;
    }
  }

  documentDelete(document: PhxDocument) {
    const that = this;
    const dlg = this.dialogs.confirm('Document Delete', 'This document will be deleted. Continue?');
    dlg.then(function (btn) {
      that.documentService.deleteDocumentByPublicId(document.PublicId).then(
        (responseSucces) => {
          if (responseSucces.IsValid) {
            that.loadDocumentsList();
          }
        },
        (responseError) => {
          that.loadDocumentsList();
          if (that.documentDeleteFailed) {
            that.documentDeleteFailed.emit();
          } else {
            that.html.validationMessages = that.commonService.parseResponseError(responseError);
          }
        }
      );
    }, (btn) => {
      console.log('User cancelled the operation');
    });
  }

  getPdfStreamByPublicId(publicId: string) {
    return this.documentService.createPdfDocumentLink(publicId);
  }

}

export enum EntityDocumentsListColumnsKey {
  FileName = <any>'Name',
  UploadedByFullName = <any>'UploadedByFullName',
  DocumentTypeId = <any>'DocumentTypeId',
  UploadedDatetime = <any>'UploadedDatetime'
}
