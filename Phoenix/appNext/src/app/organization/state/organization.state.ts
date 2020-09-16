export const organizationState = {
  reduxOrganization: {
    organizationInstance: `reduxOrganization.organizationInstance`,
    isLoading: (Id: number) => `reduxOrganization.loading.${Id}`,
    getOrganizationByOrganizationId: (Id: number) => {
      return {
        organizationInstance: `reduxOrganization.organizations.${Id}`
      };
    }
  }
};
