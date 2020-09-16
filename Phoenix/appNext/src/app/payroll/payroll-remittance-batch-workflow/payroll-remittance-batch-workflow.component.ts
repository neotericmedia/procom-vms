import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-payroll-remittance-batch-workflow',
  templateUrl: './payroll-remittance-batch-workflow.component.html',
  styleUrls: ['./payroll-remittance-batch-workflow.component.less']
})
export class PayrollRemittanceBatchWorkflowComponent implements OnInit {

    batchId: number;


    constructor(
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService) {
        this.batchId = +this.activatedRoute.parent.snapshot.params['batchId'];
    }   

  ngOnInit() {

  }

}
