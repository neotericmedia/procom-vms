(function () {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('InternalCommissionController', InternalCommissionController);

    InternalCommissionController.$inject = ['$state', 'CodeValueService', 'contactService', 'profile'];
    function InternalCommissionController($state, CodeValueService, contactService, profile) {
        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            commissionStructureTypeList: CodeValueService.getCodeValues(CodeValueGroups.CommissionStructureType, true),
            taxNumbers: CodeValueService.getCodeValues(CodeValueGroups.SalesTax),
            addSalesTax: addSalesTax,
            removeSalesTax: removeSalesTax,
            removeAllSalesTax: removeAllSalesTax,
            clearProfileDetails: clearProfileDetails,
        });

        function addSalesTax(mainScope) {
            mainScope.currentProfile.UserProfileInternalTaxNumbers.push(contactService.defaultTaxNumber(mainScope.currentProfile.Id, mainScope.currentProfile.ProfileTypeId));
        }

        function removeSalesTax(mainScope, salesTax) {
            var index = mainScope.currentProfile.UserProfileInternalTaxNumbers.indexOf(salesTax);
            if (index >= 0) {
                mainScope.currentProfile.UserProfileInternalTaxNumbers.splice(index, 1);
            }
        }

        function removeAllSalesTax(mainScope) {
            mainScope.currentProfile.UserProfileInternalTaxNumbers.length = 0;
        }

        function clearProfileDetails(mainScope) {
            mainScope.currentProfile.PayeeName = null;
            mainScope.currentProfile.CommissionStructureTypeId = ApplicationConstants.CommissionStructureType.BasePlusCommission;
            mainScope.currentProfile.IsIncorporated = null;
            removeAllSalesTax(mainScope);
        }
    }
})();