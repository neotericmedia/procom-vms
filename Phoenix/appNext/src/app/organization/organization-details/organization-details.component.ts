// angular
import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef, ViewEncapsulation, EventEmitter, Output, ViewChild, isDevMode } from '@angular/core';
// common
import { FormGroup, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, PhxConstants, LoadingSpinnerService } from '../../common';
import { CodeValue, AccessAction, CustomFieldErrorType, FunctionalRole } from '../../common/model';
import { ICommonListsItem } from '../../common/lists/lists.interface';
import { IFormGroupValue } from '../../common/utility/form-group';
// organization
import { ITabDetailsDetail, IParentOrganization, IFormGroupSetup, IOrganization } from '../state/organization.interface';
import { OrganizationObservableService } from '../state/organization.observable.service';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { Observable } from '../../../../node_modules/rxjs';
import { AuthService } from '../../common/services/auth.service';
import { filter } from 'lodash';
import { OrganizationApiService } from '../organization.api.service';
import { PhxSelectBoxComponent } from '../../common/components/phx-select-box/phx-select-box.component';
import { ValidationErrors } from '@angular/forms';

interface IHtml {
  parentOrganizationNameFromText: boolean;
  isSendInviteVisible: boolean;
  isParentOrgFirstTime: boolean;
  functionalRoles: FunctionalRole[];
  isInvited: boolean;
  isLoaded: boolean;
  codeValueLists: {
    listSectorType: Array<CodeValue>;
    listIndustryType: Array<CodeValue>;
    listCountry: Array<CodeValue>;
    listTaxSubdivision: Array<CodeValue>;
  };
  commonLists: {
    listParentOrganizations: Array<ICommonListsItem>;
  };
}

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // encapsulation: ViewEncapsulation.None
})
export class OrganizationDetailsComponent extends OrganizationBaseComponentPresentational<ITabDetailsDetail> implements OnInit {
  html: IHtml = {
    isSendInviteVisible: false,
    isParentOrgFirstTime: true,
    parentOrganizationNameFromText: true,
    functionalRoles: [],
    isInvited: false,
    isLoaded: false,
    codeValueLists: {
      listSectorType: [],
      listIndustryType: [],
      listCountry: [],
      listTaxSubdivision: []
    },
    commonLists: {
      listParentOrganizations: []
    }
  };

  @Input() rootModel: IOrganization;
  @Output() ready = new EventEmitter<any>();
  @ViewChild('parentOrgDropdown') parentOrgDropdown: PhxSelectBoxComponent;

  constructor(private authService: AuthService, private orgService: OrganizationApiService, private loader: LoadingSpinnerService, private organizationObservableService: OrganizationObservableService, private chRef: ChangeDetectorRef) {
    super('OrganizationDetailsComponent');
    this.getCodeValuelistsStatic();
  }

  ngOnInit(): void {
    this.loader.show();
    this.organizationObservableService
      .organizationOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(organization => {
        if (organization) {
          if (!this.readOnlyStorage.IsEditable) {
            return;
          }

          this.isCodeExist(organization.Code, organization.Id).then(x => {
            if (x) {
              this.inputFormGroup.controls.Code.setErrors(x, { emitEvent: false });
              this.inputFormGroup.controls.Code.markAsDirty();
            } else {
              const result = this.validateStringLength('Code', this.inputFormGroup.controls.Code.value, 3, 6);
              if (result) {
                this.inputFormGroup.controls.Code.setErrors(result, { emitEvent: false });
              } else {
                this.inputFormGroup.controls.Code.setErrors(null, { emitEvent: false });
              }
            }
          });

          this.isLegalNameExist(organization.LegalName, organization.Id).then(x => {
            if (x) {
              this.inputFormGroup.controls.LegalName.setErrors(x, { emitEvent: false });
            } else {
              const result = this.validateStringLength('LegalName', this.inputFormGroup.controls.LegalName.value, 3, 128);

              if (result) {
                this.inputFormGroup.controls.LegalName.setErrors(result, { emitEvent: false });
              } else {
                this.inputFormGroup.controls.LegalName.setErrors(null, { emitEvent: false });
              }
            }
          });
        }
      });
    setTimeout(() => {
      this.canSendInvite();
      this.chRef.detectChanges();
      this.recalcLocalProperties(this.inputFormGroup);
      this.ready.emit();
      this.loader.hide();
      this.html.parentOrganizationNameFromText = this.inputFormGroup.controls.ParentOrganizationId.value ? false : true;
    }, 2000);
  }

  validateStringLength(fieldName: string, value: string, min: number, max: number): ValidationErrors {
    if (value) {
      if (value.length < min) {
        return { minLength: { message: `Required minimum ${min} charectors` } };
      }

      if (value.length > max) {
        return { maxLength: { message: `Maximum ${min} charectors are allowed` } };
      }

      return null;
    } else {
      return { required: { message: this.customFieldService.formatErrorMessage(fieldName, CustomFieldErrorType.required) } };
    }
  }

  private isLegalNameExist(legalName: string, orgId: number) {
    return new Promise((resole, revert) => {
      this.organizationObservableService
        .isExistsOrganizationLegalName(legalName, orgId)
        .debounceTime(1000)
        .subscribe(
          (response: any) => {
            resole(response ? { uniqueLegalName: { message: 'This organization legal name is not unique' } } : null);
          },
          error => revert(error)
        );
    });
  }

  private isCodeExist(code: string, orgId: number) {
    return new Promise((resole, revert) => {
      this.organizationObservableService
        .isExistsOrganizationCode(code, orgId)
        .debounceTime(1000)
        .subscribe(
          (response: any) => {
            resole(response ? { uniqueCode: { message: 'This organization code is not unique' } } : null);
          },
          error => revert(error)
        );
    });
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<ITabDetailsDetail> = null;

    const constructOrganizationCode = (legalName: string) => {
      let result = '';
      if (legalName) {
        legalName = legalName.trim();
        legalName = legalName.toUpperCase();
        let words: Array<string> = legalName.split(' ');
        words.forEach((word, index) => {
          words[index] = word.trim();
          words[index] = word.replace(/[^A-Z0-9]/gi, '');
        });
        words.forEach((word, index) => {
          if (word === 'THE' || word === 'AND') {
            words[index] = '';
          }
        });
        words = words.filter(word => word.length > 0);

        let totalLength = 0;
        words.forEach(word => {
          totalLength += word.length;
        });

        if (totalLength <= 6 || words.length === 1) {
          words.forEach(word => {
            result += word;
          });
        } else {
          words.forEach((word, index) => {
            if (index > 0) {
              //  not first word
              const lengthOfWord = word.length >= 3 ? 3 : word.length;
              result += word.substring(0, lengthOfWord);
            }
          });
          if (words[0].length >= 3) {
            result = words[0].substring(0, 3) + result;
          } else {
            result = words[0] + result;
          }
        }
        result = result.substring(0, 6);
      }
      return result;
    };

    switch (obj.name) {
      case 'LegalName':
        {
          const legalName = obj.val;
          const code = constructOrganizationCode(legalName);
          const displayName = (legalName || '').substring(0, 128);
          const parentOrganization: ICommonListsItem = this.html.commonLists.listParentOrganizations.find(p => p.DisplayText.toLowerCase() === legalName.toLowerCase());
          // this.inputFormGroup.controls.isFromParentOrgList.setValue();
          if (!this.html.parentOrganizationNameFromText) {
            // If choosing from the list
            if (parentOrganization) {
              value = {
                LegalName: legalName,
                Code: code,
                DisplayName: displayName,
                ParentOrganizationId: parentOrganization.Id,
                ParentOrganization: { Id: parentOrganization.Id, Name: parentOrganization.DisplayText }
                // isFromParentOrgList: !this.html.parentOrganizationNameFromText
              };
            } else {
              value = {
                LegalName: legalName,
                Code: code,
                DisplayName: displayName
                // isFromParentOrgList: !this.html.parentOrganizationNameFromText
              };
            }
          } else {
            value = {
              LegalName: legalName,
              Code: code,
              DisplayName: displayName,
              ParentOrganization: { Id: 0, Name: displayName },
              parentOrganizationName: displayName
              // isFromParentOrgList: !this.html.parentOrganizationNameFromText
            };
          }
        }
        break;
      case 'parentOrganizationName':
        {
          value = {
            ParentOrganizationId: 0,
            ParentOrganization: { Id: 0, Name: obj.val }
            // isFromParentOrgList: !this.html.parentOrganizationNameFromText
          };
        }
        break;
      case 'ParentOrganizationId':
        {
          const updatedId = Number(obj.val);
          const parentOrganization: ICommonListsItem = this.html.commonLists.listParentOrganizations.find(p => p.Id === updatedId);
          value = {
            parentOrganizationName: parentOrganization ? parentOrganization.DisplayText : null,
            ParentOrganizationId: updatedId,
            ParentOrganization: { Id: updatedId, Name: parentOrganization ? parentOrganization.DisplayText : null }
            // isFromParentOrgList: !this.html.parentOrganizationNameFromText
          };
        }
        break;
      case 'CountryId':
        {
          value = {
            CountryId: obj.val,
            DefaultTaxSubdivisionId: null
          };
        }
        break;
      case 'SectorTypeId':
        {
          value = {
            SectorTypeId: obj.val,
            IndustryTypeId: null
          };
        }
        break;
      default:
        {
          value = {
            [obj.name]: obj.val
          };
        }
        break;
    }

    if (value) {
      if (value.ParentOrganizationId > 0) {
        if (this.parentOrgDropdown) {
          this.parentOrgDropdown.selectBox.writeValue(value.ParentOrganizationId);
        }
      }
      this.patchValue(this.inputFormGroup, value);
    }
  }

  invite() {
    this.html.isInvited = true;
    this.loader.show();
    const that = this;
    this.orgService.organizationInviteClientConsultants({ Id: this.rootModel.Id }).then(
      function(responseSuccess) {
        that.html.isInvited = false;
        that.loader.hide();
      },
      function(responseError) {
        that.html.isInvited = false;
        that.loader.hide();
        console.log(responseError);
      }
    );
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listSectorType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.SectorType, true);
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.commonListsObservableService.listParentOrganization$().subscribe(list => {
      list = list ? list : [];
      this.html.commonLists.listParentOrganizations = list.map(item => {
        item['Name'] = item.DisplayText + ' - ' + item.Id;
        return item;
      });
    });

    this.authService.getCurrentProfile().subscribe(data => {
      this.html.functionalRoles = data.FunctionalRoles;
      this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
    });
  }

  recalcLocalProperties(organizationFormGroup: FormGroup<ITabDetailsDetail>) {
    const getCodeValueListTaxSubdivision = (countryId: number) => {
      if (countryId > 0) {
        return this.codeValueService.getRelatedCodeValues(this.commonService.CodeValueGroups.Subdivision, countryId, this.commonService.CodeValueGroups.Country).sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
      } else {
        return [];
      }
    };

    if (organizationFormGroup.value && organizationFormGroup.controls.CountryId.value > 0) {
      this.html.codeValueLists.listTaxSubdivision = getCodeValueListTaxSubdivision(organizationFormGroup.controls.CountryId.value);
    }

    if (organizationFormGroup.value && organizationFormGroup.controls.SectorTypeId.value > 0) {
      this.html.codeValueLists.listIndustryType = this.codeValueService.getRelatedCodeValues(this.commonService.CodeValueGroups.IndustryType, organizationFormGroup.controls.SectorTypeId.value, this.commonService.CodeValueGroups.SectorType);
    }
  }

  private canSendInvite() {
    this.html.isSendInviteVisible =
      filter(this.html.functionalRoles, function(item) {
        return item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator;
      }).length > 0;
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.canSendInvite();
  }

  onClickSwitchParentOrganizationNameFromList() {
    this.html.parentOrganizationNameFromText = !this.html.parentOrganizationNameFromText;

    const orgName = this.html.commonLists.listParentOrganizations.find(x => x.Id === this.inputFormGroup.controls.ParentOrganization.value.Id);

    const value = {
      isFromParentOrgList: this.html.parentOrganizationNameFromText,
      parentOrganizationName: this.html.isParentOrgFirstTime ? (orgName ? orgName.DisplayText : null) : null,
      ParentOrganizationId: null,
      ParentOrganization: {
        Id: null,
        Name: null
      }
    };

    if (this.html.isParentOrgFirstTime) {
      this.html.isParentOrgFirstTime = false;
    }

    this.patchValue(this.inputFormGroup, value);
  }

  static oldLegalName = null;
  static oldCode = null;
  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organizationDetails: ITabDetailsDetail, organizationObservableService: OrganizationObservableService): FormGroup<ITabDetailsDetail> {
    return formGroupSetup.hashModel.getFormGroup<ITabDetailsDetail>(formGroupSetup.toUseHashCode, 'ITabDetailsDetail', organizationDetails, 0, () =>
      formGroupSetup.formBuilder.group<ITabDetailsDetail>({
        OrganizationId: [organizationDetails.OrganizationId],
        isFromParentOrgList: [organizationDetails.isFromParentOrgList],
        LegalName: [
          organizationDetails.LegalName,
          [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('LegalName', CustomFieldErrorType.required)), ValidationExtensions.minLength(3), ValidationExtensions.maxLength(128)]
          // formBuilderGroupSetupValidationOnIsUniqueLegalName.bind(this)
        ],
        Code: [
          organizationDetails.Code,
          [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Code', CustomFieldErrorType.required)), ValidationExtensions.minLength(3), ValidationExtensions.maxLength(6)] // formBuilderGroupSetupValidationOnIsUniqueCode.bind(this)
        ],
        DisplayName: [
          organizationDetails.DisplayName,
          [ValidationExtensions.minLength(3), ValidationExtensions.maxLength(128), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DisplayName', CustomFieldErrorType.required))]
        ],
        SectorTypeId: [organizationDetails.SectorTypeId],
        IndustryTypeId: [organizationDetails.IndustryTypeId],
        CountryId: [organizationDetails.CountryId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CountryId', CustomFieldErrorType.required))]],
        DefaultTaxSubdivisionId: [organizationDetails.DefaultTaxSubdivisionId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DefaultTaxSubdivisionId', CustomFieldErrorType.required))]],
        ParentOrganizationId: [organizationDetails.ParentOrganizationId],
        ParentOrganization: formGroupSetup.formBuilder.group<IParentOrganization>({
          Id: [
            organizationDetails.ParentOrganization ? organizationDetails.ParentOrganization.Id : null,
            organizationDetails.isFromParentOrgList ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Id', CustomFieldErrorType.required))] : []
          ],
          Name: [
            organizationDetails.ParentOrganization ? organizationDetails.ParentOrganization.Name : null,
            [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Name', CustomFieldErrorType.required)),
              ValidationExtensions.maxLength(128, formGroupSetup.customFieldService.formatErrorMessage('Name', CustomFieldErrorType.required))
            ]
          ]
        }),
        parentOrganizationName: [organizationDetails.parentOrganizationName ? organizationDetails.parentOrganizationName : null]
      })
    );
  }

  public static formGroupToPartial(formGroupTabDetail: FormGroup<ITabDetailsDetail>): Partial<IOrganization> {
    const formGroupDetails: FormGroup<ITabDetailsDetail> = formGroupTabDetail;
    const organizationDetails: ITabDetailsDetail = formGroupDetails.value;
    return {
      LegalName: organizationDetails.LegalName,
      Code: organizationDetails.Code,
      DisplayName: organizationDetails.DisplayName,
      SectorTypeId: organizationDetails.SectorTypeId,
      IndustryTypeId: organizationDetails.IndustryTypeId,
      CountryId: organizationDetails.CountryId,
      DefaultTaxSubdivisionId: organizationDetails.DefaultTaxSubdivisionId,
      ParentOrganizationId: organizationDetails.ParentOrganizationId ? organizationDetails.ParentOrganizationId : null,
      ParentOrganization: organizationDetails.ParentOrganization !== null && organizationDetails.ParentOrganization.Id === null && organizationDetails.ParentOrganization.Name === null ? null : organizationDetails.ParentOrganization,
      parentOrganizationName: organizationDetails.parentOrganizationName ? organizationDetails.parentOrganizationName : null
    };
  }
}
