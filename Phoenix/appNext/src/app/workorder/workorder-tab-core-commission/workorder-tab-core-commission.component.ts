// angular
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { PhxConstants, ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { FormGroup, FormArray, FormControl } from '../../common/ngx-strongly-typed-forms/model';
// work order
import { ITabCoreDetails, IWorkOrder, IFormGroupSetup, ITabCoreCommissions, IJobOwner, ICommissionRate, IWorkOrderVersionCommission } from './../state/workorder.interface';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkOrderBaseComponentPresentational } from './../workorder-base-component-presentational';
import { WorkorderService } from './../workorder.service';
import { map, filter, cloneDeep, find, forEach, includes } from 'lodash';
import { HashModel } from '../../common/utility/hash-model';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

@Component({
  selector: 'app-workorder-tab-core-commission',
  templateUrl: './workorder-tab-core-commission.component.html',
  styleUrls: ['./workorder-tab-core-commission.component.less']
})
export class WorkorderTabCoreCommissionComponent extends WorkOrderBaseComponentPresentational<ITabCoreCommissions> implements OnInit {
  workOrder: IWorkOrder;
  formGroupSetup: IFormGroupSetup;
  tabCoreDetailFormGroup: FormGroup<ITabCoreDetails>;
  SupportingJobOwners: FormArray<IJobOwner>;
  html: {
    lists: {
      salesPatterns: Array<{
        Id: number;
        Description: string;
      }>;
      JobOwners: Array<any>;
      UserProfileCommissions: Array<any>;
      JobOwnersWithSupport: Array<any>;
      JobOwnersNoSupport: Array<any>;
      SupportJobOwners: Array<any>;
      Recruiters: Array<any>;
    };
  } = {
      lists: {
        salesPatterns: [],
        JobOwners: [],
        UserProfileCommissions: [],
        JobOwnersWithSupport: [],
        SupportJobOwners: [],
        JobOwnersNoSupport: [],
        Recruiters: []
      }
    };
  InternalOrganizationDefinition1Id: number;
  OrganizationIdInternal: number;
  LineOfBusinessId: number;

  constructor(private workorderService: WorkorderService, private workorderObservableService: WorkorderObservableService) {
    super('WorkorderTabCoreCommissionComponent');
  }

  ngOnInit() {
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.workorderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          this.workOrder = workorder;
          const parentFormGroup: any = this.getRootFormGroup(this.inputFormGroup);
          this.tabCoreDetailFormGroup = parentFormGroup.get('TabCore').controls.Details as FormGroup<ITabCoreDetails>;
          Observable.merge(
            this.tabCoreDetailFormGroup
              .get('InternalOrganizationDefinition1Id')
              .valueChanges.debounceTime(100)
              .map(a => {
                return { controlName: 'InternalOrganizationDefinition1Id', value: a };
              }),
            this.tabCoreDetailFormGroup
              .get('OrganizationIdInternal')
              .valueChanges.debounceTime(100)
              .map(a => {
                return { controlName: 'OrganizationIdInternal', value: a };
              }),
            this.tabCoreDetailFormGroup
              .get('LineOfBusinessId')
              .valueChanges.debounceTime(100)
              .map(a => {
                return { controlName: 'LineOfBusinessId', value: a };
              })
          )
            .takeUntil(this.isDestroyed$)
            .subscribe(response => {
              console.log('changing');
              if (response.controlName === 'LineOfBusinessId' && this.LineOfBusinessId !== response.value) {
                this.LineOfBusinessId = this.workOrder.WorkOrderVersion.LineOfBusinessId = response.value;
                this.onChangeCurrentWorkOrderVersionLineOfBusinessId();
              } else if (response.controlName === 'OrganizationIdInternal' && this.OrganizationIdInternal !== response.value) {
                this.OrganizationIdInternal = response.value;
                this.getCommissionRates();
              } else if (response.controlName === 'InternalOrganizationDefinition1Id' && this.InternalOrganizationDefinition1Id !== response.value) {
                this.InternalOrganizationDefinition1Id = response.value;
                this.getCommissionRates();
              }
            });
            this.getListSalesPatten();
            this.getUserProfileCommissionsList();
            const recruiterVal = this.inputFormGroup.get('Recruiters').value;
            if(recruiterVal.length == 0
                  && (this.workOrder.WorkOrderVersion.LineOfBusinessId === this.phxConstants.LineOfBusiness.R)){
              this.addRecruiter();
            }
           
        }
      });
  }

  checkPtFiledAccessibility(modelPrefix, fieldName) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName);
  }

  onChangeJobOwnerUsesSupport() {
    if (!this.inputFormGroup.get('JobOwnerUsesSupport').value) {
      if (
        this.inputFormGroup.get('JobOwner').value &&
        this.inputFormGroup.get('JobOwner').value.UserProfileIdSales &&
        !this.html.lists.JobOwnersNoSupport.some(obj => {
          return obj.Id === this.inputFormGroup.get('JobOwner').value.UserProfileIdSales;
        })
      ) {
        const formGroup = this.inputFormGroup.get('JobOwner') as FormGroup<IJobOwner>;
        formGroup.get('UserProfileIdSales').patchValue(null);
      }
      this.inputFormGroup.setControl('SupportingJobOwners', WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(this.formGroupSetup, []));
      this.html.lists.JobOwners = this.html.lists.JobOwnersNoSupport;
    } else {
      if (
        this.inputFormGroup.get('JobOwner').value &&
        this.inputFormGroup.get('JobOwner').value.UserProfileIdSales &&
        !this.html.lists.JobOwnersWithSupport.some(obj => {
          return obj.Id === this.inputFormGroup.get('JobOwner').value.UserProfileIdSales;
        })
      ) {
        const formGroup = this.inputFormGroup.get('JobOwner') as FormGroup<IJobOwner>;
        formGroup.get('UserProfileIdSales').setValue(null);
      }
      this.html.lists.JobOwners = this.html.lists.JobOwnersWithSupport;
      if (!this.inputFormGroup.get('SalesPatternId').value && this.inputFormGroup.get('JobOwnerUsesSupport').value) {
        this.addSupportingJobOwner();
      }
    }
    this.getCommissionRates();
  }

  onChangeCurrentWorkOrderVersionLineOfBusinessId() {
    if (this.tabCoreDetailFormGroup.get('LineOfBusinessId').value !== PhxConstants.LineOfBusiness.R) {
      this.inputFormGroup.setControl('Recruiters', WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(this.formGroupSetup, []));
    }
    this.getCommissionRates();
  }

  getListSalesPatten() {
    const salesPatternDataParams = oreq
      .request()
      .withSelect(['Id', 'Description', 'SalesPatternStatusId'])
      .url();
    this.workorderService.getSalesPatterns(salesPatternDataParams).subscribe((result: any) => {
      this.html.lists.salesPatterns = result.Items.filter((item) => 
        item.SalesPatternStatusId === PhxConstants.CommissionRateHeaderStatus.Active 
        || (this.inputFormGroup.controls.SalesPatternId.value == item.Id) )
    });
  }

  getUserProfileCommissionsList() {
    const filterResult = oreq.filter('UserProfileCommissions').any(oreq.filter('x/CommissionRoleId').gt(0));
    const commissionDataParams = oreq
      .request()
      .withExpand(['UserProfileCommissions', 'Contact'])
      .withSelect(['Id', 'ProfileStatusId', 'Contact/FullName', 'UserProfileCommissions/CommissionRoleId', 'UserProfileCommissions/CommissionRateHeaderStatusId'])
      .withFilter(filterResult)
      .url();
    this.workorderService
      .getListUserProfileInternal(commissionDataParams)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.html.lists.UserProfileCommissions = response.Items;
        const filterByCommissionRole = (role: any) => {
          return response.Items.filter(res => res.UserProfileCommissions.some(obj => obj.CommissionRoleId === role));
        };
        this.html.lists.JobOwnersWithSupport = filterByCommissionRole(PhxConstants.CommissionRole.JobOwnerRoleWithSupport);
        this.html.lists.JobOwnersNoSupport = filterByCommissionRole(PhxConstants.CommissionRole.JobOwnerRoleNoSupport);
        this.html.lists.SupportJobOwners = filterByCommissionRole(PhxConstants.CommissionRole.SupportingJobOwner);
        this.html.lists.Recruiters = filterByCommissionRole(PhxConstants.CommissionRole.RecruiterRole);
        if (this.workOrder.WorkOrderVersion.JobOwnerUsesSupport == null) {
          this.html.lists.JobOwners = [];
        } else {
          this.html.lists.JobOwners = this.workOrder.WorkOrderVersion.JobOwnerUsesSupport ? this.html.lists.JobOwnersWithSupport : this.html.lists.JobOwnersNoSupport;
        }
        if (this.workOrder.WorkOrderVersion.IsDraftStatus) {
          this.getCommissionRates();
        }
      });
  }

  addSupportingJobOwner() {
    this.addNewControl('SupportingJobOwners');
  }

  addRecruiter() {
    this.addNewControl('Recruiters');
  }

  addNewControl(controlName) {
    const control: FormArray<Partial<IJobOwner>> = this.inputFormGroup.get(controlName) as FormArray<Partial<IJobOwner>>;
    control.push(
      this.formGroupSetup.formBuilder.group<Partial<IJobOwner>>({
        UserProfileIdSales: [null, [ValidationExtensions.required(this.formGroupSetup.customFieldService.formatErrorMessage('UserProfileIdSales', CustomFieldErrorType.required))]]
      })
    );
  }

  removeSupportingJobOwner(i: number) {
    this.removeControl(i, 'SupportingJobOwners');
  }

  removeRecruiter(i: number) {
    this.removeControl(i, 'Recruiters');
  }

  removeControl(index, controlName) {
    const control = this.inputFormGroup.get(controlName) as FormArray<IJobOwner>;
    control.removeAt(index);
    this.getCommissionRates();
  }

  onChangeSalesPattern() {
    if (!this.inputFormGroup.controls.SalesPatternId.value) {
      this.inputFormGroup.get('JobOwnerUsesSupport').setValue(null);
      if (this.inputFormGroup.controls.JobOwner.value) {
        const jobOwner = this.inputFormGroup.get('JobOwner') as FormGroup<IJobOwner>;
        jobOwner.get('UserProfileIdSales').setValue(null);
        this.onChangeJobOwnerUsesSupport();
      }
      this.inputFormGroup.setControl('SupportingJobOwners', WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(this.formGroupSetup, []));
    } else {
      this.inputFormGroup.get('JobOwnerUsesSupport').setValidators(null);
      const filterResult = oreq.filter('Id').eq(this.inputFormGroup.controls.SalesPatternId.value);
      const oDataParams = oreq
        .request()
        .withExpand(['CommissionSalesPatternSupporters'])
        .withSelect(['CommissionSalesPatternSupporters/UserProfileId', 'CommissionSalesPatternSupporters/CommissionRoleId', 'CommissionSalesPatternSupporters/FullName'])
        .withFilter(filterResult)
        .url();
      this.workorderService
        .getSalesPatterns(oDataParams)
        .takeUntil(this.isDestroyed$)
        .subscribe((response: any) => {
          if (response.Items && response.Items.length > 0) {
            const resp = response.Items[0];
              const jobOwner = resp.CommissionSalesPatternSupporters
              .map(obj => {
                return { UserProfileIdSales: obj.UserProfileId, CommissionRoleId: obj.CommissionRoleId, FullName: obj.FullName };
              })
              .find(obj => {
                return obj.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleWithSupport || obj.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleNoSupport;
              });

              const supportingJobOwners = resp.CommissionSalesPatternSupporters
              .map(obj => {
                return { UserProfileIdSales: obj.UserProfileId, CommissionRoleId: obj.CommissionRoleId, FullName: obj.FullName };
              })
              .filter(obj => {
                return obj.CommissionRoleId === PhxConstants.CommissionRole.SupportingJobOwner;
              });

            const jobOwnerUsesSupport = jobOwner ? jobOwner.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleWithSupport || supportingJobOwners.length > 0 : null;
            this.inputFormGroup.setControl('JobOwner', WorkorderTabCoreCommissionComponent.createJobOwnerFormGroup(this.formGroupSetup, jobOwner));
            this.inputFormGroup.setControl('SupportingJobOwners', WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(this.formGroupSetup, supportingJobOwners));
            this.inputFormGroup.get('JobOwnerUsesSupport').setValue(jobOwnerUsesSupport);

            this.getCommissionRates();
          }
        });
    }
  }

  getCommissionRates() {
    if (PhxConstants.ProductionHideFunctionality) {
      return;
    }
    const jobOwner = this.inputFormGroup.controls.JobOwner.value.UserProfileIdSales ?  cloneDeep(this.inputFormGroup.controls.JobOwner.value) : null;
    const supportOwners = filter(map(cloneDeep(this.inputFormGroup.controls.SupportingJobOwners.value), 'UserProfileIdSales'), o => {
      return o;
    });
    const recruiters = filter(map(cloneDeep(this.inputFormGroup.controls.Recruiters.value), 'UserProfileIdSales'), o => {
      return o;
    });
    if (this.canViewCommissionRates()) {
      const data: any = { ...this.workOrder.WorkOrderVersion.BillingInfoes };
      const command = {
        WorkflowPendingTaskId: -1,
        UserProfileIdJobOwner: jobOwner ? jobOwner.UserProfileIdSales : null,
        UserProfileIdSupportingJobOwners: supportOwners,
        UserProfileIdRecruiters: recruiters,
        JobOwnerUsesSupport: this.inputFormGroup.get('JobOwnerUsesSupport').value,
        OrganizationIdInternal: this.tabCoreDetailFormGroup.get('OrganizationIdInternal').value,
        OrganizationIdClient: data[0].OrganizationIdClient,
        BranchId: this.tabCoreDetailFormGroup.get('InternalOrganizationDefinition1Id').value,
        LineOfBusinessId: this.tabCoreDetailFormGroup.get('LineOfBusinessId').value
      };
      this.workorderService.workOrderVersionCommissionPicker(command);
      setTimeout(() => this.getWorkorderSummary());
    } else {
      const summaries = cloneDeep(this.workOrder.WorkOrderVersion.WorkOrderVersionCommissions);

      const findExistingSummary = (UserProfileId, CommissionRoleId, obj) => {
        return UserProfileId === obj.UserProfileIdSales && CommissionRoleId === obj.CommissionRoleId;
      };
      const findProfile = (id, obj) => {
        return obj.Id === id;
      };

      const newList = [];
      if (jobOwner) {
        const existingSummary = find(summaries, findExistingSummary.bind(null, jobOwner.UserProfileIdSales, jobOwner.CommissionRoleId)) || {};
        const newSummary: any = Object.assign({}, existingSummary, {
          UserProfileIdSales: jobOwner.UserProfileIdSales,
          IsApplicable: true,
          CommissionRates: [],
          CommissionRateHeaderId: null,
          CommissionRoleId: supportOwners.length > 0 ? PhxConstants.CommissionRole.JobOwnerRoleWithSupport : PhxConstants.CommissionRole.JobOwnerRoleNoSupport
        });
        const contact: any = find(this.html.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales));
        if (contact && contact.Contact && contact.Contact.FullName) {
          newSummary.FullName = contact.Contact.FullName;
        } else {
          newSummary.FullName = '';
        }
        newList.push(newSummary);
      }

      forEach(supportOwners, s => {
        const existingSummary = find(summaries, findExistingSummary.bind(null, s, PhxConstants.CommissionRole.SupportingJobOwner)) || { CommissionRoleId: PhxConstants.CommissionRole.SupportingJobOwner };
        const newSummary: any = Object.assign({}, existingSummary, {
          UserProfileIdSales: s,
          IsApplicable: true,
          CommissionRates: [],
          CommissionRateHeaderId: null
        });
        const contact: any = find(this.html.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales));
        if (contact && contact.Contact && contact.Contact.FullName) {
          newSummary.FullName = contact.Contact.FullName;
        } else {
          newSummary.FullName = '';
        }
        newList.push(newSummary);
      });

      forEach(recruiters, r => {
        const existingSummary = find(summaries, findExistingSummary.bind(null, r, PhxConstants.CommissionRole.RecruiterRole)) || { CommissionRoleId: PhxConstants.CommissionRole.RecruiterRole };
        const newSummary: any = Object.assign({}, existingSummary, {
          UserProfileIdSales: r,
          IsApplicable: true,
          CommissionRates: [],
          CommissionRateHeaderId: null
        });
        const contact: any = find(this.html.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales));
        if (contact && contact.Contact && contact.Contact.FullName) {
          newSummary.FullName = contact.Contact.FullName;
        } else {
          newSummary.FullName = '';
        }
        newList.push(newSummary);
      });
      this.workOrder.WorkOrderVersion.WorkOrderVersionCommissions = newList;
      const controlArray = WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(this.formGroupSetup, newList, true);
      this.inputFormGroup.setControl('WorkOrderVersionCommissions', controlArray);
    }
  }

  getWorkorderSummary() {
    this.workorderService.getWorkorderSummary().then((response: any) => {
      const summaries = response.CommissionSummaries;
      const filterByCommissionRole = role => {
        return summaries.filter(obj => obj.CommissionRoleId === role);
      };
      const jobOwner = summaries.filter(obj => {
        return obj.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleNoSupport || obj.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleWithSupport;
      });
      const support = filterByCommissionRole(PhxConstants.CommissionRole.SupportingJobOwner);
      const recruiters = filterByCommissionRole(PhxConstants.CommissionRole.RecruiterRole);
      const nationalAccounts = filterByCommissionRole(PhxConstants.CommissionRole.NationalAccountsRole);
      const branchManagers = filterByCommissionRole(PhxConstants.CommissionRole.BranchManagerRole);
      const summariesList = cloneDeep(this.workOrder.WorkOrderVersion.WorkOrderVersionCommissions);

      const findExistingSummary = (UserProfileId, CommissionRoleId, obj) => {
        return UserProfileId === obj.UserProfileIdSales && CommissionRoleId === obj.CommissionRoleId;
      };
      const extractCommissionRateHeaderId = obj => {
        return obj.CommissionRateHeaderId;
      };
      const findProfile = (id, obj) => {
        return obj.Id === id;
      };
      const filterInactives = (id, obj) => {
        return obj.CommissionRateHeaderStatusId === PhxConstants.CommissionRateHeaderStatus.Active || obj.CommissionRateHeaderId === id;
      };

      const getNewSummary = inputLst => {
        const list = [];
        forEach(inputLst, o => {
          const existingSummary: any = find(summariesList, findExistingSummary.bind(null, o.UserProfileId, o.CommissionRoleId)) || {};
          const newSummary = Object.assign({}, existingSummary, {
            UserProfileIdSales: o.UserProfileId,
            IsApplicable: o.IsApplicable,
            CommissionRoleId: o.CommissionRoleId,
            CommissionRates: o.CommissionRates,
            CommissionRateHeaderId: o.CommissionRates && o.CommissionRates.length === 1 ? o.CommissionRates[0].CommissionRateHeaderId : null
          });
          if (
            newSummary.CommissionRateHeaderId === null &&
            existingSummary.CommissionRateHeaderId !== null &&
            existingSummary.CommissionRateHeaderId > 0 &&
            includes(map(newSummary.CommissionRates, extractCommissionRateHeaderId), existingSummary.CommissionRateHeaderId)
          ) {
            newSummary.CommissionRateHeaderId = existingSummary.CommissionRateHeaderId;
          }
          newSummary.CommissionRates = filter(newSummary.CommissionRates, filterInactives.bind(null, newSummary.CommissionRateHeaderId));
          const contact: any = find(this.html.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales));
          if (contact && contact.Contact && contact.Contact.FullName) {
            newSummary.FullName = contact.Contact.FullName;
          } else {
            newSummary.FullName = '';
          }
          list.push(newSummary);
        });
        return list;
      };
      const newList = [];
      newList.push(...getNewSummary(jobOwner));
      newList.push(...getNewSummary(support));
      newList.push(...getNewSummary(recruiters));
      newList.push(...getNewSummary(nationalAccounts));
      newList.push(...getNewSummary(branchManagers));
      this.workOrder.WorkOrderVersion.WorkOrderVersionCommissions = newList;
      const controlArray = WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(this.formGroupSetup, newList, true);
      this.inputFormGroup.setControl('WorkOrderVersionCommissions', controlArray);
    });
  }

  canViewCommissionRates() {
    return this.tabCoreDetailFormGroup &&  (
      this.tabCoreDetailFormGroup.get('InternalOrganizationDefinition1Id').value !== null &&
      this.tabCoreDetailFormGroup.get('InternalOrganizationDefinition1Id').value > 0 &&
      this.tabCoreDetailFormGroup.get('LineOfBusinessId').value !== null &&
      this.tabCoreDetailFormGroup.get('LineOfBusinessId').value > 0 &&
      this.tabCoreDetailFormGroup.get('OrganizationIdInternal').value !== null &&
      this.tabCoreDetailFormGroup.get('OrganizationIdInternal').value > 0 &&
      this.workOrder.WorkOrderVersion.BillingInfoes !== null &&
      this.workOrder.WorkOrderVersion.BillingInfoes.length > 0 &&
      this.workOrder.WorkOrderVersion.BillingInfoes[0].OrganizationIdClient !== null &&
      this.workOrder.WorkOrderVersion.BillingInfoes[0].OrganizationIdClient > 0
    );
  }

  onChangeCommissionRateHeaderId() {
    this.outputEvent.emit();
  }

  businessRules(obj?: any) {
    if (obj.name === 'SalesPatternId') {
      this.onChangeSalesPattern();
    } else if (obj.name === 'JobOwnerUsesSupport') {
      this.onChangeJobOwnerUsesSupport();
    } else if (obj.name === 'JobOwner' || obj.name === 'SupportingJobOwners' || obj.name === 'Recruiters') {
      this.getCommissionRates();
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<ITabCoreCommissions> {
    const commission: ITabCoreCommissions = {
      SalesPatternId: workorder.WorkOrderVersion.SalesPatternId,
      JobOwnerUsesSupport: workorder.WorkOrderVersion.JobOwnerUsesSupport,
      JobOwner: workorder.WorkOrderVersion.JobOwner,
      SupportingJobOwners: workorder.WorkOrderVersion.SupportingJobOwners,
      Recruiters: workorder.WorkOrderVersion.Recruiters,
      WorkOrderVersionCommissions: workorder.WorkOrderVersion.WorkOrderVersionCommissions
    };
    const formGroup: FormGroup<ITabCoreCommissions> = formGroupSetup.formBuilder.group<ITabCoreCommissions>({
      SalesPatternId: [commission.SalesPatternId],
      JobOwnerUsesSupport: [commission.JobOwnerUsesSupport,
        !commission.SalesPatternId ?
          PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'JobOwnerUsesSupport', null,
          [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('JobOwnerUsesSupport', CustomFieldErrorType.required))]
          )
        : null],
      JobOwner: WorkorderTabCoreCommissionComponent.createJobOwnerFormGroup(formGroupSetup, commission.JobOwner, false, 'WorkOrderVersion.JobOwner'),
      SupportingJobOwners: WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(formGroupSetup, commission.SupportingJobOwners, false, 'WorkOrderVersion.SupportingJobOwners'),
      Recruiters: WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(formGroupSetup, commission.Recruiters, false, 'WorkOrderVersion.Recruiters', false),
      WorkOrderVersionCommissions: WorkorderTabCoreCommissionComponent.createArrayOfJobOwners(formGroupSetup, commission.WorkOrderVersionCommissions, true, 'WorkOrderVersion.WorkOrderVersionCommissions')
    });
    return formGroup;
  }

  public static createArrayOfJobOwners(formGroupSetup: IFormGroupSetup, jobOwners: Array<Partial<IJobOwner>>, isCommissionRateHeaderValidation: boolean = false, modelPrefix?: string, requireNonEmpty: boolean = false): FormArray<IJobOwner> {
    const arr = (jobOwners && jobOwners.length) || !requireNonEmpty ? jobOwners : new Array<Partial<IJobOwner>>({});
    return formGroupSetup.formBuilder.array<IJobOwner>(
    arr.map((support: any, index) =>
        formGroupSetup.hashModel.getFormGroup<IJobOwner>(formGroupSetup.toUseHashCode, 'JobOwner', support, index, () => WorkorderTabCoreCommissionComponent.createJobOwnerFormGroup(formGroupSetup, support, isCommissionRateHeaderValidation, modelPrefix))
      ));
  }

  public static createJobOwnerFormGroup(formGroupSetup: IFormGroupSetup, jobOwner: Partial<IJobOwner> = {}, isCommissionRateHeaderValidation: boolean = false, modelPrefix?: string): FormGroup<IJobOwner> {
    const formGroup = formGroupSetup.formBuilder.group<IJobOwner>({
      Id: [jobOwner.Id ? jobOwner.Id : 0],
      UserProfileIdSales: [
        jobOwner.UserProfileIdSales,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator(modelPrefix, 'UserProfileIdSales', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileIdSales', CustomFieldErrorType.required))]
          )
      ],
      CommissionRoleId: [jobOwner.CommissionRoleId],
      IsApplicable: [jobOwner.IsApplicable],
      CommissionRateHeaderId: [
        jobOwner.CommissionRateHeaderId,
        isCommissionRateHeaderValidation ?
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator(modelPrefix, 'UserProfileIdSales', null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileIdSales', CustomFieldErrorType.required))]
          ) : null
      ],
      FullName: [jobOwner.FullName],
      Description: [jobOwner.Description],
      CommissionRates: WorkorderTabCoreCommissionComponent.createCommissionRates(formGroupSetup, <Array<Partial<ICommissionRate>>>jobOwner.CommissionRates, jobOwner.CommissionRateHeaderId)
    });
    return formGroup;
  }

  public static createCommissionRates(formGroupSetup: IFormGroupSetup, rates: Array<Partial<ICommissionRate>> = [], commissionRateHeaderId?: number): FormArray<ICommissionRate> {
    if (rates.length === 1) {
       rates[0]['CommissionRateHeaderId'] = commissionRateHeaderId;
    }
    return formGroupSetup.formBuilder.array<ICommissionRate>(
      rates.map((rate: ICommissionRate, index) =>
        formGroupSetup.hashModel.getFormGroup<ICommissionRate>(formGroupSetup.toUseHashCode, 'CommissionRate', rate, index, () => {
          const formGroup = formGroupSetup.formBuilder.group<Partial<ICommissionRate>>({
          });
          forEach(Object.keys(rate), (key: any) => formGroup.addControl(key, new FormControl(rate[key])));
          return formGroup;
        })
      )
    );
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabCommissionDetail: FormGroup<ITabCoreCommissions>): IWorkOrder {
    const formGroupCoreCollaborators: FormGroup<ITabCoreCommissions> = formGroupTabCommissionDetail;
    const commissionDetails: ITabCoreCommissions = formGroupCoreCollaborators.value;
    workOrder.WorkOrderVersion.WorkOrderVersionCommissions = <Array<IWorkOrderVersionCommission>>commissionDetails.WorkOrderVersionCommissions;
    workOrder.WorkOrderVersion.SalesPatternId = commissionDetails.SalesPatternId;
    workOrder.WorkOrderVersion.JobOwnerUsesSupport = commissionDetails.JobOwnerUsesSupport;
    workOrder.WorkOrderVersion.JobOwner = commissionDetails.JobOwner;
    workOrder.WorkOrderVersion.Recruiters = commissionDetails.Recruiters;
    workOrder.WorkOrderVersion.SupportingJobOwners = commissionDetails.SupportingJobOwners;
    return workOrder;
  }
}
