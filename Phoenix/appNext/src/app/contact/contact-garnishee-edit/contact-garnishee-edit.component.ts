import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { IGarnisheeEdit, IFormGroupSetup, IGarnisheeRepaymentTransactions } from '../state';
import { CustomFieldErrorType } from '../../common/model';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';
import { PhxConstants, CommonService, CodeValueService, ValidationExtensions, CustomFieldService } from '../../common';
import { BsModalService } from 'ngx-bootstrap';
import { ContactService } from '../shared/contact.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-contact-garnishee-edit',
  templateUrl: './contact-garnishee-edit.component.html',
  styleUrls: ['./contact-garnishee-edit.component.less']
})

export class ContactGarnisheeEditComponent extends BaseComponentOnDestroy implements OnInit, OnChanges {

  @Input() profileId: number;
  @Input() modal: PhxModalComponent;
  @Input() garnisheeId: number;
  @Input() activeCount: number;
  @Output() outputResponse = new EventEmitter();
  garnishee: IGarnisheeEdit;
  formGroupSetup: IFormGroupSetup;
  listGarnisheeStatuses: Array<any>;
  formGarnishee: FormGroup<IGarnisheeEdit>;
  phxConstants = PhxConstants;
  codeValueGroups: any;
  validationMessages: Array<string> = [];
  listCurrency: any;
  paymentMethods: any;
  canShow = true;

  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private contactService: ContactService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private modalService: BsModalService) {
      super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.getCodeValuelistsStatic();
  }

  getCodeValuelistsStatic() {
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
    this.paymentMethods = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PaymentMethodType, true);
  }

  ngOnInit() {
    this.modal.modalRef = this.modalService.onHide.subscribe(e => {
      this.canShow = true;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.garnisheeId && changes.garnisheeId.currentValue) {
      this.contactService.getUserProfileGarnisheeDetail(this.profileId, changes.garnisheeId.currentValue)
        .takeUntil(this.isDestroyed$)
        .subscribe((response: any) => {
          this.garnishee = response;
          this.formGarnishee = this.formBuilderGroupSetup(this.formGroupSetup, this.garnishee);
          this.listGarnisheeStatuses = this.codeValueService.getCodeValues(this.codeValueGroups.GarnisheeStatuses, true);
          if (this.activeCount > 0 && this.garnishee.GarnisheeStatusId !== this.phxConstants.GarnisheeStatus.Active) {
            this.listGarnisheeStatuses = this.listGarnisheeStatuses.filter(item => item.id !== 1);
          }
        });
    }
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, garnishee: IGarnisheeEdit): FormGroup<IGarnisheeEdit> {

    const formGroup = formGroupSetup.hashModel.getFormGroup<IGarnisheeEdit>(formGroupSetup.toUseHashCode, 'IGarnisheeEdit', garnishee, 0, () =>
      formGroupSetup.formBuilder.group<IGarnisheeEdit>({
        Id: garnishee.Id,
        OrganizationIdInternal: garnishee.OrganizationIdInternal,
        IssueDate: garnishee.IssueDate,
        CurrencyId: garnishee.CurrencyId,
        PayTypeIsAmount: garnishee.PayTypeIsAmount,
        PayAmount: garnishee.PayAmount,
        PayPercentage: garnishee.PayPercentage,
        PayAmountIsMaximum: garnishee.PayAmountIsMaximum,
        PayAmountMaximum: garnishee.PayAmountMaximum,
        PaybackRemainder: garnishee.PaybackRemainder,
        Description: [
          garnishee.Description,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))
          ]
        ],
        ReferenceNumber: [
          garnishee.ReferenceNumber,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ReferenceNumber', CustomFieldErrorType.required))
          ]
        ],
        GarnisheeOrganizationIdSupplier: garnishee.GarnisheeOrganizationIdSupplier,
        PayToId: [garnishee.PayToId],
        PayToName: garnishee.PayToName,
        PayToType: garnishee.PayToType,
        AddressLine1: garnishee.AddressLine1,
        AddressLine2: [garnishee.AddressLine2],
        CityName: garnishee.CityName,
        CountryId: garnishee.CountryId,
        SubdivisionId: garnishee.SubdivisionId,
        PostalCode: garnishee.PostalCode,
        GarnisheeStatusId: [
          garnishee.GarnisheeStatusId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('GarnisheeStatusId', CustomFieldErrorType.required))
          ]
        ],
        GarnisheeUserProfileWorkerId: garnishee.GarnisheeUserProfileWorkerId,
        OrganizationInternalLegalName: garnishee.OrganizationInternalLegalName,
        PaidAmount: garnishee.PaidAmount,
        LastModifiedDatetime: garnishee.LastModifiedDatetime,
        ProfileTypeId: garnishee.ProfileTypeId,
        GarnisheeRepaymentTransactions: ContactGarnisheeEditComponent.formGroupRepaymentTransactions(formGroupSetup, garnishee.GarnisheeRepaymentTransactions)
      })
    );

    return formGroup;
  }

  public static formGroupRepaymentTransactions(formGroupSetup: IFormGroupSetup, repaymentTransactions: Array<IGarnisheeRepaymentTransactions>) {
    return formGroupSetup.formBuilder.array<IGarnisheeRepaymentTransactions>(
      repaymentTransactions.map((trn: IGarnisheeRepaymentTransactions, index) =>
        formGroupSetup.hashModel.getFormGroup<IGarnisheeRepaymentTransactions>(formGroupSetup.toUseHashCode, 'IGarnisheeRepaymentTransactions', trn, index, () =>
          formGroupSetup.formBuilder.group<IGarnisheeRepaymentTransactions>({
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

  onClickCancel() {
    this.formGarnishee.setValue(this.garnishee, { emitEvent: false });
    this.formGarnishee.markAsPristine();
    this.canShow = false;
    this.modal.hide();
  }

  onClickSubmit() {
    const command = {
      LastModifiedDatetime: this.garnishee.LastModifiedDatetime,
      GarnisheeId: this.garnishee.Id,
      Description: this.formGarnishee.controls.Description.value,
      ReferenceNumber: this.formGarnishee.controls.ReferenceNumber.value,
      GarnisheeStatusId: this.formGarnishee.controls.GarnisheeStatusId.value,
    };

    this.contactService.garnisheeSubmit(command)
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.outputResponse.emit(response);
      this.modal.hide();
      this.commonService.logSuccess('Garnishee submitted successfully');
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.validationMessages.push(element.Message);
        });
      }
    });
  }

}
