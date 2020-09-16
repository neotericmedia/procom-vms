export const commissionRateState = {
  reduxCommissionRate: {
    workorderInstance: `reduxCommissionRate.commissionRateInstance`,
    getCommissionRateByVersionId: (Id: number) => {
      return {
        commissionRateInstance: `reduxCommissionRate.commissionRates.${Id}`
      };
    }
  }
};
