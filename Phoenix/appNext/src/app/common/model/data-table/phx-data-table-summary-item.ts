import { PhxDataTableSummaryType } from './phx-data-table-summary-type';

export class PhxDataTableSummaryItem {
    column: string;
    alignByColumn?: boolean = true;
    displayFormat?: string;
    name?: string;
    showInColumn?: string;
    showInGroupFooter?: boolean = false;
    skipEmptyValues?: boolean = false;
    summaryType: PhxDataTableSummaryType = PhxDataTableSummaryType.Count;
    valueFormat?: any;

    constructor(params: PhxDataTableSummaryItem) {
        if (params.summaryType !== PhxDataTableSummaryType.Count &&
            params.summaryType !== PhxDataTableSummaryType.Custom &&
            this.valueFormat == null
        ) {
            this.valueFormat = { type: 'fixedPoint', precision: 2 };
        }
        Object.assign(this, params);
    }
}
