import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavigationService } from './../../common/services/navigation.service';
import { TransactionService } from './../transaction.service';
import { WorkflowService } from './../../common/services/workflow.service';
import { CommonService } from '../../common/services/common.service';
import { pxCurrencyPipe } from './../../common/pipes/pxCurrency.pipe';
import * as _ from 'lodash';
import { DialogService } from '../../common';

@Component({
  selector: 'app-transaction-release-vacation-pay',
  templateUrl: './transaction-release-vacation-pay.component.html',
  styleUrls: ['./transaction-release-vacation-pay.component.less']
})
export class TransactionReleaseVacationPayComponent implements OnInit {
  workOrderVersionId: number = 0;
  model: any;
  payAmount: string = '';
  validationMessages: any;
  noAccess = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private api: TransactionService,
    private dialogService: DialogService,
    private workflowService: WorkflowService,
    private commonApiService: CommonService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((values: { workOrderVersionId: number }) => {
      this.workOrderVersionId = values.workOrderVersionId;
    });
    this.navigationService.setTitle('workorder-accrued-vacation-release');

    this.getWorkorderVersionInfo(this.workOrderVersionId);
  }

  getWorkorderVersionInfo(workorderVersionId: number) {
    // TODO: - Cannot find VacationPayInfo api end point (controller)

    this.api
      .getVacationPayInfo(workorderVersionId)
      .then(obj => {
        this.model = obj;
      })
      .catch(err => {
        console.log(err);
        //  err.length==0 when access is denied, err.message && err.Description when server error for instances where object is null and server error results
        if (err.length === 0 || (err.Message && err.Description)) {
          err = {};
          err.ModelState = JSON.parse('{"command.Hide Property Name":["Record not found or access denied."]}');
        }
        this.noAccess = true;
        this.validationMessages = err;
      });
  }

  setFullAccruedVacationPay() {
    const pxcp = new pxCurrencyPipe();
    this.payAmount = pxcp.transform(this.model.TotalVacationAccrued);
  }

  releaseVacationPay() {
    const pxcp = new pxCurrencyPipe();
    const amount = pxcp.parse(this.payAmount.replace(/\s+/g, ''));
    const dlg = this.dialogService.confirm('Release Accrued Vacation Pay', 'Are you sure you want to release <b>$' + amount + '</b> vacation pay?');
    dlg.then(
      btn => {
        const payload = {
          AmountToRelease:  + amount, 
          Ids: [this.workOrderVersionId]
        };
        this.api.executeStateCommand('WorkOrderReleaseVacationPay', payload)
          .then(res => {
            this.router.navigate(['/next', 'transaction', res.EntityIdRedirect,'summary']);
          })
          .catch(err => {
            this.validationMessages = err;
          });
      },
      function(btn) {}
    );
  }

  checkInValidPayAmount(amount): boolean {
    const pxcp = new pxCurrencyPipe();
    amount = pxcp.parse(amount.replace(/\s+/g, ''));
    return this.model && (+amount < 0 || +amount > +this.model.TotalVacationAccrued || isNaN(+amount));
  }
  cantRelease(): boolean {
    return this.model && this.model.TotalVacationAccrued === 0;
  }

  cancelClick() {
    // this.$state.go('workorder.edit.core', { assignmentId: this.model.AssignmentId, workOrderId: this.model.WorkOrderId, workOrderVersionId: this.model.WorkOrderVersionId });
    this.router.navigate(['/next', 'workorder', this.model.AssignmentId, this.model.WorkOrderId, this.model.WorkOrderVersionId, 'core']);
  }
}
