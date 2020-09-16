import { PhxConstants } from '../../common/model/phx-constants';

export const EPPChequePaymentStatusList = [
    PhxConstants.PaymentStatus.WaitingForClearance,
    PhxConstants.PaymentStatus.CancelledAfterPrinting,
    PhxConstants.PaymentStatus.PaymentStopped,
    PhxConstants.PaymentStatus.NSF,
    PhxConstants.PaymentStatus.Recalled,
  ];
