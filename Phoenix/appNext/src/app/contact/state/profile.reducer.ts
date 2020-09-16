import { ProfileAction } from './profile.action';
import { IProfile } from './profile.interface';

interface IProfileState {
  profiles: { [Id: number]: IProfile };
  loading: {
    [Id: number]: boolean;
  };
  error: any;
}

const profileInitials: IProfileState = {
  profiles: {},
  loading: {},
  error: null
};

export const profileReducer = (currState: IProfileState = profileInitials, action: ProfileAction.action): IProfileState => {
  switch (action.type) {
    case ProfileAction.type.ProfileLoadStarted: {
      const payload = action as ProfileAction.ProfileLoadStarted;
      // console.log(`profileReducer: type:${payload.type}, Id:${payload.Id}`);
      return {
        ...currState,
        loading: {
          ...currState.loading,
          [payload.Id]: true
        }
      };
    }
    case ProfileAction.type.ProfileLoadError: {
      const payload = action as ProfileAction.ProfileLoadError;
      // console.log(`profileReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
      return {
        ...currState,
        profiles: {},
        loading: {
            ...currState.loading,
            [payload.Id]: false
        },
        error: payload.error
      };
    }

    case ProfileAction.type.ProfileAdd: {
      const payload = action as ProfileAction.ProfileAdd;
      // console.log(`profileReducer: type:${payload.type}, Id:${payload.Id}, organization.Id:${payload.profile == null ? null : 1}`);
      return {
        ...currState,
        profiles: { ...currState.profiles, [payload.Id]: payload.profile },
        loading: {
            ...currState.loading,
            [payload.Id]: false
        },
        error: null
      };
    }
    case ProfileAction.type.ProfileRefresh: {
      const payload = action as ProfileAction.ProfileRefresh;
      // console.log(`profileReducer: type:${payload.type}, Id:${payload.Id}`);
      const profiles = { ...currState.profiles };
      delete profiles[payload.Id]; // delete the profile will result observable to reload from server
      return {
        ...currState,
        profiles: profiles
      };
    }
    case ProfileAction.type.ProfileUpdate: {
      const payload = action as ProfileAction.ProfileUpdate;
      if (!payload.profile) {
        return currState;
      }
      // console.log(`profileReducer: type:${payload.type}, Id:${payload.profile.Id}, payload:${payload}`);
      return {
        ...currState,
        profiles: {
          ...currState.profiles,
          [payload.profile.Id]: payload.profile
        }
      };
    }

    case ProfileAction.type.ClearProfile: {
      const payload = action as ProfileAction.ClearProfile;
      return {
        ...currState,
        profiles: {}
      };
    }

    // case ProfileAction.type.ProfileValidationErrorAdd: {
    //     const payload = action as ProfileAction.ProfileValidationErrorAdd;
    //     console.log(`profileReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
    //     return {
    //         ...currState,
    //         profiles: {
    //             ...currState.profiles,
    //             [payload.Id]: {
    //                 ...currState.profiles[payload.Id],
    //                 ProfileValidationErrors: payload.validationMessages
    //             }
    //         }
    //     };
    // }
    // case ProfileAction.type.ProfileValidationErrorDelete: {
    //     const payload = action as ProfileAction.ProfileValidationErrorDelete;
    //     console.log(`profileReducer: type:${payload.type}, Id:${payload.Id}, payload:${payload}`);
    //     return {
    //         ...currState,
    //         profiles: {
    //             ...currState.profiles,
    //             [payload.Id]: {
    //                 ...currState.profiles[payload.Id],
    //                 ProfileValidationErrors: []
    //             }
    //         }
    //     };
    // }
    default: {
      return currState;
    }
  }
};
