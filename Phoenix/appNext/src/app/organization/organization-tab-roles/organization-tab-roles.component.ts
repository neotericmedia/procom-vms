// angular
import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// common
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { EntityAccessActionExists, AccessAction } from './../../common/model/access-action';
import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService } from '../../common/services/common.service';
import { CustomFieldService } from '../../common';
// organization
import {
  IOrganization,
  IOrganizationClientRole,
  IOrganizationIndependentContractorRole,
  IOrganizationInternalRole,
  IOrganizationSubVendorRole,
  IOrganizationLimitedLiabilityCompanyRole,
  IReadOnlyStorage,
  IOrganizationRouterState,
  ITabRoles,
  IFormGroupSetup,
  IFormGroupOnNew,
  IRoot,
  IOrganizationTaxNumbers
} from '../state/organization.interface';
import { OrganizationRoleClientComponent } from '../organization-role-client/organization-role-client.component';
import { OrganizationRoleIndependentContractorComponent } from '../organization-role-independent-contractor/organization-role-independent-contractor.component';
import { OrganizationRoleInternalComponent } from '../organization-role-internal/organization-role-internal.component';
import { OrganizationRoleSubVendorComponent } from '../organization-role-sub-vendor/organization-role-sub-vendor.component';
import { OrganizationRoleLimitedLiabilityCompanyComponent } from '../organization-role-limited-liability-company/organization-role-limited-liability-company.component';
import { OrganizationSalesTaxComponent } from '../organization-sales-tax/organization-sales-tax.component';
import { OrganizationSalesTaxesComponent } from '../organization-sales-taxes/organization-sales-taxes.component';
import { AuthService } from '../../common/services/auth.service';

interface IRoleConfig {
  sortOrder: number;
  icon: string;
  name: string;
  formGroupArrayName:
  | 'OrganizationClientRoles'
  | 'OrganizationInternalRoles'
  | 'OrganizationIndependentContractorRoles'
  | 'OrganizationLimitedLiabilityCompanyRoles'
  | 'OrganizationSubVendorRoles';
  type: PhxConstants.OrganizationRoleType;
  entityType: PhxConstants.EntityType;
  navigationName: PhxConstants.OrganizationNavigationName;
  canCreate: boolean;
  hasAccessOnView: boolean;
  ids: Array<number>;
  roleAdd: (inputFormGroup: FormGroup<ITabRoles>) => void;
}

interface ICurrentOrganizationRole {
  formGroup: FormGroup<IOrganizationClientRole | IOrganizationInternalRole | IOrganizationIndependentContractorRole | IOrganizationLimitedLiabilityCompanyRole | IOrganizationSubVendorRole>;
  roleConfig: IRoleConfig;
  roleId: number;
}

@Component({
  selector: 'app-organization-tab-roles',
  templateUrl: './organization-tab-roles.component.html',
  styleUrls: ['./organization-tab-roles.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationTabRolesComponent implements OnChanges, OnDestroy {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() routerState: IOrganizationRouterState;
  @Input() inputFormGroup: FormGroup<ITabRoles>;
  @Input() rootModel: IOrganization;
  @Output() outputEvent = new EventEmitter();

  html: {
    rolesConfig: Array<IRoleConfig>;
    rolesCanCreateAny: boolean;
    phxConstants: typeof PhxConstants;

    currentOrganizationRole: ICurrentOrganizationRole;

    access: {
      clientRole: { view: boolean; add: boolean };
      independentContractorRole: { view: boolean; add: boolean };
      internalRole: { view: boolean; add: boolean };
      subVendorRole: { view: boolean; add: boolean };
      limitedLiabilityCompanyRole: { view: boolean; add: boolean };
    };
  } = {
      rolesConfig: null,
      rolesCanCreateAny: false,
      phxConstants: null,
      currentOrganizationRole: null,
      access: {
        clientRole: { view: false, add: false },
        independentContractorRole: { view: false, add: false },
        internalRole: { view: false, add: false },
        subVendorRole: { view: false, add: false },
        limitedLiabilityCompanyRole: { view: false, add: false }
      }
    };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private customFieldService: CustomFieldService,
    private chRef: ChangeDetectorRef,
    private authService: AuthService
  ) {
    console.log(this.constructor.name + '.constructor');
    this.html.phxConstants = PhxConstants;
    this.html.rolesConfig = this.rolesConfigCreate();
  }

  ngOnDestroy() {
    this.outputEvent.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.constructor.name + '.ngOnChanges()');
    // debugger;
    if (changes.readOnlyStorage) {
      this.recalcAccessActions(this.readOnlyStorage.IsEditable, this.readOnlyStorage.AccessActions);
    }

    if (changes.routerState) {
      // debugger;
    }

    if (changes.inputFormGroup) {
      const formGroupRoles = changes.inputFormGroup.currentValue;
      this.rolesConfigUpdate(this.html.rolesConfig, formGroupRoles);
      this.html.rolesCanCreateAny = this.html.rolesConfig.some(r => r.canCreate === true);
      this.html.currentOrganizationRole = this.getCurrentOrganizationRole(this.html.rolesConfig, formGroupRoles, this.routerState);

      if (this.html.currentOrganizationRole) {
        this.navigateToRole(this.html.currentOrganizationRole.roleConfig, this.html.currentOrganizationRole.roleId);
      } else {
        this.navigateToRoles();
      }
    }
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    this.html.access.clientRole.view = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationViewClientRole);
    this.html.access.clientRole.add = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationAddClientRole);

    this.html.access.independentContractorRole.view =
      isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationViewIndependentContractorRole);
    this.html.access.independentContractorRole.add =
      isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationAddIndependentContractorRole);

    this.html.access.internalRole.view = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationViewInternalRole);
    this.html.access.internalRole.add = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationAddInternalRole);

    this.html.access.subVendorRole.view = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationViewSubVendorRole);
    this.html.access.subVendorRole.add = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationAddSubVendorRole);

    this.html.access.limitedLiabilityCompanyRole.view =
      isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationViewLimitedLiabilityCompanyRole);
    this.html.access.limitedLiabilityCompanyRole.add =
      isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationAddLimitedLiabilityCompanyRole);
  }

  rolesConfigCreate(): Array<IRoleConfig> {
    // tslint:disable-next-line:prefer-const
    let rolesConfig = new Array<IRoleConfig>();

    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };

    Object.keys(PhxConstants.OrganizationRoleType)
      .filter(key => !isNaN(Number(PhxConstants.OrganizationRoleType[key])))
      .forEach(item => {
        const type: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType[item];

        switch (type) {
          case PhxConstants.OrganizationRoleType.Client:
            {
              const formGroupArrayName = 'OrganizationClientRoles';
              const roleConfig: IRoleConfig = {
                sortOrder: 2,
                name: 'Client',
                formGroupArrayName: formGroupArrayName,
                icon: 'icon icon-small icon-organization-client',
                type: type,
                entityType: PhxConstants.EntityType.OrganizationClientRole,
                navigationName: PhxConstants.OrganizationNavigationName.roleClient,
                ids: [],
                canCreate: false,
                hasAccessOnView: false,
                roleAdd: (inputFormGroup: FormGroup<ITabRoles>) => {
                  const formArrayRoles: FormArray<IOrganizationClientRole> = <FormArray<IOrganizationClientRole>>inputFormGroup.controls.OrganizationClientRoles;
                  formArrayRoles.push(OrganizationRoleClientComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayRoles.value, this.codeValueService, this.commonService));
                }
              };

              rolesConfig.push(roleConfig);
            }
            break;

          case PhxConstants.OrganizationRoleType.IndependentContractor:
            {
              const formGroupArrayName = 'OrganizationIndependentContractorRoles';
              const roleConfig: IRoleConfig = {
                sortOrder: 3,
                name: 'Independent Contractor',
                formGroupArrayName: formGroupArrayName,
                icon: 'icon icon-small icon-organization-independentcontractor',
                type: type,
                entityType: PhxConstants.EntityType.OrganizationIndependentContractorRole,
                navigationName: PhxConstants.OrganizationNavigationName.roleIndependentContractor,
                hasAccessOnView: false,
                ids: [],
                canCreate: false,
                roleAdd: (inputFormGroup: FormGroup<ITabRoles>) => {
                  const formArrayRoles: FormArray<IOrganizationIndependentContractorRole> = <FormArray<IOrganizationIndependentContractorRole>>(
                    inputFormGroup.controls.OrganizationIndependentContractorRoles
                  );
                  formArrayRoles.push(OrganizationRoleIndependentContractorComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayRoles.value,
                    this.codeValueService, this.commonService.CodeValueGroups));
                }
              };

              rolesConfig.push(roleConfig);
            }
            break;

          case PhxConstants.OrganizationRoleType.Internal:
            {
              const formGroupArrayName = 'OrganizationInternalRoles';
              const roleConfig: IRoleConfig = {
                sortOrder: 1,
                name: 'Internal',
                formGroupArrayName: formGroupArrayName,
                icon: 'icon icon-small icon-organization-internal',
                type: type,
                entityType: PhxConstants.EntityType.OrganizationInternalRole,
                navigationName: PhxConstants.OrganizationNavigationName.roleInternal,
                hasAccessOnView: false,
                ids: [],
                canCreate: false,
                roleAdd: (inputFormGroup: FormGroup<ITabRoles>) => {
                  const formArrayRoles: FormArray<IOrganizationInternalRole> = <FormArray<IOrganizationInternalRole>>inputFormGroup.controls.OrganizationInternalRoles;
                  formArrayRoles.push(OrganizationRoleInternalComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayRoles.value));
                }
              };

              rolesConfig.push(roleConfig);
            }
            break;

          case PhxConstants.OrganizationRoleType.LimitedLiabilityCompany:
            {
              const formGroupArrayName = 'OrganizationLimitedLiabilityCompanyRoles';
              const roleConfig: IRoleConfig = {
                sortOrder: 4,
                name: 'Limited Liability Company',
                formGroupArrayName: formGroupArrayName,
                icon: 'icon icon-small icon-organization-limitedliabilitycompany',
                type: type,
                entityType: PhxConstants.EntityType.OrganizationLimitedLiabilityCompanyRole,
                navigationName: PhxConstants.OrganizationNavigationName.roleLimitedLiabilityCompany,
                hasAccessOnView: false,
                ids: [],
                canCreate: false,
                roleAdd: (inputFormGroup: FormGroup<ITabRoles>) => {
                  const formArrayRoles: FormArray<IOrganizationLimitedLiabilityCompanyRole> = <FormArray<IOrganizationLimitedLiabilityCompanyRole>>(
                    inputFormGroup.controls.OrganizationLimitedLiabilityCompanyRoles
                  );
                  formArrayRoles.push(OrganizationRoleLimitedLiabilityCompanyComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayRoles.value,
                    this.codeValueService, this.commonService.CodeValueGroups));
                }
              };

              rolesConfig.push(roleConfig);
            }
            break;
          case PhxConstants.OrganizationRoleType.SubVendor:
            {
              const formGroupArrayName = 'OrganizationSubVendorRoles';
              const roleConfig: IRoleConfig = {
                sortOrder: 5,
                name: 'Sub Vendor',
                formGroupArrayName: formGroupArrayName,
                icon: 'icon icon-small icon-organization-subvendor',
                type: type,
                entityType: PhxConstants.EntityType.OrganizationSubVendorRole,
                navigationName: PhxConstants.OrganizationNavigationName.roleSubVendor,
                hasAccessOnView: false,
                ids: [],
                canCreate: false,
                roleAdd: (inputFormGroup: FormGroup<ITabRoles>) => {
                  const formArrayRoles: FormArray<IOrganizationSubVendorRole> = <FormArray<IOrganizationSubVendorRole>>inputFormGroup.controls.OrganizationSubVendorRoles;
                  (<FormArray<IOrganizationSubVendorRole>>formArrayRoles).push(OrganizationRoleSubVendorComponent.formBuilderGroupAddNew(formGroupOnNew,
                    formArrayRoles.value, this.codeValueService, this.commonService.CodeValueGroups));
                }
              };

              rolesConfig.push(roleConfig);
            }
            break;
        }
      });

    return rolesConfig.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  rolesConfigUpdate(rolesConfig: Array<IRoleConfig>, inputFormGroup: FormGroup<ITabRoles>) {
    const organizationClientRoles: Array<IOrganizationClientRole> = inputFormGroup.controls.OrganizationClientRoles.value;
    const organizationIndependentContractorRoles: Array<IOrganizationIndependentContractorRole> = inputFormGroup.controls.OrganizationIndependentContractorRoles.value;
    const organizationInternalRoles: Array<IOrganizationInternalRole> = inputFormGroup.controls.OrganizationInternalRoles.value;
    const organizationSubVendorRoles: Array<IOrganizationSubVendorRole> = inputFormGroup.controls.OrganizationSubVendorRoles.value;
    const organizationLimitedLiabilityCompanyRoles: Array<IOrganizationLimitedLiabilityCompanyRole> = inputFormGroup.controls.OrganizationLimitedLiabilityCompanyRoles.value;

    rolesConfig.forEach(roleConfig => {
      switch (roleConfig.type) {
        case PhxConstants.OrganizationRoleType.Client:
          {
            // debugger;
            roleConfig.ids = organizationClientRoles.map(role => role.Id);
            roleConfig.hasAccessOnView = this.html.access.clientRole.view;
            roleConfig.canCreate = this.html.access.clientRole.add && organizationInternalRoles.length === 0 && organizationClientRoles.length === 0;
          }
          break;

        case PhxConstants.OrganizationRoleType.IndependentContractor:
          {
            roleConfig.ids = organizationIndependentContractorRoles.map(role => role.Id);
            roleConfig.hasAccessOnView = this.html.access.independentContractorRole.view;
            roleConfig.canCreate =
              this.html.access.independentContractorRole.add &&
              organizationInternalRoles.length === 0 &&
              organizationSubVendorRoles.length === 0 &&
              organizationIndependentContractorRoles.length === 0 &&
              organizationLimitedLiabilityCompanyRoles.length === 0;
          }
          break;

        case PhxConstants.OrganizationRoleType.Internal:
          {
            roleConfig.ids = organizationInternalRoles.map(role => role.Id);
            roleConfig.hasAccessOnView = this.html.access.internalRole.view;
            roleConfig.canCreate =
              this.html.access.internalRole.add &&
              organizationInternalRoles.length === 0 &&
              organizationIndependentContractorRoles.length === 0 &&
              organizationLimitedLiabilityCompanyRoles.length === 0 &&
              organizationSubVendorRoles.length === 0 &&
              organizationClientRoles.length === 0;
          }
          break;

        case PhxConstants.OrganizationRoleType.SubVendor:
          {
            roleConfig.ids = organizationSubVendorRoles.map(role => role.Id);
            roleConfig.hasAccessOnView = this.html.access.subVendorRole.view;
            roleConfig.canCreate =
              this.html.access.subVendorRole.add &&
              organizationSubVendorRoles.length === 0 &&
              organizationIndependentContractorRoles.length === 0 &&
              organizationLimitedLiabilityCompanyRoles.length === 0 &&
              organizationInternalRoles.length === 0;
          }
          break;

        case PhxConstants.OrganizationRoleType.LimitedLiabilityCompany:
          {
            roleConfig.ids = organizationLimitedLiabilityCompanyRoles.map(role => role.Id);
            roleConfig.hasAccessOnView = this.html.access.limitedLiabilityCompanyRole.view;
            roleConfig.canCreate =
              this.html.access.limitedLiabilityCompanyRole.add &&
              organizationInternalRoles.length === 0 &&
              organizationSubVendorRoles.length === 0 &&
              organizationIndependentContractorRoles.length === 0 &&
              organizationLimitedLiabilityCompanyRoles.length === 0;
          }
          break;
      }
    });
  }

  getCurrentOrganizationRole(rolesConfig: Array<IRoleConfig>, inputFormGroup: FormGroup<ITabRoles>, routerState: IOrganizationRouterState): ICurrentOrganizationRole {
    let currentOrganizationRole: ICurrentOrganizationRole = null;

    const setCurrentRole = (
      roleConfig: IRoleConfig,
      roleId: number
    ): FormGroup<IOrganizationClientRole | IOrganizationInternalRole | IOrganizationIndependentContractorRole | IOrganizationLimitedLiabilityCompanyRole | IOrganizationSubVendorRole> => {
      let formArrayRole: FormArray<
        IOrganizationClientRole | IOrganizationInternalRole | IOrganizationIndependentContractorRole | IOrganizationLimitedLiabilityCompanyRole | IOrganizationSubVendorRole
        > = null;
      switch (roleConfig.formGroupArrayName) {
        case 'OrganizationClientRoles':
          {
            formArrayRole = <FormArray<IOrganizationClientRole>>inputFormGroup.controls.OrganizationClientRoles;
          }
          break;
        case 'OrganizationInternalRoles':
          {
            formArrayRole = <FormArray<IOrganizationInternalRole>>inputFormGroup.controls.OrganizationInternalRoles;
          }
          break;
        case 'OrganizationIndependentContractorRoles':
          {
            formArrayRole = <FormArray<IOrganizationIndependentContractorRole>>inputFormGroup.controls.OrganizationIndependentContractorRoles;
          }
          break;
        case 'OrganizationLimitedLiabilityCompanyRoles':
          {
            formArrayRole = <FormArray<IOrganizationLimitedLiabilityCompanyRole>>inputFormGroup.controls.OrganizationLimitedLiabilityCompanyRoles;
          }
          break;
        case 'OrganizationSubVendorRoles':
          {
            formArrayRole = <FormArray<IOrganizationSubVendorRole>>inputFormGroup.controls.OrganizationSubVendorRoles;
          }
          break;
      }

      const index = formArrayRole.value.findIndex(role => role.Id === roleId);
      return index >= 0
        ? (formArrayRole.controls[index] as FormGroup<
          IOrganizationClientRole | IOrganizationInternalRole | IOrganizationIndependentContractorRole | IOrganizationLimitedLiabilityCompanyRole | IOrganizationSubVendorRole
          >)
        : null;
    };

    if (routerState.roleId === null || routerState.roleType === null) {
      for (let i = 0, il = rolesConfig.length; i < il; i++) {
        const roleConfig = rolesConfig[i];
        if (roleConfig.ids.length > 0) {
          const roleId: number = roleConfig.ids[0];
          const formGroup: FormGroup<
            IOrganizationClientRole | IOrganizationInternalRole | IOrganizationIndependentContractorRole | IOrganizationLimitedLiabilityCompanyRole | IOrganizationSubVendorRole
            > = setCurrentRole(roleConfig, roleId);
          if (formGroup) {
            currentOrganizationRole = { formGroup: formGroup, roleConfig: roleConfig, roleId: roleId };
          }
          break;
        }
      }
    } else {
      const roleConfig: IRoleConfig = rolesConfig.find(rc => rc.type === routerState.roleType);
      const formGroup: FormGroup<
        IOrganizationClientRole | IOrganizationInternalRole | IOrganizationIndependentContractorRole | IOrganizationLimitedLiabilityCompanyRole | IOrganizationSubVendorRole
        > = setCurrentRole(roleConfig, routerState.roleId);
      if (formGroup) {
        currentOrganizationRole = { formGroup: formGroup, roleConfig: roleConfig, roleId: routerState.roleId };
      }
    }
    return currentOrganizationRole;
  }

  navigateToRole = (roleConfig: IRoleConfig, roleId: number) => {
    if (roleConfig.navigationName !== null && roleConfig.type !== this.routerState.roleType && roleId !== null) {
      this.router
        .navigate([`/next/organization/${this.routerState.organizationId}/`, PhxConstants.OrganizationNavigationName.roles, roleConfig.navigationName, roleId], {
          relativeTo: this.activatedRoute
        })
        .catch(err => {
          console.error(`${this.constructor.name}: error navigating to roleId "${roleConfig.navigationName}/${roleId}"`, err);
        })
        .then(r => {
          console.log(`${this.constructor.name}: after navigateToRole "${roleConfig.navigationName}/${roleId}"`);
        });
    }
  };

  navigateToRoles = () => {
    const navigateTo = `/next/organization/${this.routerState.organizationId}/` + PhxConstants.OrganizationNavigationName.roles;
    this.router.navigate([navigateTo], { relativeTo: this.activatedRoute.parent }).catch(err => {
      console.error(`error navigating to: ` + navigateTo, err);
    });
  };

  onClickNavigateToRole(roleConfig: IRoleConfig, roleId: number) {
    this.navigateToRole(roleConfig, roleId);
  }

  getRoleTypeByEntityName(entityType: PhxConstants.EntityType): PhxConstants.OrganizationRoleType {
    switch (entityType) {
      case PhxConstants.EntityType.OrganizationClientRole: {
        return PhxConstants.OrganizationRoleType.Client;
      }
      case PhxConstants.EntityType.OrganizationIndependentContractorRole: {
        return PhxConstants.OrganizationRoleType.IndependentContractor;
      }

      case PhxConstants.EntityType.OrganizationInternalRole: {
        return PhxConstants.OrganizationRoleType.Internal;
      }

      case PhxConstants.EntityType.OrganizationSubVendorRole: {
        return PhxConstants.OrganizationRoleType.SubVendor;
      }

      case PhxConstants.EntityType.OrganizationLimitedLiabilityCompanyRole: {
        return PhxConstants.OrganizationRoleType.LimitedLiabilityCompany;
      }
    }
  }

  onClickAddOrganizationRole(roleType: PhxConstants.OrganizationRoleType) {
    const roleConfig: IRoleConfig = this.html.rolesConfig.find(item => item.type === roleType);
    roleConfig.roleAdd(this.inputFormGroup);
    this.outputEvent.emit();
    this.navigateToRole(roleConfig, 0);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organization: IOrganization,
    codeValueService: CodeValueService, codeValueGroups: any, modifyInternalRoleBankAccount: boolean): FormGroup<ITabRoles> {
    const formGroup = formGroupSetup.formBuilder.group<ITabRoles>({
      // OrganizationId: [organization.Id],

      OrganizationClientRoles: formGroupSetup.formBuilder.array<IOrganizationClientRole>(
        organization.OrganizationClientRoles.map((role, index) => OrganizationRoleClientComponent.formBuilderGroupSetup(formGroupSetup, role, index))
      ),

      OrganizationIndependentContractorRoles: formGroupSetup.formBuilder.array<IOrganizationIndependentContractorRole>(
        organization.OrganizationIndependentContractorRoles.map((role, index) =>
          OrganizationRoleIndependentContractorComponent.formBuilderGroupSetup(formGroupSetup, role, codeValueService, codeValueGroups))
      ),
      OrganizationInternalRoles: formGroupSetup.formBuilder.array<IOrganizationInternalRole>(
        organization.OrganizationInternalRoles.map((role, index) => OrganizationRoleInternalComponent.formBuilderGroupSetup(formGroupSetup, role, index,
          modifyInternalRoleBankAccount))
      ),

      OrganizationSubVendorRoles: formGroupSetup.formBuilder.array<IOrganizationSubVendorRole>(
        organization.OrganizationSubVendorRoles.map((role, index) =>
          OrganizationRoleSubVendorComponent.formBuilderGroupSetup(formGroupSetup, role, codeValueService, codeValueGroups))
      ),

      OrganizationLimitedLiabilityCompanyRoles: formGroupSetup.formBuilder.array<IOrganizationLimitedLiabilityCompanyRole>(
        organization.OrganizationLimitedLiabilityCompanyRoles.map((role, index) =>
          OrganizationRoleLimitedLiabilityCompanyComponent.formBuilderGroupSetup(formGroupSetup, role, index, codeValueService, codeValueGroups))
      ),

      OrganizationTaxNumbers: formGroupSetup.formBuilder.group<IOrganizationTaxNumbers>({
        SalesTax: OrganizationSalesTaxComponent.formBuilderGroupSetup(formGroupSetup, organization.OrganizationTaxNumbers),
        SelectedType: [organization.OrganizationTaxNumbers]
      })
    });

    return formGroup;
  }

  public static formGroupToPartial(formGroupRoot: FormGroup<IRoot>): Partial<IOrganization> {
    const formGroupTabRoles: FormGroup<ITabRoles> = <FormGroup<ITabRoles>>formGroupRoot.controls.TabRoles;
    return {
      ...OrganizationRoleClientComponent.formGroupToPartial(formGroupTabRoles),
      ...OrganizationRoleIndependentContractorComponent.formGroupToPartial(formGroupTabRoles),
      ...OrganizationRoleInternalComponent.formGroupToPartial(formGroupTabRoles),
      ...OrganizationRoleLimitedLiabilityCompanyComponent.formGroupToPartial(formGroupTabRoles),
      ...OrganizationRoleSubVendorComponent.formGroupToPartial(formGroupTabRoles),
      ...OrganizationSalesTaxesComponent.formGroupToPartial(formGroupTabRoles)
    };
  }
}
