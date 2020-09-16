import { Component, OnInit } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { CommissionService } from './../commission.service';
import { CustomFieldService, ValidationExtensions, CodeValueService, CommonService } from '../../common';
import { IFormGroupSetup, ICommissionRateSetUp } from '../state';
import { HashModel } from '../../common/utility/hash-model';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType, PhxConstants } from '../../common/model';
import { filter, find } from 'lodash';
import { Router } from '@angular/router';

@Component({
    selector: 'app-commission-rate-setup',
    templateUrl: './commission-rate-setup.component.html'
})

export class CommissionRateSetUpComponent extends BaseComponentActionContainer implements OnInit {
    continueClicked: boolean;
    checkingDuplicateCommissionRates: boolean;
    commissionUserProfileId: number;
    formGroupSetup: IFormGroupSetup;
    commissionRateSetUpForm: FormGroup<ICommissionRateSetUp>;
    commissionUserProfileFirstName: string;
    commissionUserProfileLastName: string;
    commissionUserProfileStatusName: string;
    commissionUserProfileName: any[] = [];
    listCommissionRole: any[] = [];
    listCommissionRateType: any[] = [];
    listCommissionTemplates: any[] = [];
    duplicateCommissionRates: any[] = [];

    constructor(private commissionService: CommissionService,
        private customFieldService: CustomFieldService,
        private codeValueService: CodeValueService,
        private commonService: CommonService,
        private router: Router,
        private formBuilder: FormBuilder) {
        super();
        this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
        this.listCommissionRole = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.CommissionRole, true);
        this.listCommissionRateType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.CommissionRateType, true);
        this.createForm();
    }

    ngOnInit() {
        this.stateService
            .selectOnAction(getRouterState)
            .subscribe((routerStateResult: IRouterState) => {
                this.commissionUserProfileId = routerStateResult.params.id;
                this.commissionRateSetUpForm.get('CommissionUserProfileId').patchValue(this.commissionUserProfileId > 0 ? +this.commissionUserProfileId : null);
                this.getInternalUserProfileList();
            });
            if (this.listCommissionRateType.length) {
                this.commissionRateSetUpForm.get('commissionRateTypeId').patchValue(this.listCommissionRateType[0].id);
            }
        this.getTemplatesByEntityTypeId();
    }

    getInternalUserProfileList () {
        const commissionDataParams = this.commissionUserProfileId > 0 ?
                oreq.request()
                .withSelect([
                    'CommissionUserProfileId',
                    'CommissionUserProfileFirstName',
                    'CommissionUserProfileLastName',
                    'CommissionUserProfileStatusName'
                ])
                .withFilter(oreq.filter('CommissionUserProfileId').eq(this.commissionUserProfileId))
                .url() :
                oreq.request()
                .withSelect([
                    'CommissionUserProfileId',
                    'CommissionUserProfileFirstName',
                    'CommissionUserProfileLastName',
                    'CommissionUserProfileStatusId',
                    'CommissionUserProfileStatusName'
                ])
                .url();
        this.commissionService.getInternalUserProfileList(commissionDataParams).subscribe((result: any) => {
            this.commissionUserProfileName = result.Items.map(res => {
                return {
                    id: res.CommissionUserProfileId,
                    text: res.CommissionUserProfileFirstName + ' ' + res.CommissionUserProfileLastName,
                    commissionUserProfileFirstName: res.CommissionUserProfileFirstName,
                    commissionUserProfileLastName: res.CommissionUserProfileLastName,
                    commissionUserProfileStatusName: res.CommissionUserProfileStatusName
                };
            });
            if (this.commissionUserProfileId > 0) {
                const commissionUserProfile = find(this.commissionUserProfileName, (item) => item.id === +this.commissionUserProfileId);
                this.commissionUserProfileFirstName = commissionUserProfile.commissionUserProfileFirstName;
                this.commissionUserProfileLastName = commissionUserProfile.commissionUserProfileLastName;
                this.commissionUserProfileStatusName = commissionUserProfile.commissionUserProfileStatusName;
            }
        });
    }

    getTemplatesByEntityTypeId() {
        this.commissionService.getTemplatesByEntityTypeId(PhxConstants.EntityType.CommissionRateHeader).subscribe((result: any) => {
            this.listCommissionTemplates = result.Item;
        });
    }

    createForm() {
        this.commissionRateSetUpForm = this.formGroupSetup.formBuilder.group<ICommissionRateSetUp>({
            CommissionUserProfileId: [this.commissionUserProfileId || null,
                [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('WorkerCompensationId', CustomFieldErrorType.required))]
            ],
            commissionRoleId: [null,
                [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('commissionRoleId', CustomFieldErrorType.required))]
            ],
            commissionRateTypeId: [null,
                [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('commissionRateTypeId', CustomFieldErrorType.required))]
            ],
            commissionTemplateId: [null],
          });
    }

    onChangeCommissionUserProfileId () {
        this.checkDuplicateCommissionRates();
    }

    onChangeCommissionRoleId  () {
        this.resetCommissionTemplate();
        this.checkDuplicateCommissionRates();
    }

    onChangeCommissionRateTypeId () {
        this.resetCommissionTemplate();
    }

    resetCommissionTemplate() {
        this.commissionRateSetUpForm.get('commissionTemplateId').patchValue(null);
    }

    checkDuplicateCommissionRates() {
        this.continueClicked = false;
        this.duplicateCommissionRates = [];
        if (this.commissionRateSetUpForm.valid) {
            this.checkingDuplicateCommissionRates = true;
            this.commissionService.getCommissionRateHeadersByCommissionUserProfile(this.commissionRateSetUpForm.get('CommissionUserProfileId').value).subscribe((data: any) => {
                const commissionRates = data && data.Items && data.Items.length ? data.Items[0].CommissionRates : [];
                this.duplicateCommissionRates = filter(commissionRates, (rate) => {
                    const codeStatus = this.codeValueService.getCodeValue(rate.CommissionRateHeaderStatusId, this.commonService.CodeValueGroups.CommissionRateHeaderStatus);
                    rate.CommissionRateHeaderStatus = codeStatus ? codeStatus.text : rate.CommissionRateHeaderStatusId;
                    return rate.CommissionRoleId === this.commissionRateSetUpForm.get('commissionRoleId').value;
                });
                if (this.duplicateCommissionRates && this.duplicateCommissionRates.length) {
                    this.continueClicked = true;
                }
                this.checkingDuplicateCommissionRates = false;
            });
        }
    }

    openCommissionRate(rate) {
        this.router.navigate(['/next', 'commission', 'rate', rate.CommissionRateHeaderId, rate.CommissionRateVersionId,
            PhxConstants.CommissionRateNavigationName.detail
        ]);
    }

    onClickCreateNew() {
        const formValues = this.commissionRateSetUpForm.value;
        console.log('Form values creates new commission', formValues);
        this.router.navigate(['/next', 'commission', 'ratecreate',
            formValues.CommissionUserProfileId,
            formValues.commissionRoleId,
            formValues.commissionRateTypeId,
            formValues.commissionTemplateId ? formValues.commissionTemplateId : 0
        ]);
    }

    onClickContinue() {
        if (this.duplicateCommissionRates && this.duplicateCommissionRates.length) {
            this.continueClicked = true;
        } else {
            this.onClickCreateNew();
        }
    }
}

