export const workorderState = {
  reduxWorkorder: {
    workorderInstance: `reduxWorkorder.workorderInstance`,
    isLoading: (Id: number) => `reduxWorkorder.loading.${Id}`,
    getWorkorderByWorkorderId: (Id: number) => {
      return {
        workorderInstance: `reduxWorkorder.workorders.${Id}`
      };
    }
  },
};
