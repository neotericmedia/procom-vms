import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { PaymentService } from '../payment.service';
import { CommonService, PhxConstants } from '../../common';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-add-to-batch',
  templateUrl: './add-to-batch.component.html',
  styleUrls: ['./add-to-batch.component.less']
})
export class AddToBatchComponent implements OnInit, OnChanges {
  @Input() currencyId: number;
  @Input() amountSelected: number;
  @Input() bankAccounts: any[];
  @Input() formData: any;
  @Input() selectedGarnisheePayToCount: number = 0;
  @Input() paymentMethodId: number = 0;

  paymentBatch: any;
  depositDateEditable: boolean = true;
  selectedAccount: any;
  addToBatchForm: FormGroup;
  formatDate: string;
  codeValueGroups: any;

  constructor(
    protected commonService: CommonService,
    private paymentService: PaymentService, private fb: FormBuilder) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;

    if (this.paymentMethodId === PhxConstants.PaymentMethodType.Cheque) {
      this.addToBatchForm = this.fb.group({
        PayFrom: ['', [Validators.required]],
        PayGarnisheeFrom: ['', [Validators.required]]
      });
    } else if (this.paymentMethodId === PhxConstants.PaymentMethodType.ADP) {
      this.addToBatchForm = this.fb.group({
        DepositDate: ['', [Validators.required]],
        PayGarnisheeFrom: ['', [Validators.required]]
      });
    } else {
      this.addToBatchForm = this.fb.group({
        PayFrom: ['', [Validators.required]],
        DepositDate: ['', [Validators.required]],
        PayGarnisheeFrom: ['', [Validators.required]]
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.bankAccounts) {
      // auto select if there is only one bank account
      this.selectedAccount = this.bankAccounts.length === 1 ? this.bankAccounts[0] : null;
      this.formData.selectedBankAccountId = this.selectedAccount && this.selectedAccount.id;
    }

    if (this.addToBatchForm && changes.selectedGarnisheePayToCount) {
      if (changes.selectedGarnisheePayToCount.currentValue === 0) {
        this.addToBatchForm.controls['PayGarnisheeFrom'].disable();
      } else {
        this.addToBatchForm.controls['PayGarnisheeFrom'].enable();
      }
    }
  }

  onSelectedBankAccountChanged(event) {
    this.selectedAccount = this.bankAccounts.find(i => i.id === event.value);
    this.formData.selectedBankAccountId = event.value;
    this.formData.selectedBankAccount = this.selectedAccount;
    this.loadPaymentBatch();
  }

  loadPaymentBatch() {
    if (this.paymentMethodId === PhxConstants.PaymentMethodType.DirectDeposit || this.paymentMethodId === PhxConstants.PaymentMethodType.WireTransfer) {
      if (this.formData.selectedBankAccountId) {
        const responseAction = (res: any) => {
          if (res.Items[0]) {
            this.paymentBatch = res.Items[0];
            this.depositDateEditable = false;
            this.formData.depositDate = this.paymentBatch.DepositDate;
            this.formData.garnisheeBankAccountId = this.paymentBatch.GarnisheeBankAccountId;
            this.addToBatchForm.controls['PayGarnisheeFrom'].setValue(this.formData.garnisheeBankAccountId);
            this.formData.garnisheeBankAccount = this.bankAccounts.find(i => i.id === this.paymentBatch.GarnisheeBankAccountId);
          } else {
            this.resetForm();
          }
        };
        if (this.paymentMethodId === PhxConstants.PaymentMethodType.DirectDeposit) {
          this.paymentService.getPaymentDirectDepositBatchesByBankAccountAndBatchStatus(this.formData.selectedBankAccountId, PhxConstants.PaymentReleaseBatchStatus.Draft)
            .then(responseAction)
            .catch(err => {
              this.resetForm();
            });
        } else if (this.paymentMethodId === PhxConstants.PaymentMethodType.WireTransfer) {
          this.paymentService.getPaymentWireTransferBatchesByBankAccountAndBatchStatus(this.formData.selectedBankAccountId, PhxConstants.PaymentReleaseBatchStatus.Draft)
            .then(responseAction)
            .catch(err => {
              this.resetForm();
            });
        }
      } else {
        this.resetForm();
      }
    } else if (this.paymentMethodId === PhxConstants.PaymentMethodType.ADP) {
      this.resetForm();
    }
  }

  onSelectedGarnisheeBankAccountChanged(event) {
    this.formData.garnisheeBankAccountId = event.value;
  }

  resetForm() {
    this.paymentBatch = null;
    this.formData.depositDate = null;
    this.depositDateEditable = true;
  }
}
