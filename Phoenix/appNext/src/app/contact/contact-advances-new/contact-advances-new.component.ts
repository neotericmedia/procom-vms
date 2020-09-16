import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { IFormGroupSetup, IAdvance } from '../../organization/state/organization.interface';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { CommonService, CustomFieldService, CodeValueService, ValidationExtensions, PhxConstants } from '../../common';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { BsModalService } from 'ngx-bootstrap';
import { Validators } from '../../../../node_modules/@angular/forms';
import * as moment from 'moment';
import { CustomFieldErrorType } from '../../common/model';
import { HashModel } from '../../common/utility/hash-model';
import { Subject, Observable } from '../../../../node_modules/rxjs';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-contact-advances-new',
  templateUrl: './contact-advances-new.component.html',
  styleUrls: ['./contact-advances-new.component.less']
})
export class ContactAdvancesNewComponent extends BaseComponentOnDestroy implements OnInit {

  @Input() profileDetails: any;
  @Input() modal: PhxModalComponent;
  @Output() outputEvent = new EventEmitter();
  addAdvance: any;
  formGroupSetup: IFormGroupSetup;
  rootFormGroup: FormGroup<IAdvance>;
  newAdvance = {} as IAdvance;
  listInternalOrganization: Array<any> = [];
  phxConstants = PhxConstants;
  listPaymentMethod: Array<any>;
  listCurrency: Array<any>;
  codeValueGroups: any;
  canShow = true;
  isPaybackValid: boolean;
  validationMessages: Array<string> = [];
  private keyUp = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private organizationService: OrganizationApiService,
    private modalService: BsModalService,
  ) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.getCurrency();
    this.internalOrganization();
    this.listPaymentMethod = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentMethodType, true);
  }

  ngOnInit() {
    this.setInitialValues();
    this.modal.modalRef = this.modalService.onHide.subscribe(e => {
      this.setInitialValues();
      this.canShow = true;
    });
    const observable = this.keyUp
      .map(value => (<HTMLInputElement>event.target).value)
      .debounceTime(700)
      .distinctUntilChanged()
      .flatMap((search) => {
        return Observable.of(search).delay(200);
      })
      .subscribe((data) => {
        // console.log('User Profile: [' + new Date().toISOString().slice(11, -5) + '] - ngOnInit this.keyUp event');
        this.amountChanged();
      });
  }

  paybackTypeChanged(value: boolean) {
    if (value) {
      this.rootFormGroup.controls.PaybackPercentage.setValue(null);
      this.rootFormGroup.controls.PaybackAmount.setValidators(Validators.required);
      this.rootFormGroup.controls.PaybackPercentage.clearValidators();
      this.rootFormGroup.controls.PaybackAmount.updateValueAndValidity();
      this.rootFormGroup.controls.PaybackPercentage.updateValueAndValidity();
    } else {
      this.rootFormGroup.controls.PaybackPercentage.setValidators(Validators.required);
      this.rootFormGroup.controls.PaybackAmount.setValue(null);
      this.rootFormGroup.controls.PaybackAmount.clearValidators();
      this.rootFormGroup.controls.PaybackAmount.updateValueAndValidity();
      this.rootFormGroup.controls.PaybackPercentage.updateValueAndValidity();
      this.isPaybackValid = true;
    }
  }

  amountChanged() {
    this.isPaybackValid = false;
    if (this.rootFormGroup.controls.AmountInitial.value && this.rootFormGroup.controls.PaybackAmount.value) {
      if (Number(this.rootFormGroup.controls.PaybackAmount.value) > Number(this.rootFormGroup.controls.AmountInitial.value)) {
        this.commonService.logWarning('Payback Amount should be equal or less than Initial Amount');
      } else {
        this.isPaybackValid = true;
      }
    }
    if (this.rootFormGroup.controls.AmountInitial.value && !this.rootFormGroup.controls.PaybackType.value) {
      this.isPaybackValid = true;
    }
  }

  onClickCancel() {
    this.rootFormGroup.setValue(this.addAdvance, { emitEvent: false });
    this.rootFormGroup.markAsPristine();
    this.canShow = false;
    this.modal.hide();
    this.validationMessages = [];
  }

  onSubmit() {
    this.updateModelFromFormGroup(this.rootFormGroup);
    this.newAdvance.IssueDate = moment(this.newAdvance.IssueDate).format('YYYY-MM-DD');
    this.organizationService.advanceNew(this.newAdvance)
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.modal.hide();
      this.commonService.logSuccess('Advance submitted successfully');
      this.rootFormGroup.setValue(this.addAdvance);
      this.outputEvent.emit();
    }, error => {
      let validationMessages = [];
      validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.validationMessages.push(element.Message);
        });
      }
    });
  }

  updateModelFromFormGroup(formGroup: FormGroup<IAdvance>) {
    Object.assign(this.newAdvance, {
      ...formGroup.value
    });
  }

  setInitialValues() {
    this.addAdvance = {
      OrganizationIdInternal: null,
      IssueDate: null,
      AmountInitial: null,
      PaybackType: 1,
      PaybackAmount: null,
      PaybackPercentage: null,
      Description: null,
      PayeeName: this.profileDetails.PayeeName,
      AddressLine1: this.profileDetails.UserProfileAddresses[0].AddressLine1,
      AddressLine2: this.profileDetails.UserProfileAddresses[0].AddressLine2 ? this.profileDetails.UserProfileAddresses[0].AddressLine2 : null,
      CityName: this.profileDetails.UserProfileAddresses[0].CityName,
      CountryId: this.profileDetails.UserProfileAddresses[0].CountryId,
      SubdivisionId: this.profileDetails.UserProfileAddresses[0].SubdivisionId,
      PostalCode: this.profileDetails.UserProfileAddresses[0].PostalCode,
      PaymentMethodId: null,
      CurrencyId: null,
      PayeeUserProfileWorkerId: this.profileDetails.Id,
      PayeeOrganizationIdSupplier: null,
      PaidAmount: null
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.rootFormGroup = this.formBuilderGroupSetup(this.formGroupSetup, this.addAdvance);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, addAdvance: IAdvance): FormGroup<IAdvance> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IAdvance>(formGroupSetup.toUseHashCode, 'IAdvance', addAdvance, 0, () =>
      formGroupSetup.formBuilder.group<IAdvance>({
        OrganizationIdInternal: [
          addAdvance.OrganizationIdInternal,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdInternal', CustomFieldErrorType.required))
          ]
        ],
        IssueDate: [
          addAdvance.IssueDate,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IssueDate', CustomFieldErrorType.required))
          ]
        ],
        AmountInitial: [
          addAdvance.AmountInitial,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AmountInitial', CustomFieldErrorType.required)),
          ]
        ],
        PaybackType: true,
        PaybackAmount: [
          addAdvance.PaybackAmount,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaybackAmount', CustomFieldErrorType.required))
          ]
        ],
        PaybackPercentage: [
          addAdvance.PaybackPercentage,
        ],
        Description: [
          addAdvance.Description,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))
          ]
        ],
        PayeeName: addAdvance.PayeeName,
        AddressLine1: [
          addAdvance.AddressLine1,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AddressLine1', CustomFieldErrorType.required))
          ]
        ],
        AddressLine2: [
          addAdvance.AddressLine2,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64)
          ]
        ],
        CityName: [
          addAdvance.CityName,
          [
            ValidationExtensions.minLength(3),
            ValidationExtensions.maxLength(64),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CityName', CustomFieldErrorType.required))
          ]
        ],
        CountryId: [
          addAdvance.CountryId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CountryId', CustomFieldErrorType.required))
          ]
        ],
        SubdivisionId: [
          addAdvance.SubdivisionId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SubdivisionId', CustomFieldErrorType.required))
          ]
        ],
        PostalCode: [
          addAdvance.PostalCode,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PostalCode', CustomFieldErrorType.required))
          ]
        ],
        PaymentMethodId: [
          addAdvance.PaymentMethodId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PaymentMethodId', CustomFieldErrorType.required))
          ]
        ],
        CurrencyId: [
          addAdvance.CurrencyId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))
          ]
        ],
        PayeeOrganizationIdSupplier: addAdvance.PayeeOrganizationIdSupplier,
        PayeeUserProfileWorkerId: addAdvance.PayeeUserProfileWorkerId,
        PaidAmount: [addAdvance.PaidAmount]
      })
    );
    return formGroup;
  }

  onCountryChanged() {
    this.rootFormGroup.controls.SubdivisionId.setValidators(Validators.required);
    this.rootFormGroup.controls.SubdivisionId.setValue(null);
    this.rootFormGroup.controls.PostalCode.setValue(null);
    this.rootFormGroup.controls.PostalCode.setValidators(Validators.required);
  }

  internalOrganization() {
    this.organizationService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole()
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.listInternalOrganization = response.Items;
      this.listInternalOrganization.forEach(element => {
        element.DisplayValue = element.DisplayName + ' - ' + element.Id;
      });
    });
  }

  getCurrency() {
    this.listCurrency = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true).filter(
      x => x.id === this.phxConstants.Currency.CAD || x.id === this.phxConstants.Currency.USD || x.id === this.phxConstants.Currency.MXN);
  }

}
