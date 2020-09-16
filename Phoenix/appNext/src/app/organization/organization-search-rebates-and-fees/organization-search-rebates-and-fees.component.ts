import { Component, OnInit, Inject } from '@angular/core';

import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';

import { NavigationService } from './../../common/services/navigation.service';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { WindowRefService } from '../../common/index';
import { Router } from '@angular/router';

@Component({
    selector: 'app-organization-search-rebates-and-fees',
    templateUrl: './organization-search-rebates-and-fees.component.html',
})
export class OrganizationSearchRebatesAndFeesComponent implements OnInit {

    odataParams: string = '$select=OrganizationId,OrganizationDisplayName,ActiveRebatesCount,ActiveFeesCount';

    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>({
        showOpenInNewTab: true
    }));

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'OrganizationId',
            caption: 'ID',
            alignment: 'left',
            dataType: 'number',
            width: 100,
            fixed: true,
            hidingPriority: undefined,
        }),
        new PhxDataTableColumn({
            dataField: 'OrganizationDisplayName',
            caption: 'Organization',
            hidingPriority: undefined,
        }),
        new PhxDataTableColumn({
            dataField: 'ActiveRebatesCount',
            caption: 'Active Rebates',
            dataType: 'number',
            alignment: 'right',
            hidingPriority: undefined,
        }),
        new PhxDataTableColumn({
            dataField: 'ActiveFeesCount',
            caption: 'Active VMS Fees',
            dataType: 'number',
            alignment: 'right',
            hidingPriority: undefined,
        }),

    ];

    constructor(
        private loadingSpinnerService: LoadingSpinnerService,
        private navigationService: NavigationService,
        private winRef: WindowRefService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.navigationService.setTitle('vmsrebate-manage');
    }

    public onRowSelected(event: any) {
        const data = event && event.selectedRowsData && event.selectedRowsData.length && event.selectedRowsData[0];
        if (data) {
            // this.$state.go('org.rebatesandfeesdetails', { organizationId: data.OrganizationId });
            this.router.navigate(['next', 'organization', data.OrganizationId, 'rebatesandfees']);
        }
    }

    newRebate() {
        // this.$state.go('org.rebate', { rebateHeaderId: 0, rebateVersionId: 0, orgId: 0 });
        this.router.navigate(['next', 'organization', 'rebate', 'rebateHeader', 0, 'rebateVersion', 0, 0]);
    }

    newVmsFee() {
        this.router.navigate(['next', 'organization', 'vmsfee', 'vmsFeeHeader', 0, 'vmsFeeVersion', 0, 0]);
        // this.$state.go('org.vmsfee', { vmsFeeHeaderId: 0, vmsFeeVersionId: 0, orgId: 0 });
    }

    onContextMenuOpenTab(item) {
        this.winRef.nativeWindow.open(`#/org/${item.OrganizationId}/rebatesandfees`, '_blank');
    }

}
