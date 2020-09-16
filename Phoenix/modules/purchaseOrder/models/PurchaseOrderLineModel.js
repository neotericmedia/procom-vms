(function (angular) {
    'use strict';
    angular.module('phoenix.purchaseOrder.models').factory('PurchaseOrderLineModel', ['Base',
        function (Base) {
            return Base.extend({
                beforeMixingInto: function (obj) {

                },
                extended: true,
                amountCommitedTotal: function () {
                    var total = 0;
                    _.each(this.WorkOrderPurchaseOrderLines, function (link) {

                        total += isNaN(parseFloat(link.AmountCommited)) ? 0 : parseFloat(link.AmountCommited);
                    });
                    
                    return total;
                },
                amountSpentTotal: function () {
                    var total = 0;
                    _.each(this.WorkOrderPurchaseOrderLines, function (link) {
                        total += isNaN(parseFloat(link.AmountSpent)) ? 0 : parseFloat(link.AmountSpent);
                    });

                    return !total || isNaN(total) ? 0 : total;
                },
                amountResevedTotal: function () {
                    var total = 0;
                    _.each(this.WorkOrderPurchaseOrderLines, function (link) {
                        total += isNaN(parseFloat(link.AmountReserved)) ? 0 : parseFloat(link.AmountReserved);
                    });

                    return !total || isNaN(total) ? 0 : total;
                },
                fundsAvailable: function () {
                    return this.Amount - this.amountCommitedTotal();
                },
                amountAllowed: function () {
                    var total = this.Amount;
                    _.each(this.PurchaseOrderLines, function (pol) {
                        _.each(pol.WorkOrderPurchaseOrderLines, function (link) {
                            total -= (isNaN(parseFloat(link.AmountCommited))) ? 0 : parseFloat(link.AmountCommited);
                        });
                    });
                    return total;
                },
                validate: function(messageDest) {
                    var isValid = true;
                    var messages = [];
                    if (this.fundsAvailable() < 0) {
                        messages.push({ PropertyName: '', Category: 3, Code: null, Message: "The amount committed cannot be greater than the funds available" });
                        isValid = false;
                    }
                    angular.forEach(this.WorkOrderPurchaseOrderLines, function (segLine) {
                        var commited = parseFloat(segLine.AmountCommited);
                        var reserved = parseFloat(segLine.AmountReserved);
                        var spent = parseFloat(segLine.AmountSpent);
                        var propName = '';
                        if (commited - reserved - spent < 0) {
                            propName = '' + segLine.AssignmentId + '.' + segLine.WorkOrderNumber + ' - Amount Committed';
                            messages.push({ PropertyName: propName, Category: 3, Code: null, Message: " must be greater than Funds Reserved + Funds Spent" });
                            isValid = false;
                        }
                        if (isNaN(commited)) {
                            propName = '' + segLine.AssignmentId + '.' + segLine.WorkOrderNumber + ' - Amount Committed';
                            messages.push({ PropertyName: propName, Category: 3, Code: null, Message: " must have a value" });
                            isValid = false;
                        }
                    });
                    if (messageDest) {
                        messages.forEach(function(i) { messageDest.push(i); });
                    }
                    return isValid;
                }

            });
        }
    ]);
})(angular);