import { PhxConstants } from '../../common/model/phx-constants';
import { EPPChequePaymentStatusList } from './epp-cheque-payment-status-list';

export const ChequePaymentStatusList = EPPChequePaymentStatusList.concat([
  PhxConstants.PaymentStatus.Released,
  PhxConstants.PaymentStatus.PendingRelease,
  PhxConstants.PaymentStatus.OnHold,
  PhxConstants.PaymentStatus.CancelledBeforePrinting,
  PhxConstants.PaymentStatus.Cleared
]);
