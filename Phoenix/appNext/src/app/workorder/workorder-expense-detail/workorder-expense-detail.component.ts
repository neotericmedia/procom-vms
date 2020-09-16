import { Component, Input, AfterContentInit, OnInit } from '@angular/core';
import { IFormGroupSetup, ITabExpenseInvoiceDetail, IWorkOrder, IExpenseApprover, IFormGroupOnNew, ISupplierOrganization, IClientOrganization, IReadOnlyStorage } from '../state/workorder.interface';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { ValidationExtensions, PhxConstants } from '../../common';
import { CustomFieldErrorType, CodeValue } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { WorkorderService } from '../workorder.service';
import { PtFieldViewCustomValidator } from '../ptFieldCustomValidator';

interface IHtml {
  codeValueLists: {
    listExpenseMethodologies: Array<CodeValue>;
    listExpenseApprovalFlows: Array<CodeValue>;
  };
  expenseCard: {
    expenseApproval: boolean;
    projectsAndCoding: boolean;
    configurationAndDescriptors: boolean;
    thirdPartyWorkerID: boolean;
    requiresOriginal: boolean;
    expenseDescription: boolean;
  };
  commonLists: {
    listProfilesForClientApproval: Array<any>;
    listProfilesForInternalApproval: Array<any>;
    listProfilesForSupplierApproval: Array<any>;
  };
  phxConstants: any;
}

@Component({
  selector: 'app-workorder-expense-detail',
  templateUrl: './workorder-expense-detail.component.html',
  styleUrls: ['./workorder-expense-detail.component.less']
})
export class WorkorderExpenseDetailComponent extends WorkOrderBaseComponentPresentational<ITabExpenseInvoiceDetail> implements OnInit, AfterContentInit {
  html: IHtml = {
    codeValueLists: {
      listExpenseMethodologies: [],
      listExpenseApprovalFlows: []
    },
    expenseCard: {
      expenseApproval: false,
      projectsAndCoding: false,
      configurationAndDescriptors: false,
      thirdPartyWorkerID: false,
      requiresOriginal: false,
      expenseDescription: false
    },
    phxConstants: {},
    commonLists: {
      listProfilesForClientApproval: [],
      listProfilesForInternalApproval: [],
      listProfilesForSupplierApproval: []
    }
  };

  constructor(private workorderService: WorkorderService) {
    super('WorkorderExpenseDetailComponent');
    this.getCodeValuelistsStatic();
  }

  businessRules(obj: IFormGroupValue) {}

  ngOnInit() {
    this.getApprovalLists();
  }

  checkPtFiledAccessibility(modelPrefix, fieldName, modelValidation = null) {
    return this.CheckPtFiledAccessibility(modelPrefix, fieldName, modelValidation);
  }

  getCodeValuelistsStatic() {
    this.html.phxConstants = PhxConstants;
    this.html.codeValueLists.listExpenseMethodologies = this.codeValueService.getCodeValues(this.codeValueGroups.ExpenseMethodology, true);
    this.html.codeValueLists.listExpenseApprovalFlows = this.codeValueService.getCodeValues(this.codeValueGroups.TimeSheetApprovalFlow, true);
  }

  getApprovalLists() {
    if (this.inputFormGroup.controls.OrganizationIdInternal.value) {
      this.workorderService.getProfilesListOrganizationalByUserProfileType(this.inputFormGroup.controls.OrganizationIdInternal.value, PhxConstants.ApproverType.InternalApprover).subscribe((response: any) => {
        this.html.commonLists.listProfilesForInternalApproval = response.Items;
        this.html.commonLists.listProfilesForInternalApproval.forEach(element => {
          element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
        });
      });
    }

    const clientApprovers = <FormArray<IClientOrganization>>this.inputFormGroup.controls.OrganizationIdClients;
    clientApprovers.controls.forEach(c => {
      if (c instanceof FormGroup) {
        if (c.controls.OrganizationIdClient.value) {
          this.workorderService.getProfilesListOrganizationalByUserProfileType(c.controls.OrganizationIdClient.value, PhxConstants.ProfileType.Organizational).subscribe((response: any) => {
            this.html.commonLists.listProfilesForClientApproval = this.html.commonLists.listProfilesForClientApproval.concat(response.Items);
            this.html.commonLists.listProfilesForClientApproval.forEach(element => {
              element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
            });
          });
        }
      }
    });

    const clientSuppliers = <FormArray<ISupplierOrganization>>this.inputFormGroup.controls.OrganizationIdSuppliers;
    clientSuppliers.controls.forEach(c => {
      if (c instanceof FormGroup) {
        if (c.controls.OrganizationIdSupplier.value) {
          this.workorderService.getProfilesListOrganizationalByUserProfileType(c.controls.OrganizationIdSupplier.value, PhxConstants.ProfileType.Organizational).subscribe((response: any) => {
            this.html.commonLists.listProfilesForSupplierApproval = this.html.commonLists.listProfilesForSupplierApproval.concat(response.Items);
            this.html.commonLists.listProfilesForSupplierApproval.forEach(element => {
              element.DisplayValue = element.Contact.FullName + ' - ' + element.Contact.Id;
            });
          });
        }
      }
    });
  }

  ngAfterContentInit() {
    this.onChangeExpenseMethodology();
  }

  onChangeExpenseMethodology(e = null) {
    this.html.expenseCard.expenseApproval = this.inputFormGroup.controls.ExpenseMethodologyId.value && this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OnlineApproval;
    this.html.expenseCard.projectsAndCoding =
      this.inputFormGroup.controls.ExpenseMethodologyId.value &&
      (this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OnlineApproval || this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OfflineApproval);
    this.html.expenseCard.configurationAndDescriptors = this.inputFormGroup.controls.ExpenseMethodologyId.value && this.inputFormGroup.controls.ExpenseMethodologyId.value !== PhxConstants.ExpenseMethodology.NoExpense;
    this.html.expenseCard.thirdPartyWorkerID = this.inputFormGroup.controls.ExpenseMethodologyId.value && this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.ThirdPartyImport;
    this.html.expenseCard.requiresOriginal =
      this.inputFormGroup.controls.ExpenseMethodologyId.value &&
      (this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OnlineApproval || this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OfflineApproval);
    this.html.expenseCard.expenseDescription =
      this.inputFormGroup.controls.ExpenseMethodologyId.value &&
      (this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OnlineApproval || this.inputFormGroup.controls.ExpenseMethodologyId.value === PhxConstants.ExpenseMethodology.OfflineApproval);
  }

  onClickAddExpenseApproverDefinition() {
    const expenseApprovers = <FormGroup<any>>this.inputFormGroup.controls.ExpenseApprovers;
    const clientApprovers = <FormArray<IExpenseApprover>>expenseApprovers.controls.ClientApprover;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    clientApprovers.push(WorkorderExpenseDetailComponent.formBuilderGroupAddNewApprover(formGroupOnNew));
  }

  onClickRemoveExpenseApproverDefinition(index: number) {
    const expenseApprovers = <FormGroup<any>>this.inputFormGroup.controls.ExpenseApprovers;
    const clientApprovers = <FormArray<IExpenseApprover>>expenseApprovers.controls.ClientApprover;
    clientApprovers.removeAt(index);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, expenseDetail: ITabExpenseInvoiceDetail, validations: any): FormGroup<ITabExpenseInvoiceDetail> {
    const formGroup = formGroupSetup.formBuilder.group<ITabExpenseInvoiceDetail>({
      ExpenseMethodologyId: [
        expenseDetail.ExpenseMethodologyId,
        PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'ExpenseMethodologyId', null, [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ExpenseMethodologyId', CustomFieldErrorType.required))
        ])
      ],
      ExpenseApprovalFlowId: [
        expenseDetail.ExpenseApprovalFlowId,
        validations.isExpenseApprovalFlowId
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'ExpenseApprovalFlowId', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ExpenseApprovalFlowId', CustomFieldErrorType.required))
            ])
          : null
      ],
      ExpenseApprovers: WorkorderExpenseDetailComponent.formGroupExpenseApprovers(formGroupSetup, expenseDetail.ExpenseApprovers, validations.isExpenseApprovers),
      IsExpenseUsesProjects: [
        expenseDetail.IsExpenseUsesProjects,
        validations.isExpenseUsesProjects
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'IsExpenseUsesProjects', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsExpenseUsesProjects', CustomFieldErrorType.required))
            ])
          : null
      ],
      ExpenseThirdPartyWorkerReference: [
        expenseDetail.ExpenseThirdPartyWorkerReference,
        validations.isExpenseThirdPartyWorkerReference
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'ExpenseThirdPartyWorkerReference', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ExpenseThirdPartyWorkerReference', CustomFieldErrorType.required))
            ])
          : null
      ],
      IsExpenseRequiresOriginal: [
        expenseDetail.IsExpenseRequiresOriginal,
        validations.isIsExpenseRequiresOriginal
          ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion', 'IsExpenseRequiresOriginal', null, [
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsExpenseRequiresOriginal', CustomFieldErrorType.required))
            ])
          : null
      ],
      ExpenseDescription: [expenseDetail.ExpenseDescription],
      OrganizationIdInternal: [expenseDetail.OrganizationIdInternal],
      OrganizationIdClients: WorkorderExpenseDetailComponent.formGroupOrganizationIdClients(formGroupSetup, expenseDetail.OrganizationIdClients),
      OrganizationIdSuppliers: WorkorderExpenseDetailComponent.formGroupOrganizationIdSuppliers(formGroupSetup, expenseDetail.OrganizationIdSuppliers)
    });

    return formGroup;
  }

  public static formGroupOrganizationIdSuppliers(formGroupSetup: IFormGroupSetup, organizationIdSuppliers: Array<ISupplierOrganization>) {
    return formGroupSetup.formBuilder.array<ISupplierOrganization>(
      organizationIdSuppliers.map((id: ISupplierOrganization, index) =>
        formGroupSetup.hashModel.getFormGroup<ISupplierOrganization>(formGroupSetup.toUseHashCode, 'ISupplierOrganization', id, index, () =>
          formGroupSetup.formBuilder.group<ISupplierOrganization>({
            OrganizationIdSupplier: [id.OrganizationIdSupplier]
          })
        )
      )
    );
  }

  public static formGroupOrganizationIdClients(formGroupSetup: IFormGroupSetup, organizationIdClients: Array<IClientOrganization>) {
    return formGroupSetup.formBuilder.array<IClientOrganization>(
      organizationIdClients.map((id: IClientOrganization, index) =>
        formGroupSetup.hashModel.getFormGroup<IClientOrganization>(formGroupSetup.toUseHashCode, 'IClientOrganization', id, index, () =>
          formGroupSetup.formBuilder.group<IClientOrganization>({
            OrganizationIdClient: [id.OrganizationIdClient]
          })
        )
      )
    );
  }

  public static formGroupExpenseApprover(formGroupSetup: IFormGroupSetup, expenseApprovers: Array<IExpenseApprover>, isApproverValid = false) {
    return formGroupSetup.formBuilder.array<IExpenseApprover>(
      expenseApprovers
        .sort((a1: IExpenseApprover, a2: IExpenseApprover) => a1.Sequence - a2.Sequence)
        .map((approver: IExpenseApprover, index) =>
          formGroupSetup.hashModel.getFormGroup<IExpenseApprover>(formGroupSetup.toUseHashCode, 'IExpenseApprover', approver, index, () =>
            formGroupSetup.formBuilder.group<IExpenseApprover>({
              Id: [approver.Id],
              IsDraft: [approver.IsDraft],
              MustApprove: [approver.MustApprove],
              Sequence: [approver.Sequence],
              SourceId: [approver.SourceId],
              UserProfileId: [
                approver.UserProfileId,
                approver.ApproverTypeId === PhxConstants.ApproverType.ClientApprover && isApproverValid
                  ? PtFieldViewCustomValidator.checkPtFieldViewCustomValidator('WorkOrderVersion.ExpenseApprovers', 'UserProfileId', null, [
                      ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))
                    ])
                  : []
              ],
              WorkOrderVersion: [approver.WorkOrderVersion],
              WorkOrderVersionId: [approver.WorkOrderVersionId],
              ApproverTypeId: [approver.ApproverTypeId]
            })
          )
        )
    );
  }

  public static formGroupExpenseApprovers(formGroupSetup: IFormGroupSetup, expenseApprovers: Array<IExpenseApprover> = [], isApproverValid: boolean) {
    let isClientApproverExists = false;
    let isInternalApproverExists = false;
    let isSupplierApproverExists = false;

    if (expenseApprovers.length > 0) {
      isClientApproverExists = expenseApprovers.filter(a => a.ApproverTypeId === PhxConstants.ApproverType.ClientApprover).length > 0;
      isInternalApproverExists = expenseApprovers.filter(a => a.ApproverTypeId === PhxConstants.ApproverType.InternalApprover).length > 0;
      isSupplierApproverExists = expenseApprovers.filter(a => a.ApproverTypeId === PhxConstants.ApproverType.SupplierApprover).length > 0;
    }

    const form = formGroupSetup.formBuilder.group<any>({
      ClientApprover: isClientApproverExists
        ? WorkorderExpenseDetailComponent.formGroupExpenseApprover(formGroupSetup, expenseApprovers.filter(a => a.ApproverTypeId === PhxConstants.ApproverType.ClientApprover), isApproverValid)
        : WorkorderExpenseDetailComponent.formGroupExpenseApprover(formGroupSetup, WorkorderExpenseDetailComponent.getExpenseApproverEmptyObject(PhxConstants.ApproverType.ClientApprover), isApproverValid),
      InternalApprover: isInternalApproverExists
        ? WorkorderExpenseDetailComponent.formGroupExpenseApprover(formGroupSetup, expenseApprovers.filter(a => a.ApproverTypeId === PhxConstants.ApproverType.InternalApprover))
        : WorkorderExpenseDetailComponent.formGroupExpenseApprover(formGroupSetup, WorkorderExpenseDetailComponent.getExpenseApproverEmptyObject(PhxConstants.ApproverType.InternalApprover)),
      SupplierApprover: isSupplierApproverExists
        ? WorkorderExpenseDetailComponent.formGroupExpenseApprover(formGroupSetup, expenseApprovers.filter(a => a.ApproverTypeId === PhxConstants.ApproverType.SupplierApprover))
        : WorkorderExpenseDetailComponent.formGroupExpenseApprover(formGroupSetup, WorkorderExpenseDetailComponent.getExpenseApproverEmptyObject(PhxConstants.ApproverType.SupplierApprover))
    });

    return form;
  }

  public static getExpenseApproverEmptyObject(ApproverType: number): Array<IExpenseApprover> {
    const expenseApprover: Array<IExpenseApprover> = [
      {
        Id: 0,
        ApproverTypeId: ApproverType,
        IsDraft: true,
        MustApprove: true,
        Sequence: ApproverType === PhxConstants.ApproverType.SupplierApprover ? 3 : ApproverType === PhxConstants.ApproverType.InternalApprover ? 2 : 1,
        SourceId: null,
        UserProfileId: null,
        WorkOrderVersion: null,
        WorkOrderVersionId: 0
      }
    ];
    return expenseApprover;
  }

  public static formBuilderGroupAddNewApprover(formGroupSetup: IFormGroupOnNew): FormGroup<IExpenseApprover> {
    return formGroupSetup.formBuilder.group<IExpenseApprover>({
      Id: 0,
      ApproverTypeId: PhxConstants.ApproverType.ClientApprover,
      IsDraft: true,
      MustApprove: true,
      Sequence: 3,
      SourceId: null,
      UserProfileId: [null, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileId', CustomFieldErrorType.required))]],
      WorkOrderVersion: null,
      WorkOrderVersionId: 0
    });
  }

  public static formGroupToPartial(workOrder: IWorkOrder, formGroupTabExpenseInvoiceDetail: FormGroup<ITabExpenseInvoiceDetail>): IWorkOrder {
    const formGroupExpenseInvoiceDetail: FormGroup<ITabExpenseInvoiceDetail> = formGroupTabExpenseInvoiceDetail;
    const expenseInvoiceDetail: ITabExpenseInvoiceDetail = formGroupExpenseInvoiceDetail.value;
    workOrder.WorkOrderVersion.ExpenseMethodologyId = expenseInvoiceDetail.ExpenseMethodologyId;
    workOrder.WorkOrderVersion.ExpenseApprovalFlowId =
      expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval
        ? expenseInvoiceDetail.ExpenseApprovalFlowId
          ? expenseInvoiceDetail.ExpenseApprovalFlowId
          : PhxConstants.TimeSheetApprovalFlow.Sequential
        : null;
    workOrder.WorkOrderVersion.IsExpenseUsesProjects =
      expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval
        ? expenseInvoiceDetail.IsExpenseUsesProjects
        : null;
    workOrder.WorkOrderVersion.ExpenseApprovers =
      expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval
        ? [
            ...expenseInvoiceDetail.ExpenseApprovers['ClientApprover'],
            ...expenseInvoiceDetail.ExpenseApprovers['SupplierApprover'].filter(a => a.UserProfileId),
            ...expenseInvoiceDetail.ExpenseApprovers['InternalApprover'].filter(a => a.UserProfileId)
          ]
        : [];
    workOrder.WorkOrderVersion.ExpenseThirdPartyWorkerReference = expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.ThirdPartyImport ? expenseInvoiceDetail.ExpenseThirdPartyWorkerReference : null;
    workOrder.WorkOrderVersion.IsExpenseRequiresOriginal =
      expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval
        ? expenseInvoiceDetail.IsExpenseRequiresOriginal
        : null;
    workOrder.WorkOrderVersion.ExpenseDescription =
      expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || expenseInvoiceDetail.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval
        ? expenseInvoiceDetail.ExpenseDescription
        : null;
    return workOrder;
  }
}
