import { Component, OnInit, Input } from '@angular/core';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IWorkerEligibility, IProfile, IFormGroupSetup } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { FormGroup, ControlsConfig } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-profile-worker-eligibility',
  templateUrl: './contact-profile-worker-eligibility.component.html',
  styleUrls: ['./contact-profile-worker-eligibility.component.less']
})
export class ContactProfileWorkerEligibilityComponent extends ContactBaseComponentPresentational<IWorkerEligibility> implements OnInit {
  @Input() profile: IProfile;

  html: {
    codeValueGroups: any;
    isForignWorker: boolean;
  } = {
    isForignWorker: false,
    codeValueGroups: null
  };

  public getCodeValuelistsStatic() {
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  public businessRules(obj: IFormGroupValue): void {
    switch (obj.name) {
      case 'WorkerEligibilityId':
        this.html.isForignWorker = obj.val === this.phxConstants.WorkerEligibility.ForeignWorker;
        break;
      case 'IsWorkerOnImpliedStatus':
        this.patchValue(this.inputFormGroup, { ImpliedStatusEffectiveDate: null });
        break;
      case 'WorkPermitTypeId':
        this.patchValue(this.inputFormGroup, { ClosedWorkPermitCompany: null });
        break;
      default:
        break;
    }
  }

  constructor() {
    super('ContactProfileWorkerEligibilityComponent');
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile): any {
    const formGroup: ControlsConfig<IWorkerEligibility> = {
      WorkerEligibilityId: [model.WorkerEligibilityId, [Validators.required]],
      TemporaryForeignPermitTypeId: [model.TemporaryForeignPermitTypeId, model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker ? [Validators.required] : []],
      IsWorkerOnImpliedStatus: [model.IsWorkerOnImpliedStatus, model.TemporaryForeignPermitTypeId && model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker ? [Validators.required] : []],
      ImpliedStatusEffectiveDate: [
        model.ImpliedStatusEffectiveDate,
        model.IsWorkerOnImpliedStatus && model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker
          ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ImpliedStatusEffectiveDate', CustomFieldErrorType.required))]
          : null
      ],
      IECCategoryStudentTypeId: [
        model.IECCategoryStudentTypeId,
        model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker && model.TemporaryForeignPermitTypeId === PhxConstants.TemporaryForeignPermitType.StudentIec ? [Validators.required] : []
      ],
      EligibilityForWorkPermitId: [model.EligibilityForWorkPermitId, model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker ? [Validators.required] : []],
      WorkPermitNumber: [
        model.WorkPermitNumber,
        model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker
          ? [Validators.maxLength(32), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WorkPermitNumber', CustomFieldErrorType.required))]
          : []
      ],
      WorkPermitTypeId: [model.WorkPermitTypeId, model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker ? [Validators.required] : []],
      ClosedWorkPermitCompany: [
        model.ClosedWorkPermitCompany,
        model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker && (model.WorkPermitTypeId === PhxConstants.WorkPermitType.Closed || model.WorkPermitTypeId === PhxConstants.WorkPermitType.Other)
          ? [Validators.maxLength(128), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ClosedWorkPermitCompany', CustomFieldErrorType.required))]
          : null
      ],
      WorkPermitRestrictions: [model.WorkPermitRestrictions, [Validators.maxLength(4096)]],
      WorkPermitExpiryDate: [
        model.WorkPermitExpiryDate,
        model.WorkerEligibilityId === PhxConstants.WorkerEligibility.ForeignWorker ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('WorkPermitExpiryDate', CustomFieldErrorType.required))] : []
      ]
    };

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IWorkerEligibility>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }

  datePickerCallback() {
    if (this.profile.DateOfBirth && new Date(this.profile.DateOfBirth).getFullYear() > 0) {
      const age = this.commonService.calculateAge(this.profile.DateOfBirth, new Date().toDateString());

      if (age < 0) {
        this.commonService.logWarning('The chosen date is in the future');
      } else if (age < 16) {
        this.commonService.logWarning('The worker is younger than 16 years old');
      } else if (age > 65) {
        this.commonService.logWarning('The worker is older than 65 years old');
      }
    }
  }
}
