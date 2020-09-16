import { PhxDataTableColumn } from './../index';

export interface PhxDataTableState {

    columns?: [PhxDataTableColumn];
    searchText?: string;
    pageIndex?: number;
    pageSize?: number;
    allowedPageSizes?: [number];
    selectedRowKeys?: [any];

}
