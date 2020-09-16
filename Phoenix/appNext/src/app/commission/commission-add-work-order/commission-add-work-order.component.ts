import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableSelectionMode, PhxDataTableShowCheckboxesMode, PhxConstants } from '../../common/model/index';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { CommonService } from '../../common/index';

declare var oreq: any;

@Component({
    selector: 'app-commission-add-work-order',
    templateUrl: './commission-add-work-order.component.html',
    styleUrls: ['./commission-add-work-order.component.less']
})
export class CommissionAddWorkOrderComponent implements OnInit {

    @Input() selectedWorkorders: any[];
    @Input() organizationIdInternal: number;
    @Input() clientOrganizationId: number;
    @Output() workorderSelectionChanged: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('phxTable') phxTable: PhxDataTableComponent;

    columns: Array<PhxDataTableColumn>;
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        selectionMode: PhxDataTableSelectionMode.Multiple,
        showCheckBoxesMode: PhxDataTableShowCheckboxesMode.Always,
        allowSelectAll: false,
    });
    dataSourceUrl = 'assignment/getSearch';
    oDataParams: string;
    dataStoreKey = ['WorkOrderVersionId'];

    isTableVisible: boolean;
    applicationConstants: any;

    constructor(
        private commonService: CommonService
    ) {
        this.applicationConstants = this.commonService.ApplicationConstants;
    }

    ngOnInit() {
        this.columns = this.buildColumns();

        const filter = oreq.filter('AssignmentStatusId').eq(PhxConstants.AssignmentStatus.Engaged)
            .and().filter('OrganizationIdInternal').eq(this.organizationIdInternal);

        if (this.clientOrganizationId) {
            filter.and().filter('ClientOrganizationId').eq(this.clientOrganizationId);
        }
        this.oDataParams = oreq.request()
            .withSelect(['WorkOrderFullNumber', 'WorkerName', 'ClientName', 'StartDate', 'EndDate', 'WorkOrderVersionId'])
            .withFilter(filter)
            .url();

        this.isTableVisible = true;

        setTimeout(() => {
            const selectedKeys = Array.isArray(this.selectedWorkorders)
                ? this.selectedWorkorders.map(i => { return { WorkOrderVersionId: i.WorkOrderVersionId }; })
                : [];
            this.phxTable.grid.instance.selectRows(selectedKeys, false);
        }, 200);
    }

    buildColumns(): Array<PhxDataTableColumn> {
        return [
            new PhxDataTableColumn({
                dataField: 'WorkOrderFullNumber',
                caption: 'Number',
                calculateSortValue: 'AssignmentId',
            }),
            new PhxDataTableColumn({
                dataField: 'WorkerName',
                caption: 'Worker Name'
            }),
            new PhxDataTableColumn({
                dataField: 'ClientName',
                caption: 'Client Name',
            }),
            new PhxDataTableColumn({
                dataField: 'StartDate',
                caption: 'Start Date',
                dataType: 'date',
            }),
            new PhxDataTableColumn({
                dataField: 'EndDate',
                caption: 'End Date',
                dataType: 'date',
            }),
        ];
    }

    public onSelectionChanged(event: any) {
        this.workorderSelectionChanged.emit(event.selectedRowsData);
    }

}
