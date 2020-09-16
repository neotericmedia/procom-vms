import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IUserProfileAddress, IFormGroupOnNew, IFormGroupSetup, IProfile, IContactInfo, IUserProfileWorkerSPGovernmentRuling } from '../state/profile.interface';
import { ActivatedRoute } from '@angular/router';
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-contact-t4a-form-eligibility',
    templateUrl: './contact-t4a-form-eligibility.component.html',
    styleUrls: ['./contact-t4a-form-eligibility.component.less']
})
export class ContactT4AFormEligibilityComponent extends ContactBaseComponentPresentational<IUserProfileWorkerSPGovernmentRuling>
    implements OnInit {

    @Input() rulingIndex: number;
    @Input() areComplianceFieldsEditable: boolean;
    @Input() selectedValues: Array<any>;
    @Input() workerClientOrganizations: Array<{
        Id: number,
        DisplayName: string,
        Code: string,
        IsTest: boolean
    }> = [];

    mask: any;
    html: {
        profileId: number;
        codeValueGroups: any;
    } = {
            profileId: 0,
            codeValueGroups: null,
        };


    constructor(private activatedRoute: ActivatedRoute) {
        super('ContactT4AFormEligibilityComponent');
        this.getCodeValuelistsStatic();
    }

    businessRules(obj: IFormGroupValue): void {
        let value: Partial<IUserProfileWorkerSPGovernmentRuling> = null;
        switch (obj.name) {
            case 'EffectiveYearDate':
                value = {
                    EffectiveYear: (new Date(obj.val)).getFullYear()
                };
                break;
        }

        this.patchValue(this.inputFormGroup, value);
    }

    onOutputEvent() {
        this.outputEvent.emit();
    }

    ngOnInit() {
        this.activatedRoute.params
            .takeUntil(this.isDestroyed$)
            .subscribe(r => {
                this.html.profileId = r.profileId;
            });
    }

    getCodeValuelistsStatic() {

    }

    recalcLocalProperties(rulingFormGroup: FormGroup<IUserProfileWorkerSPGovernmentRuling>) {
    }

    onClickDeleteRuling() {
        const formArrayT4AFormEligibility: FormArray<IUserProfileWorkerSPGovernmentRuling> = <FormArray<IUserProfileWorkerSPGovernmentRuling>>this.inputFormGroup.parent;
        formArrayT4AFormEligibility.removeAt(this.rulingIndex);
        this.outputEvent.emit();
    }

    public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile): FormArray<IUserProfileWorkerSPGovernmentRuling> {
        if (!model.UserProfileWorkerSPGovernmentRulings) { return; }
        const formArray = formGroupSetup.formBuilder.array<IUserProfileWorkerSPGovernmentRuling>(
            model.UserProfileWorkerSPGovernmentRulings.map((ruling: IUserProfileWorkerSPGovernmentRuling, index) => {
                const fg = formGroupSetup.hashModel.getFormGroup<IUserProfileWorkerSPGovernmentRuling>(formGroupSetup.toUseHashCode, 'IUserProfileWorkerSPGovernmentRuling', ruling, index, () =>
                    formGroupSetup.formBuilder.group<IUserProfileWorkerSPGovernmentRuling>({
                        Id: [ruling.Id],
                        EffectiveYear: [ruling.EffectiveYear],
                        OrganizationIdClient: [ruling.OrganizationIdClient, model.IsApplyWorkerSPGovernmentRuling && model.ValidateComplianceDraft ? [
                            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdClient', CustomFieldErrorType.required))
                        ] : []],
                        RulingNumber: [ruling.RulingNumber, [
                            Validators.maxLength(250)
                        ]],
                        EffectiveYearDate: [new Date(`01/01/${ruling.EffectiveYear}`), model.IsApplyWorkerSPGovernmentRuling && model.ValidateComplianceDraft ? [
                            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EffectiveYearDate', CustomFieldErrorType.required))
                        ] : []]
                    })
                );

                if (model.IsApplyWorkerSPGovernmentRuling && model.ValidateComplianceDraft) {
                    fg.get('OrganizationIdClient').setValidators(ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdClient', CustomFieldErrorType.required)));
                    fg.get('EffectiveYearDate').setValidators(ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EffectiveYearDate', CustomFieldErrorType.required)));
                } else {
                    fg.get('OrganizationIdClient').setValidators(null);
                    fg.get('EffectiveYearDate').setValidators(null);
                }

                return fg;
            })
        );

        return formArray;
    }

    public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, model: IProfile): FormGroup<IUserProfileWorkerSPGovernmentRuling> {
        return formGroupOnNew.formBuilder.group<IUserProfileWorkerSPGovernmentRuling>({
            Id: [0],
            EffectiveYear: [(new Date()).getFullYear()],
            OrganizationIdClient: [null, model.IsApplyWorkerSPGovernmentRuling && model.ValidateComplianceDraft ? [
                Validators.required
            ] : []],
            RulingNumber: [null, [
                Validators.maxLength(250)
            ]],
            EffectiveYearDate: [new Date(`01/01/${(new Date()).getFullYear()}`), model.IsApplyWorkerSPGovernmentRuling && model.ValidateComplianceDraft ? [
                Validators.required
            ] : []]
        });
    }

    public static formGroupToPartial(formGroupUserProfileAddresses: FormGroup<IContactInfo>): Partial<IProfile> {
        const userProfileAddresses: Array<IUserProfileAddress> = formGroupUserProfileAddresses.controls.UserProfileAddresses.value;
        return { UserProfileAddresses: userProfileAddresses };
    }

}
