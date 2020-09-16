import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { IFormGroupSetup, IGarnisheeNew, IPayee, IPayeeDetails } from '../state';
import { PhxConstants, CommonService, CodeValueService, ValidationExtensions } from '../../common';
import { HashModel } from '../../common/utility/hash-model';
import { CustomFieldService } from '../../common/services/custom-field.service';
import { CustomFieldErrorType } from '../../common/model';
import { Validators } from '../../../../node_modules/@angular/forms';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { BsModalService } from 'ngx-bootstrap';
import * as moment from 'moment';
import { ContactService } from '../shared/contact.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-contact-garnishee-new',
  templateUrl: './contact-garnishee-new.component.html',
  styleUrls: ['./contact-garnishee-new.component.less']
})
export class ContactGarnisheeNewComponent extends BaseComponentOnDestroy implements OnInit {

  formGroupSetup: IFormGroupSetup;
  formGarnishee: FormGroup<IGarnisheeNew>;
  listCurrency: Array<any>;
  listInternalOrganization: Array<any>;
  garnishee: IGarnisheeNew;
  newGarnishee = {} as IGarnisheeNew;
  phxConstants = PhxConstants;
  codeValueGroups: any;
  validationMessages: Array<string> = [];
  listGarnisheePayToList: Array<any>;
  isPayeeEditable: boolean = true;
  payee: IPayee;
  isNew: boolean = false;
  canShow = true;
  @Input() profileId: number;
  @Input() modal: PhxModalComponent;
  @Output() outputResponse = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private contactService: ContactService,
    private modalService: BsModalService
  ) {
    super();
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.getInternalCompanyList();
    this.getListGarnisheePayToGroup();
    this.getCurrency();
  }

  getInternalCompanyList() {
    this.contactService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.listInternalOrganization = response.Items;
        this.listInternalOrganization.forEach(element => {
          element.DisplayValue = element.DisplayName + ' - ' + element.Id;
        });
      });
  }

  getListGarnisheePayToGroup() {
    this.contactService.getListGarnisheePayToGroup()
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.listGarnisheePayToList = response.Items;
    });
  }

  getCurrency() {
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true).filter(
      x => x.id === PhxConstants.Currency.CAD || x.id === PhxConstants.Currency.USD || x.id === PhxConstants.Currency.MXN);
  }

  ngOnInit() {
    this.formGroupInitialValues();
    this.modal.modalRef = this.modalService.onHide.subscribe(e => {
      this.formGroupInitialValues();
      this.canShow = true;
    });
  }

  formGroupInitialValues() {
    this.garnishee = {
      OrganizationIdInternal: null,
      IssueDate: null,
      CurrencyId: null,
      PayTypeIsAmount: true,
      PayAmount: null,
      PayAmountIsMaximum: true,
      PayAmountMaximum: null,
      Description: null,
      ReferenceNumber: null,
      Payee: {
        PayToId: null,
        PayToDetails: {
          AddressLine1: null,
          AddressLine2: null,
          CityName: null,
          CountryId: null,
          SubdivisionId: null,
          PostalCode: null,
          PayToName: null,
          PayToType: null
        }
      },
      GarnisheeUserProfileWorkerId: this.profileId,
      PayPercentage: null,
      WorkflowPendingTaskId: -1
    };
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.formGarnishee = this.formBuilderGroupSetup(this.formGroupSetup, this.garnishee);
  }

  formGroupPayeeDetails(): FormGroup<IPayeeDetails> {
    return <FormGroup<IPayeeDetails>>this.formGarnishee.controls.Payee.get('PayToDetails');
  }

  paybackTypeChanged(value: boolean) {
    if (value) {
      this.formGarnishee.controls.PayPercentage.setValue(null);
      this.formGarnishee.controls.PayPercentage.setErrors(null);
      this.formGarnishee.controls.PayAmount.setValidators(Validators.required);
      this.formGarnishee.controls.PayPercentage.markAsPristine();
    } else {
      this.formGarnishee.controls.PayAmount.setValue(null);
      this.formGarnishee.controls.PayAmount.setErrors(null);
      this.formGarnishee.controls.PayPercentage.setValidators(Validators.required);
      this.formGarnishee.controls.PayAmount.markAsPristine();
    }
  }

  amountTypeChanged(value: boolean) {
    if (value) {
      this.formGarnishee.controls.PayAmountMaximum.setValidators(Validators.required);
    } else {
      this.formGarnishee.controls.PayAmountMaximum.setValue(null);
      this.formGarnishee.controls.PayAmountMaximum.setErrors(null);
      this.formGarnishee.controls.PayAmountMaximum.markAsPristine();
    }
  }

  onClickCancel() {
    this.formGarnishee.setValue(this.garnishee, { emitEvent: false });
    this.formGarnishee.markAsPristine();
    this.canShow = false;
    this.isNew = false;
    this.modal.hide();
  }

  onClickSubmit() {
    this.updateModelFromFormGroup(this.formGarnishee);
    this.newGarnishee.IssueDate = moment(this.newGarnishee.IssueDate).format('YYYY-MM-DD');
    if (this.isNew) {
      this.newGarnishee.Payee.PayeeDetails = this.newGarnishee.Payee.PayToDetails;
      delete this.newGarnishee.Payee.PayToDetails;
    } else {
      delete this.newGarnishee.Payee.PayeeDetails;
    }
    this.contactService.garnisheeNewSave(this.newGarnishee)
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      if (response.IsValid) {
        this.modal.hide();
        this.commonService.logSuccess('New Garnishee submitted successfully');
        this.formGarnishee.setValue(this.garnishee);
        this.outputResponse.emit();
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

  updateModelFromFormGroup(formGroup: FormGroup<IGarnisheeNew>) {
    Object.assign(this.newGarnishee, {
      ...formGroup.value
    });
  }

  onClickPayee(value: boolean) {
    this.isNew = value;
    this.formGarnishee.controls.Payee.setValue(this.garnishee.Payee, { emitEvent: false });
    this.formGarnishee.controls.Payee.markAsPristine();
    if (this.isNew) {
      this.isPayeeEditable = true;
    }
  }

  onValueChanged(e: any) {
    const selectedGarnisheeType: IPayee = this.listGarnisheePayToList.find(i => i.PayToId === e.value);
    if (selectedGarnisheeType) {
      this.formGarnishee.controls.Payee.setValue(selectedGarnisheeType, { emitEvent: false });
      this.isPayeeEditable = false;
    } else {
      this.isPayeeEditable = true;
      this.formGarnishee.controls.Payee.get('PayToId').setErrors({ 'invalid': true });
    }
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, garnishee: IGarnisheeNew): FormGroup<IGarnisheeNew> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<IGarnisheeNew>(formGroupSetup.toUseHashCode, 'IGarnisheeNew', garnishee, 0, () =>
      formGroupSetup.formBuilder.group<IGarnisheeNew>({
        OrganizationIdInternal: [
          garnishee.OrganizationIdInternal,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdInternal', CustomFieldErrorType.required))
          ]
        ],
        IssueDate: [
          garnishee.IssueDate,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IssueDate', CustomFieldErrorType.required))
          ]
        ],
        CurrencyId: [
          garnishee.CurrencyId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))
          ]
        ],
        PayTypeIsAmount: garnishee.PayTypeIsAmount,
        PayAmount: [
          garnishee.PayAmount,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayAmount', CustomFieldErrorType.required))
          ]
        ],
        PayPercentage: [
          garnishee.PayPercentage, []
        ],
        PayAmountIsMaximum: garnishee.PayAmountIsMaximum,
        PayAmountMaximum: [
          garnishee.PayAmountMaximum,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayAmountMaximum', CustomFieldErrorType.required))
          ]
        ],
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
        GarnisheeUserProfileWorkerId: [
          garnishee.GarnisheeUserProfileWorkerId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('GarnisheeUserProfileWorkerId', CustomFieldErrorType.required))
          ]
        ],
        WorkflowPendingTaskId: [garnishee.WorkflowPendingTaskId],
        Payee: formGroupSetup.formBuilder.group<IPayee>({
          PayToId: [garnishee.Payee.PayToId],
          PayToDetails: formGroupSetup.formBuilder.group<IPayeeDetails>({
            PayToName: [
              garnishee.Payee.PayToDetails.PayToName,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(64),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayToName', CustomFieldErrorType.required))
              ]
            ],
            PayToType: [
              garnishee.Payee.PayToDetails.PayToType,
              [
                ValidationExtensions.minLength(1),
                ValidationExtensions.maxLength(64),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PayToType', CustomFieldErrorType.required))
              ]
            ],
            AddressLine1: [
              garnishee.Payee.PayToDetails.AddressLine1,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(64),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AddressLine1', CustomFieldErrorType.required))
              ]
            ],
            AddressLine2: [
              garnishee.Payee.PayToDetails.AddressLine2,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(64)
              ]
            ],
            CityName:
              [
                garnishee.Payee.PayToDetails.CityName,
                [
                  ValidationExtensions.minLength(3),
                  ValidationExtensions.maxLength(64),
                  ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CityName', CustomFieldErrorType.required))
                ]
              ],
            CountryId: [
              garnishee.Payee.PayToDetails.CountryId,
              [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CountryId', CustomFieldErrorType.required))
              ]
            ],
            SubdivisionId: [
              garnishee.Payee.PayToDetails.SubdivisionId,
              [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SubdivisionId', CustomFieldErrorType.required))
              ]
            ],
            PostalCode: [
              garnishee.Payee.PayToDetails.PostalCode,
              [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PostalCode', CustomFieldErrorType.required))
              ]
            ]
          })
        })
      })
    );
    return formGroup;
  }


}
