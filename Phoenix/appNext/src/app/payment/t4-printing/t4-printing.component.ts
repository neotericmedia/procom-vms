import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { NavigationService } from './../../common/services/navigation.service';
import { PhxDataTableConfiguration } from './../../common/model/data-table/phx-data-table-configuration';
import { AbstractControl } from '@angular/forms';
import { T4Service } from './../t4.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { ValidationExtensions } from './../../common/components/phx-form-control/validation.extensions';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CommonService, DialogService } from '../../common';
import { CodeValue, PhxFormControlLayoutType, PhxDataTableColumn } from '../../common/model';
import { IT4PrintWorker, IT4PrintRequestPayload } from '../share/t4-printing.interface';

enum WorkerRefineType {
  None,
  One,
  Range
}

interface IT4PrintFormT4Type {
  id: PhxConstants.T4SlipType;
  checked: boolean;
}

interface IT4PrintForm {
  organizationIdInternal: number;
  reportDate: Date;
  t4Types: IT4PrintFormT4Type[];
  excludeInactive: boolean;
  excludePrinted: boolean;

  workerRefineType: WorkerRefineType;
  contactIdWorkerSingle: number;
  contactIdWorkerRangeStart: number;
  contactIdWorkerRangeEnd: number;
}

@Component({
  selector: 'app-t4-printing',
  templateUrl: './t4-printing.component.html',
  styleUrls: ['./t4-printing.component.less']
})
export class T4PrintingComponent implements OnInit, OnDestroy {
  @ViewChild(PhxDataTableComponent) dataGrid: PhxDataTableComponent;

  listOrganizationInternal: {Id: number, DisplayName: string}[];
  listT4Type: CodeValue[];
  listWorker: IT4PrintWorker[];
  listWorkerRangeStart: IT4PrintWorker[];
  listWorkerRangeEnd: IT4PrintWorker[];

  form: FormGroup<IT4PrintForm>;

  model: IT4PrintForm;
  defaultFormValue: IT4PrintForm = {
    organizationIdInternal: null,
    reportDate: null,
    t4Types: [], // initialize before buildForm
    excludeInactive: false,
    excludePrinted: false,

    workerRefineType: WorkerRefineType.None,
    contactIdWorkerSingle: null,
    contactIdWorkerRangeStart: null,
    contactIdWorkerRangeEnd: null
  };

  formShowAll: boolean;

  dataSourceUrl: string;
  dataSourceParams: string;

  dataTableConfig: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: false,
    showSearch: false,
    showGrouping: false,
    saveUserFilters: false
  });

  columns: PhxDataTableColumn[];

  isGridLoading: boolean = false;

  layoutType = PhxFormControlLayoutType;
  workerRefineType = WorkerRefineType;

  isAlive: boolean = true;

  constructor(private t4Service: T4Service, private fb: FormBuilder, private codeValueService: CodeValueService, private navigationService: NavigationService, private commonService: CommonService, private dialogService: DialogService) {

  }

  ngOnInit() {
    this.navigationService.setTitle('t4-printing');

    this.loadLists();
    this.buildForm();
    this.buildColumns();

    this.form.valueChanges
    .takeWhile(() => this.isAlive)
    .debounceTime(300)
    .distinctUntilChanged()
    .subscribe(value => {
      this.model = { ...value };
    });

    this.form.controls.workerRefineType.valueChanges
    .takeWhile(() => this.isAlive)
    .distinctUntilChanged() // No debounce, disable/enable controls immediately
    .subscribe(value => {
      this.onChangeWorkerRefnineType(value);
    });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadLists() {
    this.t4Service.getListOrganizationInternal()
      .then(response => this.listOrganizationInternal = response);

    this.t4Service.getT4WorkerList()
      .then(response => {
        this.listWorker = response;
        this.listWorkerRangeStart = this.getWorkerRangeStartList(null);
        this.listWorkerRangeEnd = this.getWorkerRangeEndList(null);
      });

    this.listT4Type = this.codeValueService.getCodeValues('t4.CodeT4SlipType', true)
      .filter(x => x.id !== PhxConstants.T4SlipType.T4ANR); // TODO: wait for T4A-NR implementation, exclude for now
  }

  buildForm() {
    // set default t4Types
    if (!this.defaultFormValue.t4Types || !this.defaultFormValue.t4Types.length) {
      this.defaultFormValue.t4Types = this.listT4Type.map(x => {
        return {
          id: x.id,
          checked: false
        };
      });
    }
    // build form
    const value = this.defaultFormValue;
    const form = this.fb.group<IT4PrintForm>({
      organizationIdInternal: [value.organizationIdInternal, [ValidationExtensions.required()]],
      reportDate: [value.reportDate, [ValidationExtensions.required()]],
      t4Types: this.fb.array<{id: PhxConstants.T4SlipType, checked: boolean}>(
        value.t4Types.map(x => {
          return this.fb.group({
            id: x.id,
            checked: x.checked
          });
        })
      ),

      excludeInactive: value.excludeInactive,
      excludePrinted: value.excludePrinted,

      workerRefineType: [WorkerRefineType.None, [ValidationExtensions.required()]],
      contactIdWorkerSingle: [value.contactIdWorkerSingle, [ValidationExtensions.required()]],
      contactIdWorkerRangeStart: [value.contactIdWorkerRangeStart, [ValidationExtensions.required()]],
      contactIdWorkerRangeEnd: [value.contactIdWorkerRangeEnd, [ValidationExtensions.required()]]
    });

    form.controls.t4Types.setValidators([this.validateAtLeastOneChecked(), ValidationExtensions.required()]);
    this.form = form;
    this.onChangeWorkerRefnineType(this.form.value.workerRefineType);
  }

  validateAtLeastOneChecked() {
    return (c: AbstractControl) => {
      const selected: IT4PrintFormT4Type[] = c.value;
      if (selected && selected.length && selected.some(x => x.checked)) {
        return null;
      }

      return { 'required': { valid: false} };
    };
  }

  reset() {
    this.dataSourceUrl = null;
    this.form.reset(this.defaultFormValue);
    // TODO: phx-select-box and phx-date-box set the control to dirty as soon as value changes, so form.reset can't reset the form status on it's own
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  buildColumns() {
    const columns: PhxDataTableColumn[] = [
      {
        dataType: 'number',
        dataField: 'EmployeeContactId',
        caption: 'Contact Id',
      },
      {
        dataField: 'EmployeeLastName',
        caption: 'Last Name'
      },
      {
        dataField: 'EmployeeFirstName',
        caption: 'First Name'
      },
      {
        dataField: 'EmployeePrimaryEmail',
        caption: 'Email'
      },
      {
        dataType: 'number',
        dataField: 'EmployeeProfileTypeId',
        caption: 'Legal Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText('usr.CodeProfileType', true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      },
      {
        dataType: 'number',
        dataField: 'EmployeeProfileStatusId',
        caption: 'Worker Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValuesSortByText('usr.CodeProfileStatus', true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      },
      {
        dataType: 'number',
        dataField: 'T4SlipTypeId',
        caption: 'T4 Type',
        lookup: {
          dataSource: this.listT4Type,
          valueExpr: 'id',
          displayExpr: 'text'
        }
      },
      {
        dataType: 'number',
        dataField: 'IsPrinted',
        caption: 'Printing Status',
        lookup: {
          dataSource: this.getPrintingStatusLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      },
      {
        dataField: 'PrintedBy',
        caption: 'Last Printed By'
      },
      {
        dataType: 'date',
        dataField: 'PrintedDateTime',
        caption: 'Last Printed Date'
      },
    ];

    columns.forEach(x => {
      x.allowSorting = false;
    });

    this.columns = columns;
  }

  getPrintingStatusLookup() {
    return [
      {
        value: true,
        text: 'Printed'
      },
      {
        value: false,
        text: 'Not Printed'
      }
    ];
  }

  getPrintRequestPayload(): IT4PrintRequestPayload {
    const year = this.model.reportDate.getFullYear();
    const selectedTypes = this.model.t4Types.filter(x => x.checked).map(x => x.id);

    let contactIdWorkerRangeStart: number = null;
    let contactIdWorkerRangeEnd: number = null;
    switch (this.model.workerRefineType) {
      case WorkerRefineType.One:
        contactIdWorkerRangeStart = this.model.contactIdWorkerSingle === -1 ? null : this.model.contactIdWorkerSingle;
        contactIdWorkerRangeEnd = contactIdWorkerRangeStart;
        break;
      case WorkerRefineType.Range:
        contactIdWorkerRangeStart = this.model.contactIdWorkerRangeStart === -1 ? null : this.model.contactIdWorkerRangeStart;
        contactIdWorkerRangeEnd = this.model.contactIdWorkerRangeEnd === -1 ? null : this.model.contactIdWorkerRangeEnd;
        break;
    }

    const payload: IT4PrintRequestPayload = {
      OrganizationIdInternal: this.model.organizationIdInternal,
      Year: year,
      T4SlipTypes: selectedTypes,
      ExcludeInactive: this.model.excludeInactive,
      ExcludePrinted: this.model.excludePrinted,
      ContactIdWorkerRangeStart: contactIdWorkerRangeStart,
      ContactIdWorkerRangeEnd: contactIdWorkerRangeEnd
    };

    return payload;
  }

  getReport() {
    const payload = this.getPrintRequestPayload();
    const dataSourceDetails = this.t4Service.getT4PrintHistoryDataSourceDetails(payload);

    if (dataSourceDetails.url === this.dataSourceUrl && dataSourceDetails.params === this.dataSourceParams) {
      if (this.dataGrid != null) {
        this.dataGrid.refresh();
        this.isGridLoading = true;
      }
    } else {
      this.dataSourceUrl = dataSourceDetails.url;
      this.dataSourceParams = dataSourceDetails.params;
      this.isGridLoading = true;
    }

  }

  onT4SlipPrintHistoryReceived(event: any) {
    this.isGridLoading = false;
  }

  cancelReport() {
    this.dataSourceUrl = null;
  }

  print() {
    if (this.dataGrid && this.dataGrid.totalCount) {
      const total = this.dataGrid.totalCount;
      const payload = this.getPrintRequestPayload();

      this.dialogService.confirm('Confirm', `Are you sure you want to generate ${total} slips?`)
      .then(() => {
        this.t4Service.executeCommand('T4SlipsAddToPrintQueue', payload)
        .then(() => {
          this.commonService.logSuccess(`${total} slips added to the print queue`);
        });
      });
    } else {
      console.error('No items to print!');
    }
  }

  onChangeWorkerRangeStart(value: number) {
    const boundaryValue = this.listWorker.find(x => x.Id === value);
    this.listWorkerRangeEnd = this.getWorkerRangeEndList(boundaryValue);
  }

  onChangeWorkerRangeEnd(value: number) {
    const boundaryValue = this.listWorker.find(x => x.Id === value);
    this.listWorkerRangeStart = this.getWorkerRangeStartList(boundaryValue);
  }

  onChangeWorkerRefnineType(value: WorkerRefineType) {
    switch (value) {
      case WorkerRefineType.One:
        this.form.controls.contactIdWorkerSingle.enable();
        this.form.controls.contactIdWorkerRangeStart.disable();
        this.form.controls.contactIdWorkerRangeEnd.disable();
        break;
      case WorkerRefineType.Range:
        this.form.controls.contactIdWorkerSingle.disable();
        this.form.controls.contactIdWorkerRangeStart.enable();
        this.form.controls.contactIdWorkerRangeEnd.enable();
        break;
      case WorkerRefineType.None:
      default:
        this.form.controls.contactIdWorkerSingle.disable();
        this.form.controls.contactIdWorkerRangeStart.disable();
        this.form.controls.contactIdWorkerRangeEnd.disable();
        break;
    }

    this.form.updateValueAndValidity();
  }

  getWorkerRangeStartList(boundaryValue: IT4PrintWorker): IT4PrintWorker[] {
    let result: IT4PrintWorker[] = [];

    if (boundaryValue != null) {
      result = this.listWorker.filter(x => x.Index < boundaryValue.Index);
    } else {
      result = this.listWorker.map(x => x);
    }

    result.unshift({
      Id: -1,
      DisplayName: 'From Beginning',
      Index: -1,
      template: '<strong>From Beginning</strong>'
    });

    return result;
  }

  getWorkerRangeEndList(boundaryValue: IT4PrintWorker): IT4PrintWorker[] {
    let result: IT4PrintWorker[] = [];

    if (boundaryValue != null) {
      result = this.listWorker.filter(x => x.Index > boundaryValue.Index);
    } else {
      result = this.listWorker.map(x => x);
    }

    result.unshift({
      Id: -1,
      DisplayName: 'To End',
      Index: result.length,
      template: '<strong>To End</strong>'
    });

    return result;
  }

}
