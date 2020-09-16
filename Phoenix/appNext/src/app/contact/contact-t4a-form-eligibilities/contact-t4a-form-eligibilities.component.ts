import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CustomFieldService } from '../../common';
import { IReadOnlyStorage, IUserProfileAddress, IContactInfo, IFormGroupOnNew, IProfile, IUserProfileWorkerSPGovernmentRuling, ICanadianSPProfile } from '../state';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactService } from '../shared/contact.service';
import { ActivatedRoute } from '@angular/router';
import { ContactT4AFormEligibilityComponent } from '../contact-t4a-form-eligibility/contact-t4a-form-eligibility.component';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';

@Component({
  selector: 'app-contact-t4a-form-eligibilities',
  templateUrl: './contact-t4a-form-eligibilities.component.html',
  styleUrls: ['./contact-t4a-form-eligibilities.component.less']
})
export class ContactT4AFormEligibilitesComponent extends BaseComponentOnDestroy implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ICanadianSPProfile>;
  @Output() outputEvent = new EventEmitter();
  @Input() areComplianceFieldsEditable = false;
  @Input() currentProfile: IProfile;

  html: {
    phxConstants: typeof PhxConstants;
    profileId: number;
    workerClientOrganizations: Array<{
      Id: number;
      DisplayName: string;
      Code: string;
      IsTest: boolean;
    }>;
  } = {
    phxConstants: null,
    profileId: 0,
    workerClientOrganizations: []
  };

    constructor(private formBuilder: FormBuilder, private customFieldService: CustomFieldService, private activatedRoute: ActivatedRoute, private contactService: ContactService) {
        super();
        this.html.phxConstants = PhxConstants;

        this.activatedRoute.params
            .takeUntil(this.isDestroyed$)
            .subscribe(r => {
                this.html.profileId = r.profileId;

                this.loadOrgClients();
            });
    }

  ngOnInit() {
    if (!this.inputFormGroup) {
      return;
    }

    if (this.inputFormGroup.controls.UserProfileWorkerSPGovernmentRulings.value.length === 0 && this.inputFormGroup.value.IsApplyWorkerSPGovernmentRuling) {
      this.onClickAddRuling();
    }
  }

  loadOrgClients() {
    this.contactService
      .getListOrganizationClientForWorkerProfile(this.html.profileId)
      .takeUntil(this.isDestroyed$)
      .subscribe((x: any) => {
        this.html.workerClientOrganizations = x.Items;
      });
  }

  trackByFn(index: number, item: FormGroup<IUserProfileWorkerSPGovernmentRuling>) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onClickAddRuling() {
    const formArrayDefaultRulings: FormArray<IUserProfileWorkerSPGovernmentRuling> = <FormArray<IUserProfileWorkerSPGovernmentRuling>>this.inputFormGroup.controls.UserProfileWorkerSPGovernmentRulings;
    const formGroupOnNew: IFormGroupOnNew = {
      formBuilder: this.formBuilder,
      customFieldService: this.customFieldService
    };
    formArrayDefaultRulings.push(ContactT4AFormEligibilityComponent.formBuilderGroupAddNew(formGroupOnNew, this.currentProfile));
    this.outputEvent.emit();
  }

  public get selectedValues() {
    return this.formArrayDefaultRulings.value;
  }

  public get formArrayDefaultRulings(): FormArray<IUserProfileWorkerSPGovernmentRuling> {
    return <FormArray<IUserProfileWorkerSPGovernmentRuling>>this.inputFormGroup.controls.UserProfileWorkerSPGovernmentRulings;
  }
}
