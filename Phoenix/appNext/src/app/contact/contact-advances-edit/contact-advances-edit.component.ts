import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldService, CodeValueService, CommonService, PhxConstants, ValidationExtensions } from '../../common';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { BsModalService } from '../../../../node_modules/ngx-bootstrap';
import { HashModel } from '../../common/utility/hash-model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { IAdvance, IFormGroupSetup, IAdvanceInitialTransaction, IRepaymentTransactions } from '../state/profile.interface';
import { CustomFieldErrorType } from '../../common/model';
import { ContactService } from '../shared/contact.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';


@Component({
  selector: 'app-contact-advances-edit',
  templateUrl: './contact-advances-edit.component.html',
  styleUrls: ['./contact-advances-edit.component.less']
})
export class ContactAdvancesEditComponent extends BaseComponentOnDestroy  implements OnInit, OnChanges {

  @Input() profileId: number;
  @Input() advanceId: number;
  @Input() modal: PhxModalComponent;
  @Input() activeCount: number;
  @Output() outputResponse = new EventEmitter();
  formGroupSetup: IFormGroupSetup;
  listAdvanceStatus: Array<any>;
  listInternalOrganization: Array<any> = [];
  listPaymentMethod: Array<any>;
  listCurrency: any;
  rootFormGroup: FormGroup<IAdvance>;
  advanceDetails: IAdvance;
  phxConstants = PhxConstants;
  codeValueGroups: any;
  validationMessages: Array<string> = [];
  canShow = true;
  defaultInitialTransaction = {
    TransactionHeaderId: null,
    Amount: null,
    PaymentNumber: null,
    PaymentTransactionNumber: null,
    ReleaseDate: null
  };

  constructor(private formBuilder: FormBuilder,
    private contactservice: ContactService,
    private customFieldService: CustomFieldService,
    private organizationService: OrganizationApiService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private modalService: BsModalService) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {
    this.internalOrganization();
    this.modal.modalRef = this.modalService.onHide
    .subscribe(() => {
      this.canShow = true;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.advanceId && changes.advanceId.currentValue) {
      this.advanceId = changes.advanceId.currentValue;
      this.getAdvanceStatus();
      this.getAdvanceDetails();
    }
  }

  onSubmit() {
    const self = this;
    const advanceSubmitCommand = {
      LastModifiedDatetime: self.rootFormGroup.controls.LastModifiedDatetime.value,
      AdvanceId: self.advanceId,
      Description: self.rootFormGroup.controls.Description.value,
      AdvanceStatusId: self.rootFormGroup.controls.AdvanceStatusId.value
    };
    this.organizationService.advanceSubmit(advanceSubmitCommand)
    .takeUntil(this.isDestroyed$)
    .subscribe(response => {
      if (response.EntityId) {
        this.outputResponse.emit(response);
        this.modal.hide();
        this.commonService.logSuccess('Advance submitted successfully');
      }
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.validationMessages.push(element.Message);
        });
      }
    });
  }

  onCancel() {
    if (!this.advanceDetails.AdvanceInitialTransaction) {
      this.advanceDetails.AdvanceInitialTransaction = this.defaultInitialTransaction;
    }
    this.rootFormGroup.patchValue(this.advanceDetails, { emitEvent: false });
    this.rootFormGroup.markAsPristine();
    this.canShow = false;
    this.modal.hide();
  }

  getCodeValuelistsStatic() {
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
    this.listPaymentMethod = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PaymentMethodType, true);
  }

  getAdvanceStatus() {
    this.listAdvanceStatus = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.AdvanceStatuses, true);
  }

  internalOrganization() {
    this.organizationService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole()
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.listInternalOrganization = response.Items;
    });
  }

  getAdvanceDetails() {
    this.contactservice.getUserProfileAdvanceDetail(this.profileId, this.advanceId)
    .takeUntil(this.isDestroyed$)
    .subscribe((response: IAdvance) => {
      this.advanceDetails = response;
      this.onInitAdvanceDetails(response);
      if (this.activeCount > 0 && this.advanceDetails.AdvanceStatusId !== this.phxConstants.AdvanceStatus.Active) {
        this.listAdvanceStatus = this.listAdvanceStatus.filter(item => item.id !== 1);
      }
    });
  }

  onInitAdvanceDetails(advance: IAdvance) {
    this.rootFormGroup = this.formBuilderGroupSetup(this.formGroupSetup, advance);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, advance: IAdvance): FormGroup<IAdvance> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IAdvance>(formGroupSetup.toUseHashCode, 'IAdvance', advance, 0, () =>
      formGroupSetup.formBuilder.group<IAdvance>({
        AdvanceStatusId: [
          advance.AdvanceStatusId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AdvanceStatusId', CustomFieldErrorType.required))
          ]
        ],
        OrganizationIdInternal: [
          advance.OrganizationIdInternal
        ],
        IssueDate: [
          advance.IssueDate
        ],
        AmountInitial: [
          advance.AmountInitial
        ],
        PaybackType: advance.PaybackType,
        PaybackAmount: [
          advance.PaybackAmount
        ],
        PaybackPercentage: [
          advance.PaybackPercentage
        ],
        Description: [
          advance.Description,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))
          ]
        ],
        PayeeName: advance.PayeeName,
        AddressLine1: [
          advance.AddressLine1,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64)
          ]
        ],
        AddressLine2: [
          advance.AddressLine2,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64)
          ]
        ],
        CityName: [
          advance.CityName,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64)
          ]
        ],
        CountryId: advance.CountryId,
        SubdivisionId: advance.SubdivisionId,
        PostalCode: advance.PostalCode,
        PaymentMethodId: [
          advance.PaymentMethodId
        ],
        CurrencyId: [
          advance.CurrencyId
        ],
        PayeeOrganizationIdSupplier: advance.PayeeOrganizationIdSupplier,
        PaybackRemainder: [
          advance.PaybackRemainder
        ],
        LastModifiedDatetime: advance.LastModifiedDatetime,
        Id: advance.Id,
        OrganizationInternalLegalName: advance.OrganizationInternalLegalName,
        PayeeUserProfileWorkerId: advance.PayeeUserProfileWorkerId,
        PaidAmount: advance.PaidAmount,
        AdvanceInitialTransaction: ContactAdvancesEditComponent.formGroupInitialTransaction(formGroupSetup, advance.AdvanceInitialTransaction),
        AdvanceRepaymentTransactions: ContactAdvancesEditComponent.formGroupRepaymentTransactions(formGroupSetup, advance.AdvanceRepaymentTransactions)
      })
    );
    return formGroup;
  }

  public static formGroupInitialTransaction(formGroupSetup: IFormGroupSetup, initialTransaction: IAdvanceInitialTransaction) {

    if (!initialTransaction) {
      initialTransaction = {
        TransactionHeaderId: null,
        Amount: null,
        PaymentNumber: null,
        PaymentTransactionNumber: null,
        ReleaseDate: null
      };
    }

    return formGroupSetup.formBuilder.group<IAdvanceInitialTransaction>({
      TransactionHeaderId: [initialTransaction.TransactionHeaderId],
      PaymentTransactionNumber: [initialTransaction.PaymentTransactionNumber],
      Amount: [initialTransaction.Amount],
      ReleaseDate: [initialTransaction.ReleaseDate],
      PaymentNumber: [initialTransaction.PaymentNumber],
    });
  }

  public static formGroupRepaymentTransactions(formGroupSetup: IFormGroupSetup, repaymentTransactions: Array<IRepaymentTransactions>) {
    return formGroupSetup.formBuilder.array<IRepaymentTransactions>(
      repaymentTransactions.map((trn: IRepaymentTransactions, index) =>
        formGroupSetup.hashModel.getFormGroup<IRepaymentTransactions>(formGroupSetup.toUseHashCode, 'IRepaymentTransactions', trn, index, () =>
          formGroupSetup.formBuilder.group<IRepaymentTransactions>({
            Amount: trn.Amount,
            PaymentMethodId: trn.PaymentMethodId,
            PaymentNumber: trn.PaymentNumber,
            PaymentTransactionNumber: trn.PaymentTransactionNumber,
            ReleaseDate: trn.ReleaseDate
          })
        )
      )
    );
  }
}
