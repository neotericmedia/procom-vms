import { AccessAction } from '../../common/model/access-action';
import { PhxConstants, CustomFieldService } from '../../common/index';
import { HashModel } from '../../common/utility/hash-model';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { RestrictionSelectorType } from '../../restriction/share';

export interface IFormGroupSetup {
  hashModel: HashModel;
  toUseHashCode: boolean;
  formBuilder: FormBuilder;
  customFieldService: CustomFieldService;
}

export interface IFormGroupOnNew {
  formBuilder: FormBuilder;
  customFieldService: CustomFieldService;
}

export interface IWorkorderRouterState {
  Id: number;
  routerPath: PhxConstants.CommissionRateNavigationName;
  roleType?: PhxConstants.WorkorderRoleType;
  roleId?: number;
  url: string;
}

export interface ICommissionRateValidationError {
  ValidationErrors: Array<string>;
}

export interface IRoot {
  Id: number;
  TabDetails: ITabDetails;
}

export class IReadOnlyStorage {
  readonly IsEditable: boolean;
  readonly IsDebugMode: boolean;
  readonly AccessActions: Array<AccessAction>;
}

export interface IRestrictionItem {
  id: number;
  text: string;
  type: RestrictionSelectorType;
  restrictionTypeId: PhxConstants.CommissionRateRestrictionType;
}

export interface ICommissionRateVersion {
  WorkflowPendingTaskId?: any;
  WorkflowAvailableActions?: any;
  Id: number;
  EffectiveDate: string;
  CommissionRateHeaderId?: number;
  CommissionRateVersionStatusId: number;
  ScheduledChangeRateApplicationId: number;
  Percentage: number;
  customStatusId?: number;
}

export interface ICommissionRateRestriction {
  Id: number;
  CommissionRateHeaderId: number;
  CommissionRateRestrictionTypeId: number;
  Name: string;
  OrganizationIdInternal?: number;
  OrganizationIdClient?: number;
  LineOfBusinessId?: number;
  InternalOrganizationDefinition1Id?: number;
}

export interface ICommissionRate {
  Id: number;
  CommissionUserProfileId: number;
  CommissionUserProfileStatusId: number;
  CommissionUserProfileFirstName: string;
  CommissionUserProfileLastName: string;
  CommissionUserProfileStatusName: string;
  CommissionRateTypeId: number;
  CommissionRoleId: number;
  CommissionRateHeaderStatusId?: number;
  Description: string;
  CommissionRateVersions: ICommissionRateVersion[];
  CommissionRateRestrictions: ICommissionRateRestriction[];

  WorkflowAvailableActions?: any;
  ReadOnlyStorage?: IReadOnlyStorage;
  CommissionRateValidationErrors?: Array<ICommissionRateValidationError>;
  AvailableStateActions?: any;
}

export interface ITabDetails {
  EffectiveDate: any;
  Description: string;
  ScheduledChangeRateApplicationId: number;
  Percentage: number;
  CommissionRateRestrictions: ICommissionRateRestriction[];
}
export interface ICommissionRateSetUp {
  CommissionUserProfileId: number;
  commissionRoleId: number;
  commissionRateTypeId: number;
  commissionTemplateId: number;
}
