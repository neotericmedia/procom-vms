import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldService, CodeValueService, CommonService, PhxConstants, ValidationExtensions } from '../../common';
import { OrganizationApiService } from '../organization.api.service';
import { BsModalService } from '../../../../node_modules/ngx-bootstrap';
import { HashModel } from '../../common/utility/hash-model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { IAdvance, IFormGroupSetup, IAdvanceInitialTransaction } from '../state/organization.interface';
import { CustomFieldErrorType } from '../../common/model';

@Component({
  selector: 'app-organization-advances-details',
  templateUrl: './organization-advances-details.component.html',
  styleUrls: ['./organization-advances-details.component.less']
})
export class OrganizationAdvancesDetailsComponent implements OnInit, OnChanges {
  @Input() organizationId: number;
  @Input() advanceId: number;
  @Input() modal: PhxModalComponent;
  @Input() activeAny: boolean;
  @Output() outputEvent = new EventEmitter();
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

  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private organizationService: OrganizationApiService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private modalService: BsModalService) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {
    this.internalOrganization();
    this.modal.modalRef = this.modalService.onHide.subscribe(e => {
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
    const advanceSubmitCommand = {
      LastModifiedDatetime: this.rootFormGroup.controls.LastModifiedDatetime.value,
      AdvanceId: this.advanceId,
      Description: this.rootFormGroup.controls.Description.value,
      AdvanceStatusId: this.rootFormGroup.controls.AdvanceStatusId.value
    };
    this.organizationService.advanceSubmit(advanceSubmitCommand).subscribe(response => {
      if (response.EntityId) {
        this.modal.hide();
        this.commonService.logSuccess('Advance submitted successfully');
        this.outputEvent.emit(true);
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
    this.organizationService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole().subscribe((response: any) => {
      this.listInternalOrganization = response.Items;
    });
  }

  getAdvanceDetails() {
    this.organizationService.getSingleAdvanceDetailByOriginalAndStatusIsActiveOrPendingChangeOrganization(this.organizationId, this.advanceId).subscribe((response: IAdvance) => {
      this.advanceDetails = response;
      this.onInitAdvanceDetails(response);
      if (this.activeAny && this.advanceDetails.AdvanceStatusId !== this.phxConstants.AdvanceStatus.Active) {
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
        AccessLevelId: advance.AccessLevelId,
        Id: advance.Id,
        OrganizationInternalLegalName: advance.OrganizationInternalLegalName,
        PayeeUserProfileWorkerId: advance.PayeeUserProfileWorkerId,
        PaidAmount: advance.PaidAmount,
        AdvanceInitialTransaction: formGroupSetup.formBuilder.group<IAdvanceInitialTransaction>({
          TransactionHeaderId: [advance.AdvanceInitialTransaction.TransactionHeaderId],
          PaymentTransactionNumber: [advance.AdvanceInitialTransaction.PaymentTransactionNumber],
          Amount: [advance.AdvanceInitialTransaction.Amount],
          ReleaseDate: [advance.AdvanceInitialTransaction.ReleaseDate],
          PaymentNumber: [advance.AdvanceInitialTransaction.PaymentNumber],
        })
      })
    );
    return formGroup;
  }
}
