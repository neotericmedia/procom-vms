import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IBenefitSetup, IFormGroupSetup, IUserProfileWorkerBenefit, IProfile, IOrganizationBase } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { ContactService } from '../shared/contact.service';
import { UtilityService } from '../../common/services/utility-service.service';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-profile-benefit-setup',
  templateUrl: './contact-profile-benefit-setup.component.html',
  styleUrls: ['./contact-profile-benefit-setup.component.less']
})
export class ContactProfileBenefitSetupComponent extends ContactBaseComponentPresentational<IBenefitSetup> implements OnInit {

  @ViewChild('benefitSetupModal') modal: PhxModalComponent;

  @Input() profile: IProfile;

  html: {
    selectedBenefitSetupStatus: boolean;
    selectedBenefitSetupDate: Date;
    numberFilter: any;
    today: Date;
    errorMessage: string;
    internalOrgList: IOrganizationBase[]
    benefitSteupDialogConfig: Array<{
      icon: string;
      tooltip: string;
      btnType: string;
      disabled?(): boolean;
      action: Function
    }>;
    selectedBenefitSetup: FormGroup<IUserProfileWorkerBenefit>;
  } = {
      selectedBenefitSetupDate: null,
      internalOrgList: [],
      errorMessage: null,
      today: new Date(),
      numberFilter: { 'from': 0, 'to': 999999999999.99, 'decimalplaces': 2 },
      selectedBenefitSetupStatus: false,
      benefitSteupDialogConfig: [],
      selectedBenefitSetup: null
    };

  private get benefitFormArray() {
    return this.inputFormGroup.controls.UserProfileWorkerBenefits as FormArray<IUserProfileWorkerBenefit>;
  }

  datePickerCallback() {
    if (this.html.selectedBenefitSetup.value.IsActive) {
      if (this.html.selectedBenefitSetup.value.EffectiveDate < this.html.today) {
        this.html.errorMessage = 'Effective date cannot be less than today date.';
      }
    }
  }

  public get benefitSetupList() {
    if (this.inputFormGroup.controls.UserProfileWorkerBenefits) {
      if ((<FormArray<IUserProfileWorkerBenefit>>this.inputFormGroup.controls.UserProfileWorkerBenefits).controls.length) {
        return (this.inputFormGroup.controls.UserProfileWorkerBenefits as FormArray<IUserProfileWorkerBenefit>)
          .controls as Array<FormGroup<IUserProfileWorkerBenefit>>;
      } else {
        return new Array<FormGroup<IUserProfileWorkerBenefit>>();
      }
    }
  }

  @Input() isEditable = false;

  public getCodeValuelistsStatic() {

    this.contactService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole()
      .takeUntil(this.isDestroyed$)
      .subscribe((x) => {
        this.html.internalOrgList = x.Items;
      });
  }

  public businessRules(obj: IFormGroupValue): void {
    switch (obj.name) {
      case 'IsApplyBenefit':
        if (obj.val && this.inputFormGroup.controls.UserProfileWorkerBenefits) {
          if (this.inputFormGroup.controls.UserProfileWorkerBenefits.value.length = 0) {
            this.html.selectedBenefitSetup = this.createBenefitSetup();
            this.patchValue(this.inputFormGroup, {
              UserProfileWorkerBenefits: [this.html.selectedBenefitSetup.value]
            });

            this.modal.show();
          }
        }
        break;
      default:
        break;
    }
  }

  onApplyBenefit() {
    if (this.inputFormGroup.controls.UserProfileWorkerBenefits.value.length === 0) {
      this.html.selectedBenefitSetup = this.createBenefitSetup();
      this.patchValue(this.inputFormGroup, {
        UserProfileWorkerBenefits: [this.html.selectedBenefitSetup.value]
      });
      this.modal.show();
    }
  }

  constructor(private fb: FormBuilder,
    private util: UtilityService,
    private contactService: ContactService) {
    super('ContactProfileBenefitSetupComponent');
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {
    this.html.benefitSteupDialogConfig = [
      {
        icon: 'done',
        tooltip: 'Submit',
        btnType: 'primary',
        disabled: (): boolean => {
          return !this.html.selectedBenefitSetup.valid;
        },
        action: () => {
          if (this.html.selectedBenefitSetup.valid) {
            this.onSubmit();
          }
        }
      },
      {
        icon: 'clear',
        tooltip: 'Cancel',
        btnType: 'default',
        action: () => {
          this.modal.hide();
        }
      }
    ];
  }

  onSubmit() {
    const idx = this.inputFormGroup.value.UserProfileWorkerBenefits.findIndex(x => x.UId === this.html.selectedBenefitSetup.value.UId);
    const activeIdx = this.inputFormGroup.value.UserProfileWorkerBenefits.findIndex(x => x.IsActive);
    if ((this.html.selectedBenefitSetupStatus === false && this.benefitFormArray.length === 0) ||
      (this.html.selectedBenefitSetupStatus !== this.html.selectedBenefitSetup.value.IsActive &&
        this.html.selectedBenefitSetupStatus === false && activeIdx === -1)) {

      this.benefitFormArray.push(this.formBuilder.group<IUserProfileWorkerBenefit>({
        BenefitTypeId: [this.html.selectedBenefitSetup.value.BenefitTypeId, [Validators.required]],
        OrganizationIdInternal: [this.html.selectedBenefitSetup.value.OrganizationIdInternal, [Validators.required]],
        EmployerAmount: [this.html.selectedBenefitSetup.value.EmployerAmount, [Validators.required]],
        EmployeeAmount: [this.html.selectedBenefitSetup.value.EmployeeAmount, [Validators.required]],
        IsActive: [this.html.selectedBenefitSetup.value.IsActive],
        EffectiveDate: [this.html.selectedBenefitSetup.value.EffectiveDate, [Validators.required]],
        UserProfileWorkerId: [this.html.selectedBenefitSetup.value.UserProfileWorkerId],
        Id: [this.html.selectedBenefitSetup.value.Id + 1],
        SourceId: [this.html.selectedBenefitSetup.value.SourceId],
        IsNew: [true]
      }));

      if (idx > -1) {
        (this.benefitFormArray.at(idx) as FormGroup<IUserProfileWorkerBenefit>).controls.IsActive.setValue(false);
      }
    } else if (this.html.selectedBenefitSetupStatus !== this.html.selectedBenefitSetup.value.IsActive &&
      this.html.selectedBenefitSetupStatus === false && activeIdx > 0 && this.html.selectedBenefitSetupDate !== this.html.selectedBenefitSetup.value.EffectiveDate) {

      this.benefitFormArray.push(this.formBuilder.group<IUserProfileWorkerBenefit>({
        BenefitTypeId: [this.html.selectedBenefitSetup.value.BenefitTypeId, [Validators.required]],
        OrganizationIdInternal: [this.html.selectedBenefitSetup.value.OrganizationIdInternal, [Validators.required]],
        EmployerAmount: [this.html.selectedBenefitSetup.value.EmployerAmount, [Validators.required]],
        EmployeeAmount: [this.html.selectedBenefitSetup.value.EmployeeAmount, [Validators.required]],
        IsActive: [this.html.selectedBenefitSetup.value.IsActive],
        EffectiveDate: [this.html.selectedBenefitSetup.value.EffectiveDate, [Validators.required]],
        UserProfileWorkerId: [this.html.selectedBenefitSetup.value.UserProfileWorkerId],
        Id: [this.html.selectedBenefitSetup.value.Id + 1],
        SourceId: [this.html.selectedBenefitSetup.value.SourceId],
        IsNew: [true]
      }));

    } else if (this.html.selectedBenefitSetupStatus !== this.html.selectedBenefitSetup.value.IsActive &&
      this.html.selectedBenefitSetupStatus === false && activeIdx > 0) {
      (this.benefitFormArray.at(activeIdx) as FormGroup<IUserProfileWorkerBenefit>).patchValue(this.html.selectedBenefitSetup.value);
    } else {
      if (idx === -1 && activeIdx === -1) {
        this.benefitFormArray.push(this.formBuilder.group<IUserProfileWorkerBenefit>({
          BenefitTypeId: [this.html.selectedBenefitSetup.value.BenefitTypeId, [Validators.required]],
          OrganizationIdInternal: [this.html.selectedBenefitSetup.value.OrganizationIdInternal, [Validators.required]],
          EmployerAmount: [this.html.selectedBenefitSetup.value.EmployerAmount, [Validators.required]],
          EmployeeAmount: [this.html.selectedBenefitSetup.value.EmployeeAmount, [Validators.required]],
          IsActive: [this.html.selectedBenefitSetup.value.IsActive],
          EffectiveDate: [this.html.selectedBenefitSetup.value.EffectiveDate, [Validators.required]],
          UserProfileWorkerId: [this.html.selectedBenefitSetup.value.UserProfileWorkerId],
          Id: [this.html.selectedBenefitSetup.value.Id + 1],
          SourceId: [this.html.selectedBenefitSetup.value.SourceId],
          IsNew: [true]
        }));
      } else {
        (this.benefitFormArray.at(idx) as FormGroup<IUserProfileWorkerBenefit>).patchValue(this.html.selectedBenefitSetup.value);
      }
    }

    this.modal.hide();
  }

  toFloat(value1: string, value2: string) {

    const calc = (value: number) => {
      if (!value) {
        return '0.00';
      }

      const result = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];

      return result.includes('.') ? result : `${result}.00`;
    };

    if (value1 && value2) {
      return calc(parseFloat(value1) + parseFloat(value2));
    } else {
      return '0.00';
    }

  }

  addBlankBenefitSetup() {
    this.benefitFormArray.push(this.formBuilder.group<IUserProfileWorkerBenefit>({
      UId: [this.util.createUuid()],
      BenefitTypeId: [0, [Validators.required]],
      OrganizationIdInternal: [0, [Validators.required]],
      EmployerAmount: [null, [Validators.required]],
      EmployeeAmount: [null, [Validators.required]],
      IsActive: [true],
      EffectiveDate: [null, [Validators.required]],
      UserProfileWorkerId: [0],
      Id: [0],
      SourceId: [this.profile.SourceId],
      IsNew: [true]
    }));
  }

  validate() {
    return this.html.selectedBenefitSetup.valid;
  }

  onBenefitClick(benefit: FormGroup<IUserProfileWorkerBenefit>) {
    this.html.selectedBenefitSetup = this.createBenefitSetup(benefit.value);
    this.html.selectedBenefitSetupStatus = benefit.controls.IsActive.value;
    this.html.selectedBenefitSetupDate = benefit.controls.EffectiveDate.value;
    this.modal.show();
  }

  trackByFn(index: number) {
    return index;
  }

  createBenefitSetup(benefit?: IUserProfileWorkerBenefit) {
    if (benefit) {
      return this.fb.group<IUserProfileWorkerBenefit>({
        UId: [benefit.UId],
        Id: [benefit.Id],
        UserProfileWorkerId: [benefit.UserProfileWorkerId],
        SourceId: [benefit.SourceId],
        BenefitTypeId: [benefit.BenefitTypeId, [Validators.required]],
        OrganizationIdInternal: [benefit.OrganizationIdInternal, [Validators.required]],
        IsActive: [benefit.IsActive, [Validators.required]],
        EmployerAmount: [benefit.EmployerAmount, [Validators.required]],
        EmployeeAmount: [benefit.EmployeeAmount, [Validators.required]],
        EffectiveDate: [benefit.EffectiveDate, [Validators.required]],
        IsNew: [benefit.IsNew]
      });
    } else {
      return this.fb.group<IUserProfileWorkerBenefit>({
        UId: [this.util.createUuid()],
        Id: [0],
        UserProfileWorkerId: [null],
        SourceId: [null],
        BenefitTypeId: [null, [Validators.required]],
        OrganizationIdInternal: [null, [Validators.required]],
        IsActive: [null, [Validators.required]],
        EmployerAmount: [null, [Validators.required]],
        EmployeeAmount: [null, [Validators.required]],
        EffectiveDate: [null, [Validators.required]],
        IsNew: [true]
      });
    }
  }

  onBenefitsModalHide() {
    if (this.benefitFormArray.length === 0 && this.inputFormGroup.controls.IsApplyBenefit.value) {
      this.inputFormGroup.controls.IsApplyBenefit.setValue(false);
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IBenefitSetup): FormGroup<IBenefitSetup> {

    const hasBenefit = model.UserProfileWorkerBenefits ? model.UserProfileWorkerBenefits.length ? true : false : false;

    const getAsFormArray = (mo: IBenefitSetup) => {
      return formGroupSetup.formBuilder.array(
        mo.UserProfileWorkerBenefits.map((setup, index) => formGroupSetup.formBuilder.group<IUserProfileWorkerBenefit>({
          UId: [setup.Id ? setup.Id.toString() : index.toString()],
          Id: [setup.Id],
          UserProfileWorkerId: [setup.UserProfileWorkerId],
          SourceId: [setup.SourceId],
          BenefitTypeId: [setup.BenefitTypeId],
          OrganizationIdInternal: [setup.OrganizationIdInternal],
          IsActive: [setup.IsActive],
          EmployerAmount: [setup.EmployerAmount],
          EmployeeAmount: [setup.EmployeeAmount],
          EffectiveDate: [setup.EffectiveDate],
          IsNew: [false]
        }))
      );
    };

    const formGroup = formGroupSetup.formBuilder.group<IBenefitSetup>({
      IsApplyBenefit: [model.IsApplyBenefit ? model.IsApplyBenefit : false],
      UserProfileWorkerBenefits: hasBenefit ? (model.UserProfileWorkerBenefits ? getAsFormArray(model) : formGroupSetup.formBuilder.array([]))
        : formGroupSetup.formBuilder.array([])
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IBenefitSetup>): Partial<IProfile> {
    const fixDateValue = (setup: IBenefitSetup): IBenefitSetup => {
      if (setup.UserProfileWorkerBenefits) {
        setup.UserProfileWorkerBenefits.forEach(x => {
          x.EffectiveDate = <any>(new Date(x.EffectiveDate)).toISOString().split('T')[0];
        });
      }
      return setup;
    };

    return {
      ...fixDateValue(formGroup.value)
    };
  }

}
