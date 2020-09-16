export enum ChequeWorkflowActions {
    ClearCheques = 60042,
    MarkAsNSF = 60043,
    StopPayment = 60044,
    CancelCheques = 60045,
    MoveToInProgress = 60050,
}

export enum ChequeStateActions {
    PaymentClearCheques = 2304,
    PaymentMarkAsNSF = 2305,
    PaymentStopPayment = 2306,
    PaymentCancelCheques = 2307,
    PaymentMoveToInProgress = 2308,
}
