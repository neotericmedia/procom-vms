(function (angular) {
    'use strict';
    angular.module('phoenix.workorder.models').factory('WorkOrderVersionModel', ['Base', 'AssignmentApiService',
        function (Base, AssignmentApiService) {
            return Base.extend({
                beforeMixingInto: function (obj) {

                },
                extended: true,

                changePaymentRatesForWorkSite: function () {
                    var isChanged = false;
                    angular.forEach(this.PaymentInfoes, function (paymentInfo) {
                        angular.forEach(paymentInfo.PaymentRates, function (paymentRate) {
                            if (this.WorksiteId) {
                                var defaultDeductionConfig = _.find(ApplicationConstants.DefaultPaymentRateDeductions, function (r) { return r.RateTypeId === paymentRate.RateTypeId; })
                                var subdivisionId = AssignmentApiService.getSubdivisionIdByWorksiteId(this.WorksiteId);
                                if (defaultDeductionConfig) {
                                    var defaultConfig = _.find(defaultDeductionConfig.defaults, function (config) { return config.SubdivisionId == subdivisionId; })
                                    if (defaultConfig) {
                                        if (paymentRate.IsApplyVacation != defaultConfig.IsApplyVacation || paymentRate.IsApplyDeductions != defaultConfig.IsApplyDeductions) {
                                            isChanged = true;
                                        }
                                        paymentRate.IsApplyVacation = defaultConfig.IsApplyVacation;
                                        paymentRate.IsApplyDeductions = defaultConfig.IsApplyDeductions;
                                    }
                                }
                            }

                        }.bind(this));
                    }.bind(this));
                    return isChanged;
                },

                rateTypesMirroring: function (defaults) {
                    var rateTypeIds = [];

                    if (this.BillingInfoes[0].OrganizationId === 0) {
                        this.BillingInfoes[0].Hours = 0;
                        angular.forEach(this.BillingInfoes, function (bi) {
                            bi.Hours = this.BillingInfoes[0].Hours;
                        }.bind(this));
                        angular.forEach(this.PaymentInfoes, function (paymentInfo) {
                            paymentInfo.Hours = this.BillingInfoes[0].Hours;
                        }.bind(this));
                    }

                    angular.forEach(this.BillingInfoes[0].BillingRates, function (billingRate) {
                        if (billingRate.RateTypeId && billingRate.RateTypeId > 0) {
                            rateTypeIds.push(billingRate.RateTypeId);
                        }
                    }.bind(this));

                    //  modify PaymentInfoes
                    angular.forEach(this.PaymentInfoes, function (paymentInfo) {

                        //  Add PaymentRates
                        angular.forEach(rateTypeIds, function (rateTypeId) {
                            var count = _.filter(paymentInfo.PaymentRates, function (paymentRate) {
                                return rateTypeId == paymentRate.RateTypeId;
                            }).length;
                            if (count === 0) {
                                var newPaymentRate = angular.copy(defaults.paymentRate);
                                newPaymentRate.RateTypeId = rateTypeId;
                                if (this.WorksiteId) {
                                    var defaultDeductionConfig = _.find(ApplicationConstants.DefaultPaymentRateDeductions, function (r) { return r.RateTypeId === rateTypeId; })
                                    var subdivisionId = AssignmentApiService.getSubdivisionIdByWorksiteId(this.WorksiteId);
                                    if (defaultDeductionConfig) {
                                        var defaultConfig = _.find(defaultDeductionConfig.defaults, function (config) { return config.SubdivisionId == subdivisionId; })
                                        if (defaultConfig) {
                                            newPaymentRate.IsApplyVacation = defaultConfig.IsApplyVacation;
                                            newPaymentRate.IsApplyDeductions = defaultConfig.IsApplyDeductions;
                                        }
                                    }
                                }
                                
                                newPaymentRate.BrokenRules = {};
                                paymentInfo.PaymentRates.push(newPaymentRate);
                            }
                        }.bind(this));

                        //  remove  PaymentRates
                        angular.forEach(paymentInfo.PaymentRates, function (paymentRate) {
                            var count = _.filter(rateTypeIds, function (rateTypeId) {
                                return rateTypeId == paymentRate.RateTypeId;
                            }).length;
                            if (count === 0) {
                                var index = paymentInfo.PaymentRates.indexOf(paymentRate);
                                if (index >= 0) paymentInfo.PaymentRates.splice(index, 1);
                            }

                        }.bind(this));

                    }.bind(this));

                    //  modify BillingInfoes (except first one from array)
                    angular.forEach(this.BillingInfoes, function (billingInfo) {
                        if (billingInfo != this.BillingInfoes[0]) {

                            //  Add BillingRates
                            angular.forEach(rateTypeIds, function (rateTypeId) {
                                var count = _.filter(billingInfo.BillingRates, function (billingRate) {
                                    return rateTypeId == billingRate.RateTypeId;
                                }).length;
                                if (count === 0) {
                                    var newBillingRate = angular.copy(defaults.billingRate);
                                    newBillingRate.RateTypeId = rateTypeId;
                                    newBillingRate.BrokenRules = {};
                                    billingInfo.BillingRates.push(newBillingRate);
                                }
                            }.bind(this));

                            //  remove BillingRates
                            angular.forEach(billingInfo.BillingRates, function (billingRate) {
                                var count = _.filter(rateTypeIds, function (rateTypeId) {
                                    return rateTypeId == billingRate.RateTypeId;
                                }).length;
                                if (count === 0) {
                                    var index = billingInfo.BillingRates.indexOf(billingRate);
                                    if (index >= 0) billingInfo.BillingRates.splice(index, 1);
                                }

                            });
                        }
                    }.bind(this));
                },

                paymentPartyRateUnitsMirroring: function (paymentRates) {
                    if (this.PaymentInfoes.length <= 1) {
                        return;
                    }

                    if (!angular.isArray(paymentRates)) {
                        paymentRates = [paymentRates];
                    }

                    angular.forEach(paymentRates, function (rate) {

                        angular.forEach(this.PaymentInfoes, function (paymentInfo, key) {

                            var paymentRate = _.find(paymentInfo.PaymentRates, function (paymentRate) {
                                return rate.RateTypeId == paymentRate.RateTypeId;
                            });

                            // Don't update the input rate
                            if (!paymentRate || paymentRate == rate) {
                                return;
                            }

                            paymentRate.RateUnitId = rate.RateUnitId;

                        }.bind(this));

                    }.bind(this));
                }
            });
        }
    ]);
})(angular);