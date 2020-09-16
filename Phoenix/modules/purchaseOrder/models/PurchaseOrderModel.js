(function (angular) {
    'use strict';
    angular.module('phoenix.purchaseOrder.models').factory('PurchaseOrderModel', ['Base','PurchaseOrderLineModel',
        function (Base, PurchaseOrderLineModel) {
            return Base.extend({
                beforeMixingInto: function (obj) {
                    obj.PurchaseOrderLines.forEach(function(i) {
                        PurchaseOrderLineModel.mixInto(i);
                    });

                },
                extended: true,
                minLineId: -1,
                addLine: function() {
                    var nextId = this.minLineId--;
                    var newLine = angular.copy(this.purchaseOrderLineDefaults);
                    newLine.Id = nextId;
                    this.PurchaseOrderLines.push(newLine);
                    return newLine;
                },
                amountTotal: function () {
                    return _.reduce(this.PurchaseOrderLines, function (total, pol) {
                        return total + (pol.Amount ? parseFloat(pol.Amount) : 0);
                    }, 0);
                },
                amountCommitedTotal: function () {
                    var total = 0;
                    _.each(this.PurchaseOrderLines, function (pol) {
                        _.each(pol.WorkOrderPurchaseOrderLines, function (link) {
                            total += link.AmountCommited ? parseFloat(link.AmountCommited) : 0;
                        });
                    });
                    return total;
                },
                amountSpentTotal: function () {
                    var total = 0;
                    _.each(this.PurchaseOrderLines, function (link) {
                        _.each(link.WorkOrderPurchaseOrderLines, function (wopol) {
                            total += wopol.AmountSpent ? parseFloat(wopol.AmountSpent) : 0;
                        });
                    });
                    return total;
                },
                validate: function(messageDest) {
                    var result = true;
                    this.PurchaseOrderLines.forEach(this.PurchaseOrderLines, function(pol) {
                        if (!pol.validate(messageDest)) {
                            result = false;
                        }
                    });
                    return result;
                },
                getMaxLastModified: function(){
                    if (!this.LastModifiedDatetime) return new Date(Date.now());
                    var dates = [this.LastModifiedDatetime];
                    _.each(this.PurchaseOrderLines, function(pol){
                        if (!pol.LastModifiedDatetime || typeof pol.LastModifiedDatetime === 'string') return;
                        dates.push(pol.LastModifiedDatetime);
                        _.each(pol.WorkOrderPurchaseOrderLines, function(wopol){
                            if (!wopol.LastModifiedDatetime || typeof wopol.LastModifiedDatetime === 'string') return;
                            dates.push(wopol.LastModifiedDatetime);
                        });
                    });
                    if (this.__deletedPurchaseOrderLines){
                        dates = dates.concat(this.__deletedPurchaseOrderLines);
                    }
                    return new Date(Math.max.apply(Math, dates));
                }
            });
        }
    ]);
})(angular);