import { ReducerUtility } from '../../common/state/service/reducer.utility';
import { OrganizationAction } from './organization.action';
import { IOrganization } from './organization.interface';

interface IOrganizationState {
  organizations: { [Id: number]: IOrganization };
  loading: {
    [Id: number]: boolean;
  };
  error: any;
}

const organizationInitials: IOrganizationState = {
  organizations: {},
  loading: {},
  error: null
};

export const organizationReducer = (currState: IOrganizationState = organizationInitials, action: OrganizationAction.action): IOrganizationState => {
  switch (action.type) {
    case OrganizationAction.type.OrganizationLoad: {
      const payload = action as OrganizationAction.OrganizationLoad;
      return {
        ...currState,
        loading: {
          ...currState.loading,
          [payload.organizationId]: true
        }
      };
    }
    case OrganizationAction.type.OrganizationLoadStarted: {
      const payload = action as OrganizationAction.OrganizationLoadStarted;
      return currState;
    }
    case OrganizationAction.type.OrganizationLoadError: {
      const payload = action as OrganizationAction.OrganizationLoadError;
      return {
        ...currState,
        organizations: {},
        loading: {
          ...currState.loading,
          [payload.organizationId]: false
        },
        error: payload.error
      };
    }
    case OrganizationAction.type.OrganizationAdd: {
      const payload = action as OrganizationAction.OrganizationAdd;
      return {
        ...currState,
        organizations: { ...currState.organizations, [payload.organizationId]: payload.organization },
        loading: {
          ...currState.loading,
          [payload.organizationId]: false
        },
        error: null
      };
    }
    case OrganizationAction.type.OrganizationDelete: {
      const payload = action as OrganizationAction.OrganizationDelete;
      const orgs = { ...currState.organizations };
      delete orgs[payload.organizationId];
      return {
        ...currState,
        organizations: orgs
      };
    }
    case OrganizationAction.type.OrganizationUpdate: {
      const payload = action as OrganizationAction.OrganizationUpdate;
      if (!payload.organization) {
        return currState;
      }
      return {
        ...currState,
        organizations: {
          ...currState.organizations,
          [payload.organization.Id]: payload.organization
        }
      };
    }
    case OrganizationAction.type.OrganizationValidationErrorAdd: {
      const payload = action as OrganizationAction.OrganizationValidationErrorAdd;
      return {
        ...currState,
        organizations: {
          ...currState.organizations,
          [payload.organizationId]: {
            ...currState.organizations[payload.organizationId],
            OrganizationValidationErrors: payload.validationMessages
          }
        }
      };
    }
    case OrganizationAction.type.OrganizationValidationErrorDelete: {
      const payload = action as OrganizationAction.OrganizationValidationErrorDelete;
      return {
        ...currState,
        organizations: {
          ...currState.organizations,
          [payload.organizationId]: {
            ...currState.organizations[payload.organizationId],
            OrganizationValidationErrors: []
          }
        }
      };
    }
    default: {
      return currState;
    }
  }
};
