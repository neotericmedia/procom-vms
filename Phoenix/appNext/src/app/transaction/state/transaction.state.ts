export const transactionState = {
  reduxTransaction: {
    transactionInstance: `reduxTransaction.transactionInstance`,
    isLoading: `reduxTransaction.loading`,
    getTransactionByTransactionHeaderId: (Id: number) => {
      return {
        transactionInstance: `reduxTransaction.transaction.${Id}`
      };
    }
  }
};
