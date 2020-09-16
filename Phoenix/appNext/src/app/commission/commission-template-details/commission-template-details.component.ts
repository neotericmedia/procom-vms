import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommissionService } from './../commission.service';
import { CommissionTemplate, CommissionTemplateList, CommissionRateAddRestrictionConfig, CommissionRateRestrictionType, SelectedRestrictionList } from './../model/commission-template';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService, PhxConstants, ValidationExtensions } from '../../common';
import { NavigationService } from './../../common/services/navigation.service';
import { groupBy, map, filter } from 'lodash';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';

@Component({
  selector: 'commission-template-details',
  templateUrl: './commission-template-details.component.html',
  styleUrls: ['./commission-template-details.component.less']
})

export class CommmissionTemplateDetailsComponent implements OnInit, OnDestroy {
  isAlive: boolean = true;
  templateId: number;
  commissionTemplateForm: FormGroup;
  codeValueGroups: any;
  commissionTemplatesData: CommissionTemplate;
  commissionRateAddRestrictionConfig: CommissionRateAddRestrictionConfig = <CommissionRateAddRestrictionConfig>{};
  commissionTemplateList: CommissionTemplateList = <CommissionTemplateList>{};
  selectedRestrictionList: SelectedRestrictionList[] = [];
  title: string;
  percentageFilter: any = { from: 0, to: 100, decimalplaces: 4 };
  @ViewChild('restrictionsModel') restrictionsModel: PhxModalComponent;

  public reportDetailsModelButtons = null; // fix me
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commissionService: CommissionService,
    private fb: FormBuilder,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private navigationService: NavigationService
  ) {
    this.route.params.subscribe(params => {
      this.templateId = +params['id'];
    });
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.initForm();
    this.getCommissionTemplateDetails();
    this.getCommissionTemplateLists();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  getCommissionTemplateLists() {
    this.getScheduledChangeRateApplication();
    this.getCommissionRestrictionType();
    this.getBranch();
    this.getLineOfBusiness();
    this.getListOrganizationClient();
    this.getInternalOrganization();
    this.getListCommissionRole();
    this.getListCommissionRateType();
  }

  getCommissionRestrictionType() {
    this.commissionTemplateList.CommissionRateRestrictionType = this.codeValueService.getCodeValues(this.codeValueGroups.CommissionRateRestrictionType, true);
  }

  getListCommissionRateType() {
    this.commissionTemplateList.ListCommissionRateType = this.codeValueService.getCodeValues(this.codeValueGroups.CommissionRateType, true);
  }

  getListCommissionRole() {
    this.commissionTemplateList.ListCommissionRole = this.codeValueService.getCodeValues(this.codeValueGroups.CommissionRole, true);
  }

  getBranch() {
    this.commissionTemplateList.Branch = this.codeValueService.getCodeValues(this.codeValueGroups.InternalOrganizationDefinition1, true).map((value: CommissionRateRestrictionType) => {
      return {
        CommissionRateRestrictionTypeId: PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1,
        InternalOrganizationDefinition1Id: value.id,
        Name: value.text
      };
    });
  }

  getLineOfBusiness() {
    this.commissionTemplateList.LineOfBusiness = this.codeValueService.getCodeValues(this.codeValueGroups.LineOfBusiness, true).map((value: CommissionRateRestrictionType) => {
      return {
        CommissionRateRestrictionTypeId: PhxConstants.CommissionRateRestrictionType.LineOfBusiness,
        LineOfBusinessId: value.id,
        Name: value.text
      };
    });
  }

  getListOrganizationClient() {
    this.commissionService
      .getListOrganizationClient1()
      .takeWhile(() => this.isAlive)
      .subscribe((response: any) => {
        if (response.Items.length > 0) {
          this.commissionTemplateList.ClientOrganization = response.Items.map((value: any) => {
            return {
              CommissionRateRestrictionTypeId: PhxConstants.CommissionRateRestrictionType.ClientOrganization,
              OrganizationIdClient: value.Id,
              Name: value.DisplayName
            };
          });
        }
      });
  }

  getInternalOrganization() {
    this.commissionService
      .getListOrganizationInternal()
      .takeWhile(() => this.isAlive)
      .subscribe((response: any) => {
        if (response.length > 0) {
          this.commissionTemplateList.InternalOrganization = response.map((value: any) => {
            return {
              CommissionRateRestrictionTypeId: PhxConstants.CommissionRateRestrictionType.InternalOrganization,
              OrganizationIdInternal: value.Id,
              Name: value.DisplayName
            };
          });
        }
      });
  }

  getCommissionTemplateDetails() {
    this.commissionService
      .getCommissionTemplateById(this.templateId)
      .takeWhile(() => this.isAlive)
      .subscribe((response: CommissionTemplate) => {
        this.commissionTemplatesData = response;
        this.navigationService.setTitle('commission-rate-viewedit', [this.commissionTemplatesData.Name]);
        this.setFormValues();
      });
  }

  getScheduledChangeRateApplication() {
    this.commissionTemplateList.ScheduledChangeRateApplicationDetails = this.codeValueService
      .getCodeValues(this.codeValueGroups.ScheduledChangeRateApplication, true)
      .filter(a => a.id === PhxConstants.ScheduledChangeRateApplication.AllWorkOrders)
      .map((codeValue: CommissionRateRestrictionType) => {
        return {
          text: codeValue.code + ' - ' + codeValue.text,
          value: codeValue.id
        };
      });
  }

  initForm() {
    this.commissionTemplateForm = this.fb.group({
      CommissionRateHeaderStatusId: ['', [ValidationExtensions.required()]],
      CommissionRateRestrictions: [[]],
      CommissionRateTypeId: ['', [ValidationExtensions.required()]],
      CommissionRateVersions: this.fb.array([]),
      CommissionRoleId: ['', [ValidationExtensions.required()]],
      Description: ['', [ValidationExtensions.required()]],
      TemplateMetadatas: this.fb.array([])
    });
  }

  setFormValues() {
    this.commissionTemplateForm.get('CommissionRateHeaderStatusId').setValue(this.commissionTemplatesData.Entity.CommissionRateHeaderStatusId);
    this.commissionTemplateForm.get('CommissionRateTypeId').setValue(this.commissionTemplatesData.Entity.CommissionRateTypeId);
    this.commissionTemplateForm.get('CommissionRoleId').setValue(this.commissionTemplatesData.Entity.CommissionRoleId);
    this.commissionTemplateForm.get('Description').setValue(this.commissionTemplatesData.Entity.Description);
    const CommissionRateRestrictionsControl = this.commissionTemplateForm.get('CommissionRateRestrictions') as FormControl;
    CommissionRateRestrictionsControl.setValue(this.commissionTemplatesData.Entity.CommissionRateRestrictions);
    const CommissionRateVersionsControl = this.commissionTemplateForm.get('CommissionRateVersions') as FormArray;
    this.commissionTemplatesData.Entity.CommissionRateVersions.forEach(values => {
      CommissionRateVersionsControl.push(
        this.fb.group({
          CommissionRateVersionStatusId: [values.CommissionRateVersionStatusId, [ValidationExtensions.required()]],
          Percentage: [Number(values.Percentage).toFixed(this.percentageFilter.decimalplaces), [ValidationExtensions.required()]],
          ScheduledChangeRateApplicationId: [values.ScheduledChangeRateApplicationId, [ValidationExtensions.required()]]
        })
      );
    });
    const TemplateMetadatasControl = this.commissionTemplateForm.get('TemplateMetadatas') as FormArray;
    this.commissionTemplatesData.Entity.TemplateMetadatas.forEach(values => {
      TemplateMetadatasControl.push(
        this.fb.group({
          TemplateMetadataName: [values.TemplateMetadataName, [ValidationExtensions.required()]],
          TemplateMetadataValue: [values.TemplateMetadataValue, [ValidationExtensions.required()]]
        })
      );
    });
    this.changeSelectedRestriction();
  }

  openRestrictionsModel(code) {
    switch (code) {
      case 'InternalOrganization': {
        this.setCommissionRateAddRestrictionConfig('Dropdown', code, this.commissionTemplateList.InternalOrganization, 'Internal Company', 'OrganizationIdInternal');
        break;
      }
      case 'ClientOrganization': {
        this.setCommissionRateAddRestrictionConfig('Dropdown', code, this.commissionTemplateList.ClientOrganization, 'Client Company', 'OrganizationIdClient');
        break;
      }
      case 'LineOfBusiness': {
        this.setCommissionRateAddRestrictionConfig('Checkbox', code, this.commissionTemplateList.LineOfBusiness, 'Line Of Business', 'LineOfBusinessId');
        break;
      }
      case 'InternalOrganizationDefinition1': {
        this.setCommissionRateAddRestrictionConfig('Checkbox', code, this.commissionTemplateList.Branch, 'Branch', 'InternalOrganizationDefinition1Id');
        break;
      }
      default: {
        break;
      }
    }
    this.showModal();
  }

  setCommissionRateAddRestrictionConfig(viewType, code, restrictionList, title, valueField) {
    this.commissionRateAddRestrictionConfig = {
      ViewType: viewType,
      SelectedRestrictionTypeId: this.commissionTemplateList.CommissionRateRestrictionType.find(a => a.code === code).id,
      RestrictionList: restrictionList,
      ValueField: valueField
    };
    this.title = 'Add/Edit Restriction - ' + title;
  }

  showModal() {
    this.restrictionsModel.show();
  }

  hideModal() {
    this.restrictionsModel.hide();
  }

  updateTemplate() {
    const updateTemplateBody = {
      TemplateId: String(this.templateId),
      LastModifiedDatetime: this.commissionTemplatesData.LastModifiedDateTime,
      TemplateBody: this.commissionTemplateForm.value
    };
    this.commissionService.updateTemplate(updateTemplateBody).subscribe(() => {
      this.commonService.logSuccess('Commission Template Updated');
      this.initForm();
      this.getCommissionTemplateDetails();
      this.getCommissionTemplateLists();
    });
  }

  changeSelectedRestriction() {
    this.selectedRestrictionList = [];
    const dateGroupByRestrictionTypeId = groupBy(this.commissionTemplateForm.get('CommissionRateRestrictions').value, 'CommissionRateRestrictionTypeId');
    this.selectedRestrictionList = map(filter(dateGroupByRestrictionTypeId, val => val.length > 0), value => {
      const restrictionType = this.commissionTemplateList.CommissionRateRestrictionType.find(a => a.id === value[0].CommissionRateRestrictionTypeId);
      return {
        RestrictionTypeName: restrictionType.text,
        RestrictionTypeCode: restrictionType.code,
        SelectedRestrictions: value
      };
    });
  }

  shiftSelectedRestrictionToLast() {
    const selectedIndex = this.selectedRestrictionList.findIndex(
      a => a.RestrictionTypeCode === this.commissionTemplateList.CommissionRateRestrictionType.find(b => b.id === this.commissionRateAddRestrictionConfig.SelectedRestrictionTypeId).code
    );
    const updatedFormControlValue = this.commissionTemplateForm.get('CommissionRateRestrictions').value.filter(a => a.CommissionRateRestrictionTypeId === this.commissionRateAddRestrictionConfig.SelectedRestrictionTypeId);
    if (selectedIndex !== -1) {
      const data: SelectedRestrictionList[] = this.selectedRestrictionList.splice(selectedIndex, 1);
      data[0].SelectedRestrictions = updatedFormControlValue;
      if (updatedFormControlValue.length > 0) {
        this.selectedRestrictionList.push(data[0]);
      }
    } else {
      const restrictionType = this.commissionTemplateList.CommissionRateRestrictionType.find(a => a.id === this.commissionRateAddRestrictionConfig.SelectedRestrictionTypeId);
      if (updatedFormControlValue.length > 0) {
        this.selectedRestrictionList.push({
          RestrictionTypeName: restrictionType.text,
          RestrictionTypeCode: restrictionType.code,
          SelectedRestrictions: updatedFormControlValue
        });
      }
    }
  }

  onCancel() {
    this.router.navigate(['next/commission/search-templates']);
  }

  onCreate(event: any) {
    this.hideModal();
    this.commissionTemplateForm.get('CommissionRateRestrictions').patchValue(event);
    this.shiftSelectedRestrictionToLast();
  }
}
