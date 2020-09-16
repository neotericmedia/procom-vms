import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { NavigationService } from '../../common/services/navigation.service';
import { CommonService, CodeValueService } from '../../common/index';
import { WindowRefService } from '../../common/index';
import { CommissionService } from '../commission.service';

declare var oreq: any;
@Component({
    templateUrl: './commission-rates-search.component.html',
})
export class CommissionRatesSearchComponent implements OnInit {
    dataSourceUrl: string;
    oDataParams: any;
    commissions: any;
    header: any;
    public summary = null; // fix me
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        showOpenInNewTab: true
    });

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'CommissionRateHeaderId',
            caption: 'Id',
            dataType: 'number',
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRoleId',
            caption: 'Role',
            lookup: {
                dataSource: this.getLookup(this.commonService.CodeValueGroups.CommissionRole),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateVersionPercentage',
            caption: 'Rate',
            cellTemplate: 'rateCellTemplate',
            dataType: 'number',
            alignment: 'right'
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateHeaderDescription',
            caption: 'Description',
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateRestrictionsForInternalOrganization',
            caption: 'Internal Org',
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateRestrictionsForClientOrganization',
            caption: 'Client Org',
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateRestrictionsForLineOfBusiness',
            caption: 'Line Of Business',
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateRestrictionsForBranch',
            caption: 'Branch',
        }),
        new PhxDataTableColumn({
            dataField: 'CommissionRateHeaderStatusId',
            caption: 'Status',
            lookup: {
                dataSource: this.getLookup(this.commonService.CodeValueGroups.CommissionRateHeaderStatus),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
    ];

    constructor(
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private commonService: CommonService,
        private codeValueService: CodeValueService,
        private winRef: WindowRefService,
        private commissionService: CommissionService,
        private router: Router
    ) {
    }

    ngOnInit() {
        const self = this;
        this.navigationService.setTitle('commission-rates');
        this.oDataParams = oreq.request().url();

        this.route.paramMap.subscribe((params) => {
            const commissionUserProfileId = params.get('commissionUserProfileId');
            self.dataSourceUrl = 'Commission/getCommissionRatesByCommissionUserProfile/' + commissionUserProfileId;
            self.commissionService.getCommissionRateHeadersByCommissionUserProfile(commissionUserProfileId).subscribe((data: any) => {
                if (data && data.Items && data.Items.length) {
                    self.header = data.Items[0];
                }
            });
        });
    }

    getLookup(groupName) {
        const codeValueGroups = this.commonService.CodeValueGroups;
        const lookup = this.codeValueService.getCodeValues(groupName, true)
            .map((i) => {
                return {
                    value: i.id,
                    text: i.text,
                };
            });
        return lookup;
    }

    newCommission() {
        this.router.navigate(['next', 'commission', 'ratesetup', this.header.CommissionUserProfileId]);
    }

    viewCommissionDetail(event) {
        if (event && event.data) {
            this.commissionService.getCommissionRateVersionId(event.data.CommissionRateHeaderId)
                .then((latestVersionId: number) => {
                    this.router.navigate(['/next', 'commission', 'rate', event.data.CommissionRateHeaderId, latestVersionId, 'details']);
                })
                .catch((err) => {
                    this.router.navigate(['/next', 'commission', 'rate', event.data.CommissionRateHeaderId, event.data.CommissionRateVersionId, 'details']);
                });
        }
    }

    onContextMenuOpenTab(item) {
        this.winRef.nativeWindow.open(`#/next/commission/rate/${item.CommissionRateHeaderId}/${item.CommissionRateVersionId}/details`, '_blank');
    }

}
