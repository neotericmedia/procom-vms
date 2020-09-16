export const PurchaseOrderState = {
  reduxPurchaseOrder: {
    purchaseOrderInstance: `reduxPurchaseOrder.purchaseOrderInstance`,
    getPurchaseOrderByPurchaseOrderId: (Id: number) => {
      return {
        purchaseOrderInstance: `reduxPurchaseOrder.purchaseOrders.${Id}`
      };
    }
  }
};
