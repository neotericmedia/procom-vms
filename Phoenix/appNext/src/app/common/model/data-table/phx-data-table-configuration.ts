import { PhxDataTableSelectionMode } from './phx-data-table-selection-mode';
import { PhxDataTableSelectallMode } from './phx-data-table-selectall-mode';
import { PhxDataTableShowCheckboxesMode } from './phx-data-table-show-checkboxes-mode';
import { PhxDataTableStateSavingMode } from './phx-data-table-state-saving-mode';

export class PhxDataTableConfiguration {
    selectionMode?: PhxDataTableSelectionMode = PhxDataTableSelectionMode.Single;
    selectAllMode?: PhxDataTableSelectallMode = PhxDataTableSelectallMode.Page;
    showCheckBoxesMode?: PhxDataTableShowCheckboxesMode = PhxDataTableShowCheckboxesMode.Always;
    allowSelectAll?: boolean = true;
    showFilter?: boolean = true;
    showClearFilterButton?: boolean = true;
    showSearch?: boolean = true;
    showGrouping?: boolean = true;
    showColumnChooser?: boolean = true;
    columnHidingEnabled?: boolean = false;
    stateSavingMode?: PhxDataTableStateSavingMode = PhxDataTableStateSavingMode.Customizable;
    enableExport?: boolean = false;
    showTotalCount?: boolean = true;
    pageSize?: number = 25;
    noDataText?: string;
    enableMasterDetail?: boolean = false;
    showOpenInNewTab?: boolean = false;
    masterDetailTemplateName?: string = 'detail';
    loadPanelText?: string;
    loadPanelEnabled?: any = 'auto'; // 'auto', true, false
    saveUserFilters?: boolean = true;
    showBorders?: boolean = true;
    rowAlternationEnabled?: boolean = true;
    rowHighlightingConfig?: RowHighlightingConfig = null;
    showToolbar?: boolean = true;

    constructor(params: PhxDataTableConfiguration) {
        Object.assign(this, params);
    }
}

export class RowHighlightingConfig {
    fieldName: string = 'IsTest';
    cssClass: string = 'testRowClass';
}



