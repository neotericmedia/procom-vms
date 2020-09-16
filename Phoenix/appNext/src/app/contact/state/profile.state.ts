export const ProfileState = {
    reduxProfile: {
      profileInstance: `reduxProfile.profileInstance`,
      isLoading: (Id: number) => `reduxProfile.loading.${Id}`,
      getProfileByProfileId: (Id: number) => {
        return {
            profileInstance: `reduxProfile.profiles.${Id}`
        };
      }
    }
  };
