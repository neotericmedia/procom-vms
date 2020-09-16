import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, ApiService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { PayrollService } from './../payroll.service';
import { PendingPayrollRemittancesExport, RemittanceType, RemittanceRow } from '../pending-payroll-remittances/pending-payroll-remittances.export';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxConstants } from '../../common/model/phx-constants';

import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-payroll-remittance-batch-details',
    templateUrl: './payroll-remittance-batch-details.component.html',
    styleUrls: ['./payroll-remittance-batch-details.component.less']
})
export class PayrollRemittanceBatchDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('phxTable') phxTable: PhxDataTableComponent;
    batchId: number;
    organizationIdInternal: number;
    dataSourceUrl: string;
    codeValueGroups: any;
    ApplicationConstants: any;
    totalColumnFormat = { type: 'fixedPoint', precision: 2 };
    workerCompensations: any[];

    odataParams: string = `$select=RemittanceBatchId,RemittanceStatusId,WorkerId,WorkerName,WorkerOrganizationId,WorkerOrganizationName,WorkerTypeId,BranchId,
        DeductionProvinceId,LineOfBusinessId,PaymentTransactionNumber,PaymentTransactionDate,PaymentTransactionStartDate,PaymentTransactionEndDate,PaymentReleaseDate,GrossPay,
        CppEmployer,CppEmployee,EiEmployer,EiEmployee,PipEmployer,PipEmployee,FederalTax,ProvincialTax,QppEmployer,QppEmployee,NonResidentTax,AdditionalTax,EhtEmployer,WcbEmployer`;

    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});
    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'WorkerId',
            caption: 'Worker ID',
            alignment: 'left',
            dataType: 'number',
            width: '100px',
            fixed: true,
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'WorkerName',
            caption: 'Worker Name',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'WorkerOrganizationName',
            caption: 'Organization Name',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'WorkerTypeId',
            caption: 'Legal Status',
            lookup: {
                dataSource: this.getProfileLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'BranchId',
            caption: 'Branch',
            lookup: {
                dataSource: this.getBranchLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'DeductionProvinceId',
            caption: 'Deduction Province State',
            lookup: {
                dataSource: this.getSubdivisionLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'LineOfBusinessId',
            caption: 'Line Of Business',
            lookup: {
                dataSource: this.getLineOfBusinessLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'PaymentTransactionNumber',
            caption: 'Payment Transaction',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'PaymentTransactionDate',
            caption: 'Payment Transaction Date',
            dataType: 'date',
            alignment: 'left',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'PaymentTransactionStartDate',
            caption: 'Payment Transaction Start',
            dataType: 'date',
            alignment: 'left',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'PaymentTransactionEndDate',
            caption: 'Payment Transaction End',
            dataType: 'date',
            alignment: 'left',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'PaymentReleaseDate',
            caption: 'Payment Release Date',
            dataType: 'date',
            alignment: 'left',
            hidingPriority: undefined
        }),
        new PhxDataTableColumn({
            dataField: 'GrossPay',
            caption: 'Gross Pay',
            dataType: 'number',
            format: this.totalColumnFormat,
            alignment: 'right',
            hidingPriority: undefined
        }),
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        protected commonService: CommonService,
        private navigationService: NavigationService,
        private payrollService: PayrollService,
        private codeValueService: CodeValueService,
        private apiService: ApiService
    ) {
        this.codeValueGroups = this.commonService.CodeValueGroups;
        this.ApplicationConstants = this.commonService.ApplicationConstants;
        this.batchId = +this.route.parent.snapshot.params['batchId'];
        this.organizationIdInternal = +this.route.parent.snapshot.params['organizationIdInternal'];
    }

    ngOnInit() {

        this.navigationService.setTitle('remittance-batch-details');

        this.payrollService.getRemittanceBatchById(this.organizationIdInternal, this.batchId).subscribe(response => {

            switch (response.RemittanceTypeId) {
                case PhxConstants.RemittanceType.Payroll:
                    this.columns.push(new PhxDataTableColumn({ dataField: 'CppEmployer', caption: 'CPP Employer', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'CppEmployee', caption: 'CPP Employee', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'EiEmployer', caption: 'EI Employer', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'EiEmployee', caption: 'EI Employee', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'PipEmployer', caption: 'PIP Employer', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'PipEmployee', caption: 'PIP Employee', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'FederalTax', caption: 'Federal Tax', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'ProvincialTax', caption: 'Provincial Tax', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'QppEmployer', caption: 'QPP Employer', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'QppEmployee', caption: 'QPP Employee', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'NonResidentTax', caption: 'Non-Resident Tax', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    this.columns.push(new PhxDataTableColumn({ dataField: 'AdditionalTax', caption: 'Additional Tax', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    break;
                case PhxConstants.RemittanceType.HealthTax:
                    this.columns.push(new PhxDataTableColumn({ dataField: 'EhtEmployer', caption: 'Employer Health Tax', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    break;
                case PhxConstants.RemittanceType.WorkerSafety:
                    this.columns.push(new PhxDataTableColumn({ dataField: 'WcbEmployer', caption: 'Employer Worker Safety', alignment: 'right', dataType: 'money', hidingPriority: undefined }));
                    break;
            }
            this.dataSourceUrl = `Payroll/getBatchPendingPaymentTransactionRemittances/${this.batchId}`;
        },
            error => { throw error; }
        );

        this.route.data
            .subscribe(d => {
                this.workerCompensations = d.resolvedData;
            });
    }

    ngOnDestroy() { }

    getSubdivisionLookup() {
        return this.codeValueService.getCodeValues('workorder.CodeWorksite', true)
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
                    value: codeValue.id
                };
            });
    }

    getProfileLookup() {
        return this.codeValueService.getCodeValues('usr.CodeProfileType', true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((codeValue: CodeValue) => {
                return {
                    text: codeValue.text,
                    value: codeValue.id
                };
            });
    }

    getRemittanceStatusLookup() {
        return this.codeValueService.getCodeValues('payroll.CodeRemittanceStatus', true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((codeValue: CodeValue) => {
                return {
                    text: codeValue.text,
                    value: codeValue.id
                };
            });
    }

    getSourceDeductionTypeLookup() {
        return this.codeValueService.getCodeValues('payroll.CodeSourceDeductionType', true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((codeValue: CodeValue) => {
                return {
                    text: codeValue.text,
                    value: codeValue.id
                };
            });
    }

    getBranchLookup() {
        return this.codeValueService.getCodeValues('workorder.CodeInternalOrganizationDefinition1', true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((codeValue: CodeValue) => {
                return { text: codeValue.text, value: codeValue.id };
            });
    }

    getLineOfBusinessLookup() {
        return this.codeValueService.getCodeValues('org.CodeLineOfBusiness', true)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((codeValue: CodeValue) => {
                return { text: codeValue.text, value: codeValue.id };
            });
    }

    download() {
        const oDataParams1 = oreq.request()
            .withSelect(['Id', 'OrganizationIdInternal', 'OrganizationInternalDisplayName', 'OrganizationInternalCode',
                'RemittanceDate', 'BatchNumber', 'RemittanceTypeId', 'RemittanceTransactionBatchStatusId', 'TotalAmount', 'CurrencyId'])
            .withFilter(oreq.filter('Id').eq(this.batchId)).url();
        this.payrollService.getRemittanceBatches(this.organizationIdInternal, oDataParams1)
            .subscribe((batch: any) => {
                if (batch && Array.isArray(batch.Items) && batch.Items.length) {
                    const remittanceBatch = batch.Items[0];
                    const remittanceTypes = ['', 'payroll-deduction', 'wcb', 'health-tax'];
                    const remittanceType = remittanceTypes[remittanceBatch.RemittanceTypeId];
                    const oDataParams = oreq.request().url();
                    this.apiService.query(`Payroll/getBatchPendingPaymentTransactionRemittances/${this.batchId}?` + oDataParams)
                        .then((data: any) => {
                            const rows = data.Items;
                            rows.forEach((i) => {
                                i.PaymentTransaction = i.PaymentTransactionNumber;
                                i.LegalStatus = i.WorkerTypeId;
                                i.Branch = i.BranchId;
                                i.DeductionsProvinceState = i.DeductionProvinceId;
                                i.LineOfBusiness = i.LineOfBusinessId;
                            });
                            // const remittanceTotals = this.calculateRemittanceTotals(rows, remittanceType);
                            const remittanceTotals = PendingPayrollRemittancesExport.calculateRemittanceTotals(rows, remittanceType, this.workerCompensations, this.codeValueService);

                            const totalRemittanceAmount = remittanceTotals.reduce((prev, current) => prev + current.total, 0);
                            const grossPay = rows.reduce((prev, current) => prev + current.GrossPay, 0);
                            const remittanceDate = remittanceBatch.RemittanceDate;
                            const csvText = PendingPayrollRemittancesExport.produceCsvText(remittanceType, rows, remittanceTotals, totalRemittanceAmount, grossPay, remittanceDate, this.codeValueService);
                            PendingPayrollRemittancesExport.downloadCsvFile(this.commonService, csvText, this.batchId, remittanceBatch.OrganizationInternalCode);
                        });
                }
            });
    }


}
