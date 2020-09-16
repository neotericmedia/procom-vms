import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { DxComponent, DxDataGridComponent, DxTemplateHost, WatcherHelper } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import * as moment from 'moment';
import * as _ from 'lodash';
import { PhxConstants } from '../..';
import { ApiService } from '../../../common/services/api.service';
import { DialogResultType, PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableState, PhxDataTableStateSavingMode, PhxDataTableSummaryItem, PhxDataTableUserProfile, PhxDataTableStateDetail } from '../../model/index';
import { DialogService } from '../../services/dialog.service';
import { PhxDataTableService } from '../../services/phx-data-table.service';
import { PhxLocalizationService } from './../../services/phx-localization.service';
import { TransferState } from '@angular/platform-browser';
import DataGrid from 'devextreme/ui/data_grid';

(<any>DataGrid).registerModule('columnChooserSorting', {
  extenders: {
    controllers: {
      columns: {
        getChooserColumns: function (loadAllColumns) {
          const result = this.callBase(loadAllColumns);
          return result.sort(function (column1, column2) {
            return column1.caption.localeCompare(column2.caption);
          });
        }
      }
    }
  }
});

@Component({
  selector: 'app-phx-data-table',
  templateUrl: './phx-data-table.component.html',
  styleUrls: ['./phx-data-table.component.less']
})
export class PhxDataTableComponent extends DxComponent implements OnInit, AfterContentInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('grid') grid: DxDataGridComponent;
  @ViewChild('addStateForm') addStateForm: any;
  @ViewChild('saveModal') saveModal: any;
  @Input() configuration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});
  @Input() columns: Array<PhxDataTableColumn>;
  @Input() summary: Array<PhxDataTableSummaryItem>;

  @Input() dataSource: any;
  @Input() dataSourceUrl: string;
  @Input() dataSourceParams: string;

  @Input() componentName: string;
  @Input() exportFileName: string;
  @Input() debug: boolean = false;

  @Input() height: string = 'auto';
  @Input() dataStoreKey: string[];
  @Input() defaultStateName: string = '';

  @Output() responseReceived: EventEmitter<any> = new EventEmitter<any>();
  @Output() editorPreparing: EventEmitter<any> = new EventEmitter<any>();
  @Output() editorPrepared: EventEmitter<any> = new EventEmitter<any>();
  @Output() contentReady: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectionChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() cellClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowPrepared: EventEmitter<any> = new EventEmitter<any>();
  @Output() cellPrepared: EventEmitter<any> = new EventEmitter<any>();
  @Output() masterRowExpanding: EventEmitter<any> = new EventEmitter<any>();

  @Output() contextMenuPreparing: EventEmitter<any> = new EventEmitter<any>();

  @Output() contextMenuOpenTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() exporting: EventEmitter<any> = new EventEmitter<any>();
  @Output() exported: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileSaving: EventEmitter<any> = new EventEmitter<any>();

  initState: PhxDataTableState;
  defaultState: PhxDataTableUserProfile;
  states: Array<PhxDataTableUserProfile>;
  lastDefaultState: string;
  isSavingDefaultState: boolean = false;
  anyPendingSaveDefaultState: boolean = false;
  PhxDataTableStateSavingMode = PhxDataTableStateSavingMode;
  dateColumnFormat = PhxConstants.DateFormat.mediumDate;

  selectedState: PhxDataTableStateDetail = { Name: '', Description: '', Id: 0 };
  nameIsChanged: boolean = false;
  newStateDescription: string = '';
  stateNamePattern = /^[a-zA-Z][ a-zA-Z0-9]*$/;
  stateNames: string[] = [];
  stateDetails: PhxDataTableStateDetail[] = [];
  totalCount: number;
  currentCount: number;

  phxDataSource: any = {};
  hasFilter: boolean = false;

  exportConfig = { enabled: this.configuration.enableExport, fileName: this.exportFileName };

  columnChooserConfig = {
    enabled: this.configuration.showColumnChooser,
    width: 300,
    height: 350,
    title: 'common.phxDataTable.columnChooserTitle',
    emptyPanelText: 'common.phxDataTable.columnChooserEmptyPanelText',
    mode: 'select',
    allowSearch: true,
  };

  saveStateModalButtons = [];

  stateStoringConfig = {
    enabled: true,
    type: 'custom',
    storageKey: this.componentName,
    customLoad: () => { },
    customSave: (gridState) => {
      this.customSave(gridState);
    }
  };

  masterDetailConfig = {
    enabled: this.configuration.enableMasterDetail,
    template: this.configuration.masterDetailTemplateName
  };

  loadPanelConfig = {
    enabled: 'auto',
    height: 90,
    indicatorSrc: './../../../../assets/loading.gif',
    showIndicator: true,
    showPane: true,
    text: this.configuration.loadPanelText,
    width: 200
  };

  private hasInited: boolean = false;

  public getDataSource() {
    return this.grid.instance.getDataSource();
  }

  public getSelectedRowsData(): any {
    if (this.grid && this.grid.instance) {
      return this.grid.instance.getSelectedRowsData();
    }
    return null;
  }

  constructor(
    private eRef: ElementRef
    , ngZone: NgZone
    , private templateHost: DxTemplateHost
    , private _watcherHelper: WatcherHelper
    , private dataTableService: PhxDataTableService
    , private apiService: ApiService
    , private dialogService: DialogService
    , private locale: PhxLocalizationService
    , transferState: TransferState
    , @Inject(PLATFORM_ID) platformId: any
  ) {
    super(eRef, ngZone, templateHost, _watcherHelper, transferState, platformId);
    this.saveStateModalButtons = [
      {
        icon: 'save',
        tooltip: locale.translate('common.generic.save'),
        btnType: 'primary',
        btnClasses: ['customToolbarButton'],
        action: () => {
          this.addState();
        },
        disabled: () => !this.addStateForm.valid
      },
      {
        icon: 'clear',
        tooltip: locale.translate('common.generic.cancel'),
        btnType: 'default',
        btnClasses: ['customToolbarButton'],
        action: () => {
          this.cancelSaveState();
        }
      }
    ];
  }

  public refresh() {
    this.grid.instance.refresh();
  }

  public updateDimensions() {
    this.grid.instance.updateDimensions();
  }

  public clearSelection() {
    this.grid.instance.clearSelection();
  }

  public beginUpdate() {
    this.grid.instance.beginUpdate();
  }

  public endUpdate() {
    this.grid.instance.endUpdate();
  }

  ngOnInit() {
    this.applyLocalization();

    this.defaultState = this.dataTableService.createEmptyPhxDataTableUserProfile(this.componentName);
    if (this.configuration.stateSavingMode !== PhxDataTableStateSavingMode.None) {
      this.loadStates().then(() =>
        this.phxDataSource = this.buildDataSource(this.phxDataSource));
    } else {
      this.phxDataSource = this.buildDataSource(this.phxDataSource);
    }

    this.rebindConfiguration();
    this.rebindDataSource();

    this.hasInited = true;
  }

  ngAfterContentInit(): void {
    this.templates.forEach(template => this.grid.templates.push(template));
  }

  ngAfterViewInit(): void {
    if (this.createInstanceOnInit) {
      this.endUpdate();
    }

    const columnChooserView = (<any>this.grid.instance).getView('columnChooserView');
    if (!columnChooserView._popupContainer) {
      columnChooserView._initializePopupContainer();
      columnChooserView.render();
      columnChooserView._popupContainer.option('position', { my: 'center', at: 'center' });
      columnChooserView._popupContainer.option('onShown', (component, element, model) => {
        this.beginUpdate();
      });
      columnChooserView._popupContainer.option('onHidden', (component, element, model) => {
        this.endUpdate();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.hasInited) {

      if (changes['exportFileName'] || (changes['configuration'] && changes['configuration'].currentValue)) {
        this.rebindConfiguration();
      }

      if (changes['dataSource'] || changes['dataSourceUrl'] || changes['dataSourceParams']) {
        let isNeedRefresh = false;
        if (changes['dataSourceParams']) {
          isNeedRefresh = true;
        }
        if (changes && changes['dataSourceUrl'] && changes['dataSourceUrl'].currentValue) {
          this.dataSourceUrl = changes['dataSourceUrl'].currentValue;
          isNeedRefresh = true;
        }

        this.rebindDataSource();

        if (isNeedRefresh) {
          this.grid.instance.refresh();
        }
      }
    }
  }

  ngOnDestroy() {
    this.grid.instance.hideColumnChooser();
  }

  _createInstance(element: any, options: any) {
    return this.grid.instance;
  }

  applyLocalization() {
    this.columnChooserConfig.title = this.locale.translate(this.columnChooserConfig.title);
    this.columnChooserConfig.emptyPanelText = this.locale.translate(this.columnChooserConfig.emptyPanelText);
  }

  rebindConfiguration() {
    this.exportConfig.fileName = this.exportFileName;
    this.exportConfig.enabled = this.configuration.enableExport;
    this.columnChooserConfig.enabled = this.configuration.showColumnChooser;
    this.masterDetailConfig.enabled = this.configuration.enableMasterDetail;
    this.masterDetailConfig.template = this.configuration.masterDetailTemplateName;
    this.loadPanelConfig.text = this.configuration.loadPanelText || this.locale.translate('common.phxDataTableConfiguration.loadPanelText');
    this.loadPanelConfig.enabled = this.configuration.loadPanelEnabled;

    if (!this.configuration.noDataText) {
      this.configuration.noDataText = this.locale.translate('common.phxDataTableConfiguration.noDataText');
    }
  }

  rebindDataSource() {
    this.totalCount = 0;
    this.currentCount = 0;
    this.phxDataSource = this.buildDataSource(this.phxDataSource);
  }

  showPopup() {
    this.saveModal.show();
  }

  hidePopup() {
    this.saveModal.hide();
  }

  onEditorPreparing(event) {
    const self = this;
    if (event.parentType === 'filterRow' && event.editorName === 'dxSelectBox' && event.lookup) {

      // convert previously saved selectbox preference to tagbox
      if (event.value && !_.isArray(event.value)) {
        event.value = [event.value];
      }

      event.editorName = 'dxTagBox';

      _.assign(event.editorOptions, {
        dataSource: event.lookup.dataSource,
        displayExpr: event.lookup.displayExpr,
        valueExpr: event.lookup.valueExpr,
        value: event.value || [],
        showSelectionControls: true,
        showDropDownButton: false,
        showClearButton: false,
        hideSelectedItems: false,
        multiline: false,
        maxDisplayedTags: 1,
        searchEnabled: true,
        activeStateEnabled: false,
        placeholder: this.locale.translate('common.phxDataTable.tagboxPlaceholder'),
        onFocusOut: function (e) {
          const component = e ? e.component : null;
          if (component) {
            component.close();
          }
        },
        onClosed: function (e) {
          const component = e ? e.component : null;
          const value = component ? component.option('value') : null;
          event.setValue(value);
        },
        onOpened: function (e) {
          const list = e && e.component ? e.component.content() : null;
          const listParent = list ? list.parentElement : null;
          const width = listParent && listParent.style ? parseInt(listParent.style.width, 10) : null;
          if (width) {
            listParent.style.width = width + 50 + 'px';
          }
        },
        onMultiTagPreparing: function (e) {
          const len = e && e.selectedItems ? e.selectedItems.length : 0;
          if (len) {
            e.text = self.locale.translate('common.phxDataTable.tagboxMultiTagText', len);
          } else {
            e.cancel = true;
          }
        },
        onValueChanged: function (e) {
          const component = e ? e.component : null;
          const value = component ? component.option('value') : null;
          const opened = component ? component.option('opened') : false;
          if (!opened) {
            event.setValue(value);
          }
        }
      });
    }
    this.editorPreparing.emit(event);
  }

  onEditorPrepared(event) {
    this.editorPrepared.emit(event);
  }

  onContentReady(event) {
    this.handleFilters();
    this.contentReady.emit(event);
  }

  onSelectionChanged(event) {
    this.selectionChanged.emit(event);
  }

  onRowClick(event: any) {
    this.rowClick.emit(event);
  }

  onMasterRowExpanding(event: any) {
    this.masterRowExpanding.emit(event);
  }

  onCellClick(event: any) {
    this.cellClick.emit(event);
  }

  onResponseReceived(event: any) {
    this.responseReceived.emit(event);
  }
  onRowPrepared(event: any) {
    if (this.configuration.rowHighlightingConfig) {
      if (event.rowType === 'data' && event.data[this.configuration.rowHighlightingConfig.fieldName]) {
        event.rowElement.classList.add(this.configuration.rowHighlightingConfig.cssClass);
      }
    }
    this.rowPrepared.emit(event);
  }

  onCellPrepared(event: any) {
    this.cellPrepared.emit(event);
  }
  onToolbarPreparing(e) {
    e.toolbarOptions.items.unshift({
      location: 'after',
      template: 'toolbarContent'
    });
    if (this.configuration.showToolbar === false) {
      e.toolbarOptions.visible = false;
    }
  }

  onContextMenuPreparing(event: any) {
    this.contextMenuPreparing.emit(event);
    if (event && event.row && event.row.rowType === 'data' && this.configuration.showOpenInNewTab) {
      event.items = [{
        text: this.locale.translate('common.phxDataTable.contextMenuOpenNewTab'),
        onItemClick: () => {

          this.contextMenuOpenTab.emit(event.row.data);
        }
      }];
    }
  }

  onExporting(event: any) {
    this.exporting.emit(event);
  }

  onExported(event: any) {
    this.exported.emit(event);
  }

  onFileSaving(event: any) {
    this.fileSaving.emit(event);
  }

  private populateStateNames() {
    this.stateDetails = this.states.filter(i => i.StateName !== '').map(i => {
      return {
        Id: i.Id,
        Name: i.StateName,
        Description: i.StateDescription
      };
    });
  }

  private loadGridFromState(state: PhxDataTableState) {
    // Keep the original state at the begining
    if (this.initState == null) {
      this.initState = this.grid.instance.state();
    }

    this.grid.instance.state(state);
    this.grid.instance.refresh();
  }

  private loadStates() {
    return this.dataTableService.getStates(this.componentName).then((data) => {

      this.states = data.Items;
      if (this.states.length > 0) {
        let stateToApply = {};
        const defaultStateIndex = this.states.findIndex(item => item.StateName === this.defaultStateName);
        if (defaultStateIndex > -1) {
          this.defaultState = this.states[defaultStateIndex];
          stateToApply = this.states[defaultStateIndex].State;
        } else {
          stateToApply = this.states[0].State;
        }
        this.loadGridFromState(stateToApply);
      }

      this.populateStateNames();

    }).catch((ex) => {
      console.error('Error fetching states', ex);
    });

  }

  private handleFilters() {
    const isFilter = function (filter) {
      return (_.isArray(filter) && !(_.isArray(filter[2]) && filter[2].length === 0));
    };
    const filters = this.grid.instance.getCombinedFilter() || [];
    this.hasFilter = filters.hasOwnProperty('columnIndex') ? isFilter(filters) : _.filter(filters, (filter) => isFilter(filter)).length > 0;

    const headerFilterRows = this.grid.instance.element().querySelectorAll('.dx-datagrid-headers .dx-datagrid-filter-row');
    Array.prototype.map.call(headerFilterRows, (headerFilterRow: Element) => {
      const textEditors = headerFilterRow.querySelectorAll('.dx-editor-container .dx-texteditor:not(.dx-dropdowneditor)');
      const changeClassForInput = (hasFilter: boolean, searchElement: Element) => {
        const inputElement = searchElement.querySelector('input.dx-texteditor-input');
        if (hasFilter) {
          inputElement.classList.add('has-filter');
        } else {
          inputElement.classList.remove('has-filter');
        }
      };
      Array.prototype.map.call(textEditors, (editorElement: Element, index) => {
        const hasFilter = !editorElement.classList.contains('dx-texteditor-empty');
        changeClassForInput(hasFilter, editorElement);
      });

      const dropdownEditors = headerFilterRow.querySelectorAll('.dx-editor-container .dx-texteditor.dx-dropdowneditor:NOT(.dx-tagbox)');
      Array.prototype.map.call(dropdownEditors, (editorElement: Element, index) => {
        const hiddenInput = <HTMLInputElement>editorElement.querySelector('input[type=hidden]');  // combobox
        const hasFilter = hiddenInput ? !!hiddenInput.value : false;
        changeClassForInput(hasFilter, editorElement);
      });

      const tagboxEditors = headerFilterRow.querySelectorAll('.dx-editor-container .dx-texteditor.dx-dropdowneditor.dx-tagbox');
      Array.prototype.map.call(tagboxEditors, (editorElement: Element, index) => {
        const tagbox = <HTMLInputElement>editorElement.querySelector('.dx-tag');  // tagbox
        const hasFilter = !!tagbox;
        changeClassForInput(hasFilter, editorElement);
      });
    });
  }

  resetFilters(e) {
    const grid = this.grid ? this.grid.instance : null;
    const columnCount = grid ? grid.columnCount() : 0;
    if (grid) {
      grid.clearFilter();
      for (let i = 0; i < columnCount; i++) {
        grid.columnOption(i, 'selectedFilterOperation', undefined);
      }
    }
  }

  applyState(state) {
    if (state != null) {
      this.selectedState = { Id: state.Id, Name: state.StateName, Description: state.StateDescription };
      if (this.addStateForm) {
        this.addStateForm.form.markAsPristine();
      }
      this.loadGridFromState(state.State);
    }
  }

  addCustomItem(data) {
    const newItem: PhxDataTableStateDetail = { Id: 0, Name: data.text, Description: '' };
    if (data.text.length >= 3 && data.text.length <= 128) {
      this.stateDetails.push(newItem);
      data.customItem = newItem;
    } else {
      this.newStateDescription = '';
    }
  }

  cancelSaveState() {
    this.hidePopup();
    this.selectedState = { Id: 0, Name: '', Description: '' };
    this.nameIsChanged = false;
    this.addStateForm.form.markAsPristine();
  }

  addState() {
    if (this.selectedState) {

      const gridState = this.grid.instance.state();
      let stateToSave: PhxDataTableUserProfile = null;

      const index = this.states.findIndex(item => item.StateName === this.selectedState.Name);
      if (index > -1) {
        stateToSave = this.states[index];
      } else {

        stateToSave = this.dataTableService.createEmptyPhxDataTableUserProfile(this.componentName);
      }
      stateToSave.StateName = this.selectedState.Name;
      stateToSave.StateDescription = this.newStateDescription;
      stateToSave.State = gridState;
      stateToSave.ComponentName = this.componentName;

      this.doSaveState(stateToSave).then((state) => {
        this.hidePopup();
        this.addStateForm.form.markAsPristine();
      });

    }
  }

  removeState(state) {
    this.dialogService.confirmDelete().then((button) => {
      if (button === DialogResultType.Yes) {
        const stateToRemove = state;
        this.dataTableService.removeState(stateToRemove).then((data) => {
          this.states.splice(this.states.findIndex((item) => item.Id === stateToRemove.Id), 1);

          if (this.states.length > 0) {
            this.defaultState = this.states[0];
          }

          this.populateStateNames();
        }).catch((ex) => {
          console.error('Error removing state', stateToRemove, ex);
        });
      }
    });
  }

  customSave(gridState: any) {
    delete gridState.selectedRowKeys;
    this.defaultState.State = gridState;
    if (JSON.stringify(gridState) !== this.lastDefaultState) {
      if (this.isSavingDefaultState === false) {
        this.saveDefaultState();
      } else {
        this.anyPendingSaveDefaultState = true;
      }
    }
  }

  saveDefaultState() {

    if (this.configuration.stateSavingMode === PhxDataTableStateSavingMode.None) {
      return;
    }
    this.isSavingDefaultState = true;
    const stateToSave = Object.assign({}, this.defaultState);

    if (this.configuration.saveUserFilters === false) {
      stateToSave.State.columns.forEach((column) => {
        delete column.selectedFilterOperation;
        delete column.filterValue;
        delete column.filterValues;
      });
      delete stateToSave.State.searchText;
    }

    this.lastDefaultState = JSON.stringify(stateToSave.State);

    this.doSaveState(stateToSave).then((state) => {
      this.isSavingDefaultState = false;
      this.defaultState = state;

      if (this.anyPendingSaveDefaultState === true) {
        this.anyPendingSaveDefaultState = false;
        this.customSave(this.grid.instance.state());
      }
    }, (err) => {
      this.isSavingDefaultState = false;
      if (this.anyPendingSaveDefaultState === true) {
        this.anyPendingSaveDefaultState = false;
        this.customSave(this.grid.instance.state());
      }
    });
  }

  saveAsState() {
    this.showPopup();
  }

  resetState() {
    this.dialogService.confirm(this.locale.translate('common.phxDataTable.confirmResetViewTitle'), this.locale.translate('common.phxDataTable.confirmResetViewMessage'))
      .then((button) => {
        if (button === DialogResultType.Yes) {
          if (this.initState) {
            this.loadGridFromState(this.initState);
          }
        }
      });
  }

  private doSaveState(state: PhxDataTableUserProfile): Promise<PhxDataTableUserProfile> {
    return new Promise((resolve, reject) => {
      this.dataTableService.saveState(state).then((result) => {
        this.dataTableService.getState(state.ComponentName, state.StateName).then((res) => {
          if (res.Items && res.Items.length > 0) {
            const dbState = res.Items[0];
            if (this.states == null) {
              this.states = [];
            }
            // new state
            if (state.Id === 0) {
              this.states.push(dbState);
            } else {
              const exisitingStateIndex = this.states.findIndex(item => item.Id === dbState.Id);
              if (exisitingStateIndex !== -1) {
                this.states[exisitingStateIndex].State = dbState.State;
                this.states[exisitingStateIndex].LastModifiedDatetime = dbState.LastModifiedDatetime;
              } else {
                this.states.push(dbState);
              }
            }
            resolve(dbState);
          } else {
            resolve(null);
          }
          this.populateStateNames();

        }).catch((ex) => {
          console.error(`Error loading state. component: ${this.componentName}, state Id:${this.defaultState.Id}`, ex);
          reject(ex);
        });

      }).catch((ex) => {
        console.error(`Error saving state. component: ${this.componentName}, state Id:${this.defaultState.Id}`, ex);
        reject(ex);
      });
    });
  }

  private buildDataSource(dataSource: any) {
    if (this.dataSource && Array.isArray(this.dataSource)) {
      this.totalCount = this.dataSource.length;
      dataSource = new DataSource({
        store: new ArrayStore({
          data: this.dataSource,
          onLoaded: (data) => {
            const ds = <DataSource>this.grid.dataSource;
            const preLoadCount = (ds.pageIndex() * ds.pageSize());
            this.totalCount = data.length;
            const maxCurrent = preLoadCount + data.length;
            this.currentCount = maxCurrent < this.totalCount ? maxCurrent : this.totalCount;
          }
        })
      });
    } else if (this.dataSource) {
      dataSource = this.dataSource;
    } else if (this.dataSourceUrl) {
      this.summary = null;
      dataSource = { ...dataSource, store: this.createCustomDataSource(this.dataSourceUrl) };
    } else {
      dataSource = [];
    }
    return dataSource;
  }

  private createCustomDataSource(url: string): CustomStore {
    return new CustomStore({

      key: Array.isArray(this.dataStoreKey) ? this.dataStoreKey : undefined,

      load: (loadOptions) => {
        let params = '';
        if (this.dataSourceParams && this.dataSourceParams !== '') {
          params += this.dataSourceParams;
        }

        // Removed isLoadingAll check and default values as per https://github.com/DevExpress/devextreme-angular/issues/522#issuecomment-321902314
        if (loadOptions.skip != null) {
          params += '&$skip=' + loadOptions.skip;
        }
        if (loadOptions.take != null) {
          params += '&$top=' + loadOptions.take;
        }

        if (loadOptions.sort) {
          params += '&$orderby=' + loadOptions.sort[0].selector;
          if (loadOptions.sort[0].desc) {
            params += ' desc';
          }
        }

        const filterString = this.buildFilter(loadOptions);
        if (filterString !== '') {
          if (params.includes('$filter')) {
            params = params.replace(/\$filter=([^&]*)(&?)/, '$filter=(' + filterString + ') and ($1)$2');
          } else {
            params += '&$filter=' + filterString;
          }
        }
        // if (loadOptions.requireTotalCount) {
        params += '&$inlinecount=allpages';
        // }

        if (params.length) {
          if (params[0] === '&') {
            params = params.substr(1);
          }
          params = '?' + params;
        }

        const queryLink = this.dataSourceUrl + params;
        return this.apiService.query(queryLink, false)
          .then((response: any) => {

            if (this.totalCount !== response.Count) { // when refresh page or filtered
              this.currentCount = 0;
            }

            this.totalCount = response.Count || 0;
            if (loadOptions.skip + loadOptions.take <= response.Count) {
              const maxCount = this.currentCount;
              if (loadOptions.skip + loadOptions.take > maxCount) {
                this.currentCount = loadOptions.skip + loadOptions.take;
              } else {
                this.currentCount = maxCount;
              }
            } else {
              this.currentCount = response.Count || 0;
            }
            this.responseReceived.emit(response.Items);
            const result: any = {
              data: response.Items || [],
              count: response.Items.length || 0,
            };

            if (loadOptions.requireTotalCount) {
              result.totalCount = this.totalCount;
            }

            return result;
          }).catch(err => {
            console.error(`Error fetching data from url: ${queryLink}`, err);
          });
      }
    });

  }

  private buildFilter(loadOptions): string {
    let filterString = '';
    if (loadOptions.filter) {
      const filters = [];
      this.convertSingleFilterToArrayOfFilters(loadOptions.filter, filters);

      filters.forEach(data => {
        if (typeof data === 'string') { // it's an operator ex 'and'
          filterString += ` ${data} `;
        } else if (this.isFilterArray(data)) {
          const filterColumn = data[0];
          const operator = data[1];
          const value: any = data[2];

          let gridColumn = null;
          if (data.columnIndex && data.columnIndex != null) {
            gridColumn = this.grid.columns[data.columnIndex];
          } else {
            const filteredColumns = this.grid.columns.filter(i => i.dataField === filterColumn);
            if (filteredColumns.length > 0) {
              gridColumn = filteredColumns[0];
            }
          }

          filterString += this.convertToODataFilter(filterColumn, operator, value, gridColumn ? gridColumn.dataType : 'string', gridColumn ? gridColumn.isArray : false);
        } else {
          console.error('unknown data in phoenix data grid filter', data);
        }
      });
    }

    return filterString;
  }

  private isFilterArray(data: any) {
    return _.isArray(data);
  }

  private convertSingleFilterToArrayOfFilters(filter: any, filters: Array<any> = []) {
    // single filter is a simple array of field operator value and it has columnIndex
    // multiple filter is an array of singlefilter arrays with `and` operator
    // single between filter is an array of singlefilter arrays with `and` operator (less than, greater than) and it has columnIndex

    if (this.isFilterArray(filter) && filter.length > 0) {
      if (this.isFilterArray(filter[0]) && filter.columnIndex == null) {
        // this is multiple filter
        filter.forEach(element => {
          this.convertSingleFilterToArrayOfFilters(element, filters);
        });
      } else if (this.isFilterArray(filter[0]) && filter.columnIndex != null) {
        // this is beween filter
        filters.push('(');
        filter.forEach(element => {
          if (this.isFilterArray(element) && !element.columnIndex && !!filter.columnIndex) {
            element.columnIndex = filter.columnIndex;
          }
          filters.push(element);
        });
        filters.push(')');
      } else {
        filters.push(filter);
      }
    } else {
      // this is an operator
      filters.push(filter);
    }
  }

  private getODataValue(value: any, dataType: string): string {
    if (value instanceof Date) {
      return `datetime\'${moment(value.toISOString()).format()}\'`;
    } else if (typeof value === 'string' && dataType === 'date' && this.isDate(value)) {
      return `datetime\'${new Date(moment(value).format('YYYY-MM-DD') + 'T00:00:00.000Z').toISOString()}\'`;
    } else if (typeof value === 'string') {
      const stringValue = this.dataTableService.replaceSpecialCharacters((<string>value || ''));
      return `'${stringValue}'`;
    } else {
      return <string>value;
    }
  }

  private isDate(date: any) {
    return ((<any>new Date(date)) !== 'Invalid Date' && !isNaN((<any>new Date(date)))) ? true : false;
  }

  private convertToODataFilter(dataField: string, op: string, val: any, dataType: string, isArray: boolean): string {
    if (_.isArray(val)) {
      const result = [];
      for (let i = 0; i < val.length; i++) {
        result.push(this.convertToODataFilter(dataField, op, val[i], dataType, isArray));
      }
      if (!result.length) {
        result.push('true eq true');
      }
      const resultOperation = op === 'notcontains' ? 'and' : 'or';
      return '(' + result.join(' ' + resultOperation + ' ') + ')';
    } else {
      const filterToODataFilterMap = {
        ['=']: (fld, vl) => { return `${fld} eq ${vl}`; },
        ['<>']: (fld, vl) => { return `${fld} ne ${vl}`; },
        ['<']: (fld, vl) => { return `${fld} lt ${vl}`; },
        ['<=']: (fld, vl) => { return `${fld} le ${vl}`; },
        ['>']: (fld, vl) => { return `${fld} gt ${vl}`; },
        ['>=']: (fld, vl) => { return `${fld} ge ${vl}`; },
        ['notcontains']: (fld, vl) => { return `substringof(${vl}, ${fld}) eq false`; },
        ['contains']: (fld, vl) => { return `substringof(${vl}, ${fld}) eq true`; },
        ['startswith']: (fld, vl) => { return `startswith(${fld}, ${vl}) eq true`; },
        ['endswith']: (fld, vl) => { return `endswith(${fld}, ${vl}) eq true`; }
      };

      if (val && dataType === 'number') {
        if ((val.valueOf && val.valueOf() === Infinity) || val === Infinity) {
          return 'true eq false';
        }
      }

      const value: string = this.getODataValue(val, dataType);
      let result = '';
      let field = dataField;
      if (isArray) {
        field = 'item';
        result = `${dataField}/any(${field}:`;
      }

      if (filterToODataFilterMap[op]) {
        result += filterToODataFilterMap[op](field, value);
      }

      if (isArray) {
        result += `)`;
      }

      return result;
    }
  }
}
