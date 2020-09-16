import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/rx';

import { PayrollService } from '../payroll.service';
import { CommonService } from '../../common/services/common.service';
import { CodeValue } from '../../common/model/code-value';
import { CodeValueService } from '../../common/services/code-value.service';
import { RemittanceBatch } from './../model';
declare var oreq: any;

@Component({
    selector: 'app-payroll-remittance-batch-summary',
    templateUrl: './payroll-remittance-batch-summary.component.html',
    styleUrls: ['./payroll-remittance-batch-summary.component.less']
})
export class PayrollRemittanceBatchSummaryComponent implements OnInit, OnDestroy {

    batchHeader = <any>{};
    subscription: Subscription;
    workersSubscription: Subscription;
    workersCompensations: Array<any>;
    batchId: number;
    organizationIdInternal: number;
    oDataParams: string;

    constructor(
        private payrollService: PayrollService,
        private activatedRoute: ActivatedRoute,
        protected commonService: CommonService,
        private codeValueService: CodeValueService) {
            this.organizationIdInternal = +this.activatedRoute.parent.snapshot.params['organizationIdInternal'];
            this.batchId = +this.activatedRoute.parent.snapshot.params['batchId'];
            // tslint:disable-next-line:max-line-length
            this.oDataParams = oreq.request().withExpand(['RemittanceBatchWCBs']).withSelect(['RemittanceTypeId', 'CPPAmountEmployee', 'CPPAmountEmployer', 'EIAmountEmployee', 'EIAmountEmployer', 'PIPAmountEmployee', 'PIPAmountEmployer', 'EHTAmountEmployer', 'WCBAmountEmployer', 'FITAmountEmployee', 'PITAmountEmployee', 'QPPAmountEmployee', 'QPPAmountEmployer', 'NonResidentAmountEmployee', 'AddTaxAmountEmployee', 'TotalAmount', 'RemittanceBatchWCBs/CompensationId', 'RemittanceBatchWCBs/SiteId', 'RemittanceBatchWCBs/Amount', 'RemittanceBatchWCBs/Name', 'GrossPay']).withFilter(oreq.filter('Id').eq(this.batchId)).url();
            this.subscription = this.payrollService.getRemittanceBatches(this.organizationIdInternal, this.oDataParams).subscribe(batch => this.extractData(batch));
    }

    extractData = (batch: any) => {
        if (batch && batch.Items) {
            this.batchHeader = batch.Items[0];
            if (this.batchHeader.RemittanceTypeId === this.commonService.ApplicationConstants.RemittanceType.WorkerSafety) {
                this.workersSubscription = this.payrollService.getAllWorkerCompensations().subscribe(compensations => this.applyCompensations(compensations));
            }
        }
    }

    applyCompensations = (compensations: any) => {
        if (compensations && compensations.Items) {
            this.workersCompensations = compensations.Items;
            this.batchHeader.RemittanceBatchWCBs.forEach(wcb => {
                const code = this.workersCompensations.find(c => c.Id === wcb.CompensationId);
                const province = this.workerSites().find(k => k.value === wcb.SiteId);
                wcb.Name = (code ? code.Name : '') + ' - ' + (province ? province.text : '');
            });
        }
    }

    ngOnInit() { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.workersSubscription) {
            this.workersSubscription.unsubscribe();
        }
    }

    workerSites() {
        return this.codeValueService.getCodeValues('workorder.CodeWorksite', true).map((codeValue: CodeValue) => {
            return {
                text: codeValue.text,
                value: codeValue.id
            };
        });
    }
}
