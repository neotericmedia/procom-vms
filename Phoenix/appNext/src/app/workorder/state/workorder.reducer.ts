// https://github.com/markerikson/redux/blob/structuring-reducers-page/docs/recipes/reducers/09-ImmutableUpdatePatterns.md
// https://github.com/angular-redux/example-app/blob/master/src/app/animals/api/reducer.ts
import { WorkorderAction } from './workorder.action';

interface IWorkorderState {
  workorders: any; // { [Id: number]: IWorkOrder };
  loading: {
    [Id: number]: boolean;
  };
  error: any;
}

const workorderInitials: IWorkorderState = {
  workorders: {},
  loading: {},
  error: null
};

export const workorderReducer = (currState: IWorkorderState = workorderInitials, action: WorkorderAction.action): IWorkorderState => {
  switch (action.type) {
    case WorkorderAction.type.WorkorderLoad: {
      const payload = action as WorkorderAction.WorkorderLoad;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}`);
      return {
        ...currState,
        loading: {
          ...currState.loading,
          [payload.Id]: true
        }
      };
    }
    case WorkorderAction.type.WorkorderLoadStarted: {
      const payload = action as WorkorderAction.WorkorderLoadStarted;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}`);
      return currState;
    }
    case WorkorderAction.type.WorkorderLoadError: {
      const payload = action as WorkorderAction.WorkorderLoadError;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        workorders: {},
        loading: {
          ...currState.loading,
          [payload.Id]: false
        },
        error: payload.error
      };
    }
    // Workorder Add
    case WorkorderAction.type.WorkorderAdd: {
      const payload = action as WorkorderAction.WorkorderAdd;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}, organization.Id:${payload.workorder == null ? null : 1}`);
      return {
        ...currState,
        workorders: { ...currState.workorders, [payload.Id]: payload.workorder },
        loading: {
          ...currState.loading,
          [payload.Id]: false
        },
        error: null
      };
    }
    case WorkorderAction.type.WorkorderRefresh: {
      const payload = action as WorkorderAction.WorkorderRefresh;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}`);
      // debugger;
      const workorders = { ...currState.workorders };
      delete workorders[payload.Id];
      return {
        ...currState,
        workorders: workorders
      };
    }
    case WorkorderAction.type.WorkorderUpdate: {
      const payload = action as WorkorderAction.WorkorderUpdate;
      if (!payload.workorder) {
        return currState;
      }
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.workorder.WorkOrderVersion.Id}, payload:${payload}`);
      return {
        ...currState,
        workorders: {
          ...currState.workorders,
          [payload.workorder.WorkOrderVersion.Id]: payload.workorder
        }
      };
    }
    case WorkorderAction.type.WorkorderReload: {
      const workorders = {  };
      return {
        ...currState,
        workorders: workorders,
        loading: {},
      };
    }
    case WorkorderAction.type.WorkorderValidationErrorAdd: {
      const payload = action as WorkorderAction.WorkorderValidationErrorAdd;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        workorders: {
          ...currState.workorders,
          [payload.Id]: {
            ...currState.workorders[payload.Id],
            WorkorderValidationErrors: payload.validationMessages
          }
        }
      };
    }
    case WorkorderAction.type.WorkorderValidationErrorDelete: {
      const payload = action as WorkorderAction.WorkorderValidationErrorDelete;
      console.log(`workorderReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        workorders: {
          ...currState.workorders,
          [payload.Id]: {
            ...currState.workorders[payload.Id],
            WorkorderValidationErrors: []
          }
        }
      };
    }
    default: {
      return currState;
    }
  }
};
