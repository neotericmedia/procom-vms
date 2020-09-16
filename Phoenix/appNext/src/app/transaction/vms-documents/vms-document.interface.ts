import { WorkflowAction } from './../../common/model/workflow-action';
import { AccessAction } from '../../common/model/access-action';
// import { IEntityIdAndGuid } from '../../common/model/entity-guid-interface';
import { PhxConstants, CustomFieldService } from '../../common/index';
import { FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { HashModel } from '../../common/utility/hash-model';

export interface IVmsDocumentRouterState {
  documentId: any;
  routerPath: PhxConstants.OrganizationNavigationName;
  roleType?: PhxConstants.OrganizationRoleType;
  roleId?: number;
  url: string;
}
