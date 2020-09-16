import { Component, OnInit , OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../../common/services/navigation.service';
import { CommonService } from '../../../common/index';
import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value'; 
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../../common/model/index';
import { PhxDataTableSummaryItem } from './../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx'; 
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'payroll-taxes-provincial',
  templateUrl: './payroll-taxes-provincial.component.html',
  styleUrls: ['./payroll-taxes-provincial.component.less']

})
export class PayrollTaxesProvincialComponent implements OnInit, OnDestroy {
  
    codeValueGroups: any;
    ApplicationConstants: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private loadingSpinnerService: LoadingSpinnerService,
        private commonService: CommonService,
        private navigationService: NavigationService,
        private codeValueService: CodeValueService,
        ) {
            this.codeValueGroups = this.commonService.CodeValueGroups; 
    }

    ngOnInit() {
        this.navigationService.setTitle('Payroll Provincial Taxes', ['icon icon-payroll']);
    }

    ngOnDestroy() {
        
    }
        
}