export const SubscriptionState = {
    reduxSubscription: {
        subscriptionInstance: `reduxSubscription.subscriptionInstance`,
        getSubscriptionBySubscrptionId: (subscriptionId: number) => {
            return {
                subscriptionInstance: `reduxSubscription.subscriptions.${subscriptionId}`
            };
        }
    }
};
