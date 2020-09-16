(function (services) {
    'use strict';

    var serviceId = 'TransactionViewService';

    angular.module('phoenix.transaction.services').factory(serviceId, ['CodeValueService', TransactionViewService]);

    function TransactionViewService(CodeValueService) {

        var service = {
            Calculate: Calculate,
        };

        return service;



        function Calculate(transactionHeader) {

            transactionHeader.billing = {};
            transactionHeader.billing.TotalRateUnits = 0;
            transactionHeader.billing.TotalSalesTax = 0;
            transactionHeader.billing.Total = 0;

            angular.forEach(transactionHeader.BillingTransactions, function (billingTransaction) {

                billingTransaction.ShowDetailType = 'SalesTaxTotal';

                billingTransaction.TotalRateUnits = 0;
                billingTransaction.TotalSalesTax = 0;
                billingTransaction.Total = 0;
                billingTransaction.TotalDiscount = 0;
                billingTransaction.groupBySalesTaxInfos = {};

                billingTransaction.CurrencyCode = CodeValueService.getCodeValue(billingTransaction.CurrencyId, CodeValueGroups.Currency).code;

                angular.forEach(billingTransaction.BillingTransactionLines, function (billingTransactionLine) {

                    billingTransactionLine.Discount = 0;

                    billingTransactionLine.TotalRateUnits = billingTransactionLine.Rate * billingTransactionLine.Units;
                    billingTransactionLine.TotalSalesTax = 0;
                    angular.forEach(billingTransactionLine.BillingTransactionLineSalesTaxes, function (billingTransactionLineSalesTax) {
                        billingTransactionLine.TotalSalesTax += billingTransactionLineSalesTax.Amount;

                        if (typeof billingTransaction.groupBySalesTaxInfos[billingTransactionLineSalesTax.SalesTaxVersionRateId] === 'undefined') {
                            billingTransaction.groupBySalesTaxInfos[billingTransactionLineSalesTax.SalesTaxVersionRateId] = {
                                id: billingTransactionLineSalesTax.SalesTaxVersionRateId,
                                count: 1,
                                amount: billingTransactionLineSalesTax.Amount,
                                taxShortName: billingTransactionLineSalesTax.SalesTaxVersionRate.ShortName,
                                taxRate: billingTransactionLineSalesTax.SalesTaxVersionRate.Rate
                            };
                        }
                        else {
                            billingTransaction.groupBySalesTaxInfos[billingTransactionLineSalesTax.SalesTaxVersionRateId].amount += billingTransactionLineSalesTax.Amount;
                            billingTransaction.groupBySalesTaxInfos[billingTransactionLineSalesTax.SalesTaxVersionRateId].count += 1;
                        }

                    });
                    billingTransactionLine.Total = billingTransactionLine.TotalRateUnits + billingTransactionLine.TotalSalesTax;

                    billingTransaction.TotalRateUnits += billingTransactionLine.TotalRateUnits;
                    billingTransaction.TotalSalesTax += billingTransactionLine.TotalSalesTax;
                    billingTransaction.Total += billingTransactionLine.Total;

                    billingTransaction.TotalDiscount += billingTransactionLine.Discount;
                });


                transactionHeader.billing.TotalRateUnits += billingTransaction.TotalRateUnits;
                transactionHeader.billing.TotalSalesTax += billingTransaction.TotalSalesTax;
                transactionHeader.billing.Total += billingTransaction.Total;
                transactionHeader.billing.CurrencyCode = billingTransaction.CurrencyCode;

                billingTransaction.BillingTransactionLineIndexShowDetail = -1;

            });

            transactionHeader.payment = {};
            transactionHeader.payment.TotalRateUnits = 0;
            transactionHeader.payment.TotalSalesTax = 0;
            transactionHeader.payment.TotalDeductions = 0;
            transactionHeader.payment.Total = 0;

            angular.forEach(transactionHeader.PaymentTransactions, function (paymentTransaction) {

                paymentTransaction.ShowDetailType = 'SalesTaxTotal';

                paymentTransaction.TotalRateUnits = 0;
                paymentTransaction.TotalSalesTax = 0;
                paymentTransaction.TotalDeductions = 0;
                paymentTransaction.Total = 0;
                paymentTransaction.TotalFee = 0;
                paymentTransaction.groupBySalesTaxInfos = {};
                paymentTransaction.CurrencyCode = CodeValueService.getCodeValue(paymentTransaction.CurrencyId, CodeValueGroups.Currency).code;

                angular.forEach(paymentTransaction.PaymentTransactionLines, function (paymentTransactionLine) {

                    paymentTransactionLine.Fee = 0;
                    paymentTransactionLine.TotalRateUnits = paymentTransactionLine.Rate * paymentTransactionLine.Units;
                    paymentTransactionLine.TotalSalesTax = 0;
                    angular.forEach(paymentTransactionLine.PaymentTransactionLineSalesTaxes, function (paymentTransactionLineSalesTax) {
                        paymentTransactionLine.TotalSalesTax += paymentTransactionLineSalesTax.Amount;

                        if (typeof paymentTransaction.groupBySalesTaxInfos[paymentTransactionLineSalesTax.SalesTaxVersionRateId] === 'undefined') {
                            paymentTransaction.groupBySalesTaxInfos[paymentTransactionLineSalesTax.SalesTaxVersionRateId] = {
                                id: paymentTransactionLineSalesTax.SalesTaxVersionRateId,
                                count: 1,
                                amount: paymentTransactionLineSalesTax.Amount,
                                taxShortName: paymentTransactionLineSalesTax.SalesTaxVersionRate.ShortName,
                                taxRate: paymentTransactionLineSalesTax.SalesTaxVersionRate.Rate
                            };
                        }
                        else {
                            paymentTransaction.groupBySalesTaxInfos[paymentTransactionLineSalesTax.SalesTaxVersionRateId].amount += paymentTransactionLineSalesTax.Amount;
                            paymentTransaction.groupBySalesTaxInfos[paymentTransactionLineSalesTax.SalesTaxVersionRateId].count += 1;
                        }

                    });
                    paymentTransactionLine.TotalDeductions = 0;
                    paymentTransactionLine.Total = paymentTransactionLine.TotalRateUnits + paymentTransactionLine.TotalSalesTax;

                    paymentTransaction.TotalRateUnits += paymentTransactionLine.TotalRateUnits;
                    paymentTransaction.TotalSalesTax += paymentTransactionLine.TotalSalesTax;
                    paymentTransaction.Total += paymentTransactionLine.Total;

                    paymentTransaction.TotalFee += paymentTransactionLine.Fee;
                });

                transactionHeader.payment.TotalRateUnits += paymentTransaction.TotalRateUnits;
                transactionHeader.payment.TotalSalesTax += paymentTransaction.TotalSalesTax;
                transactionHeader.payment.Total += paymentTransaction.Total;
                transactionHeader.payment.CurrencyCode = paymentTransaction.CurrencyCode;
                paymentTransaction.ShowDetailTransactionLineIndex = -1;

            });



            transactionHeader.TotalRateUnitsMargin = transactionHeader.billing.TotalRateUnits - transactionHeader.payment.TotalRateUnits;

            transactionHeader.CurrencyCode = (transactionHeader.BillingTransactions.length > 0) ? transactionHeader.BillingTransactions[0].CurrencyCode : '';

            function isNaNToZero(value) {
                return (typeof value === 'undefined' || value === null || isNaN(value) || !value ? 0 : value);//.toFixed(2);
            }

            transactionHeader.billing.TotalRateUnits = isNaNToZero(transactionHeader.billing.TotalRateUnits);
            transactionHeader.billing.TotalSalesTax = isNaNToZero(transactionHeader.billing.TotalSalesTax);
            transactionHeader.billing.Total = isNaNToZero(transactionHeader.billing.Total);
            angular.forEach(transactionHeader.BillingTransactions, function (billingTransaction) {
                billingTransaction.TotalRateUnits = isNaNToZero(billingTransaction.TotalRateUnits);
                billingTransaction.TotalSalesTax = isNaNToZero(billingTransaction.TotalSalesTax);
                billingTransaction.Total = isNaNToZero(billingTransaction.Total);
                billingTransaction.TotalDiscount = isNaNToZero(billingTransaction.TotalDiscount);
                angular.forEach(billingTransaction.BillingTransactionLines, function (billingTransactionLine) {
                    billingTransactionLine.Fee = isNaNToZero(billingTransactionLine.Fee);
                    billingTransactionLine.Rate = isNaNToZero(billingTransactionLine.Rate);
                    billingTransactionLine.TotalRateUnits = isNaNToZero(billingTransactionLine.TotalRateUnits);
                    billingTransactionLine.TotalSalesTax = isNaNToZero(billingTransactionLine.TotalSalesTax);
                    billingTransactionLine.Total = isNaNToZero(billingTransactionLine.Total);
                    billingTransactionLine.TotalDiscount = isNaNToZero(billingTransactionLine.TotalDiscount);
                    billingTransactionLine.Discount = isNaNToZero(billingTransactionLine.Discount);
                    angular.forEach(billingTransactionLine.BillingTransactionLineSalesTaxes, function (billingTransactionLineSalesTax) {
                        billingTransactionLineSalesTax.Amount = isNaNToZero(billingTransactionLineSalesTax.Amount);
                    });
                });
            });


            transactionHeader.payment.TotalRateUnits = isNaNToZero(transactionHeader.payment.TotalRateUnits);
            transactionHeader.payment.TotalSalesTax = isNaNToZero(transactionHeader.payment.TotalSalesTax);
            transactionHeader.payment.TotalDeductions = isNaNToZero(transactionHeader.payment.TotalDeductions);
            transactionHeader.payment.Total = isNaNToZero(transactionHeader.payment.Total);
            angular.forEach(transactionHeader.PaymentTransactions, function (paymentTransaction) {
                paymentTransaction.TotalRateUnits = isNaNToZero(paymentTransaction.TotalRateUnits);
                paymentTransaction.TotalSalesTax = isNaNToZero(paymentTransaction.TotalSalesTax);
                paymentTransaction.TotalDeductions = isNaNToZero(paymentTransaction.TotalDeductions);
                paymentTransaction.Total = isNaNToZero(paymentTransaction.Total);
                paymentTransaction.TotalDiscount = isNaNToZero(paymentTransaction.TotalDiscount);
                angular.forEach(paymentTransaction.PaymentTransactionLines, function (paymentTransactionLine) {
                    paymentTransactionLine.Fee = isNaNToZero(paymentTransactionLine.Fee);
                    paymentTransactionLine.Rate = isNaNToZero(paymentTransactionLine.Rate);
                    paymentTransactionLine.TotalRateUnits = isNaNToZero(paymentTransactionLine.TotalRateUnits);
                    paymentTransactionLine.TotalSalesTax = isNaNToZero(paymentTransactionLine.TotalSalesTax);
                    paymentTransactionLine.TotalDeductions = isNaNToZero(paymentTransactionLine.TotalDeductions);
                    paymentTransactionLine.Total = isNaNToZero(paymentTransactionLine.Total);
                    paymentTransactionLine.TotalDiscount = isNaNToZero(paymentTransactionLine.TotalDiscount);
                    paymentTransactionLine.Discount = isNaNToZero(paymentTransactionLine.Discount);
                    angular.forEach(paymentTransactionLine.PaymentTransactionLineSalesTaxes, function (paymentTransactionLineSalesTax) {
                        paymentTransactionLineSalesTax.Amount = isNaNToZero(paymentTransactionLineSalesTax.Amount);
                    });
                });
            });

            return transactionHeader;
        }

    }

}(Phoenix.Services));