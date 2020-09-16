import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, ApiService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableSummaryItem } from './../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';

import { Router, ActivatedRoute } from '@angular/router';

import { WindowRefService } from '../../common/index';

@Component({
    selector: 'app-payroll-taxes-search',
    templateUrl: './payroll-taxes-search.component.html',
    styleUrls: ['./payroll-taxes-search.component.less']

})
export class PayrollTaxesSearchComponent implements OnInit, OnDestroy {
    codeValueGroups: any;
    ApplicationConstants: any;
    totalColumnFormat = { type: 'fixedPoint', precision: 2 };

    odataParams: string = `$select=Id,VersionId,TaxType,CountryId,SubdivisionId,EffectiveDate`;

    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
        showOpenInNewTab: true
    });

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'Id',
            width: 100,
            caption: 'ID',
            dataType: 'number'
        }),
        new PhxDataTableColumn({
            dataField: 'TaxType',
            caption: 'Type',
            dataType: 'string',
            lookup: {
                dataSource: this.getTaxType(),
                valueExpr: 'id',
                displayExpr: 'text'
            }
        }),
        new PhxDataTableColumn({
            dataField: 'CountryId',
            caption: 'Country',
            lookup: {
                dataSource: this.getCountryName(),
                valueExpr: 'id',
                displayExpr: 'text'
            }
        }),
        new PhxDataTableColumn({
            dataField: 'SubdivisionId',
            caption: 'Province/State',
            lookup: {
                dataSource: this.getSubdivision(),
                valueExpr: 'id',
                displayExpr: 'text'
            }
        }),
        new PhxDataTableColumn({
            dataField: 'EffectiveDate',
            caption: 'Effective Date',
            dataType: 'date',
        })
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private loadingSpinnerService: LoadingSpinnerService,
        private commonService: CommonService,
        private navigationService: NavigationService,
        private codeValueService: CodeValueService,
        private winRef: WindowRefService,
        private apiService: ApiService,
        
    ) {
        this.codeValueGroups = this.commonService.CodeValueGroups;
    }

    ngOnInit() {
        this.navigationService.setTitle('payroll-taxes');
    }

    ngOnDestroy() {
    }

    onRowClick(event: any) {
        if (event && event.data) {
            this.view(event.data);
        }
    }

    view(item) {
        if (item.TaxType === 'Federal') {
            this.apiService.query(`payroll/federal/latestVersionId/${item.Id}`)
                .then((latestVersionId: number) => {
                    this.viewFederalTax(item.Id, latestVersionId);
                }).catch((err) => {
                    this.viewFederalTax(item.Id, item.VersionId);
                });
        }
        if (item.TaxType === 'Provincial') {
            this.apiService.query(`payroll/provincial/latestVersionId/${item.Id}`)
                .then((latestVersionId: number) => {
                    this.viewProvincialTax(item.Id, latestVersionId);
                }).catch((err) => {
                    this.viewProvincialTax(item.Id, item.VersionId);
                });
        }
    }

    viewFederalTax(federalTaxHeaderId: number, federalTaxVersionId: number) {
        this.router.navigate(['/next', 'payroll', 'federalTax', federalTaxHeaderId, federalTaxVersionId]);
    }

    viewProvincialTax(provincialTaxHeaderId: number, provincialTaxVersionId: number) {
        // this.$state.go('payroll.provincialTax', { provincialTaxHeaderId: provincialTaxHeaderId, provincialTaxVersionId: provincialTaxVersionId });
        this.router.navigate(['/next', 'payroll', 'payroll-provincial-tax', provincialTaxHeaderId, provincialTaxVersionId]);
    }

    createNewFederalTax() {
        this.router.navigate(['/next', 'payroll', 'federalTax',  0,  0]);
    }

    createNewProvincialTax() {
        // this.$state.go('payroll.provincialTax', { provincialTaxHeaderId: 0, provincialTaxVersionId: 0 });
        this.router.navigate(['/next', 'payroll', 'payroll-provincial-tax', 0, 0]);
    }

    onContextMenuOpenTab(item) {
        if (item.TaxType === 'Federal') {
            this.winRef.nativeWindow.open(`#/payroll/federalTax/${item.Id}/${item.VersionId}`, '_blank');
        }
        if (item.TaxType === 'Provincial') {
            this.winRef.nativeWindow.open(`#/payroll/provincialTax/${item.Id}/${item.VersionId}`, '_blank');
        }
    }

    getCountryName() {
        return this.codeValueService.getCodeValuesSortByCode('geo.CodeCountry', true);
    }

    getSubdivision() {
        return this.codeValueService.getCodeValuesSortByCode('geo.CodeSubdivision', true);
    }

    getTaxType() {
        const filterList = [];
        const FederalObject = {
            code: 'Federal',
            id: 1,
            text: 'Federal'
        };
        const ProvincialObject = {
            code: 'Provincial',
            id: 2,
            text: 'Provincial'
        };
        filterList.push(FederalObject);
        filterList.push(ProvincialObject);
        return filterList
            .sort((a, b) => {
                if (a.code < b.code) {
                    return -1;
                }
                if (a.code > b.code) {
                    return 1;
                }
                return 0;
            })
            .map((codeValue: CodeValue) => {
                return {
                    text: codeValue.text,
                    id: codeValue.text
                };
            });
    }

}
