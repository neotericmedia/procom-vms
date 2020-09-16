(function (services) {
    'use strict';

    var serviceId = 'PurchaseOrderDataService';
    services.factory(serviceId, ['common', PurchaseOrderDataService]);

    function PurchaseOrderDataService(common) {

        common.setControllerName(serviceId);
        //var $q = common.$q;

        var service = {
            getPurchaseOrderLineDefault: getPurchaseOrderLineDefault, setPurchaseOrderLineDefault: setPurchaseOrderLineDefault,

            getPurchaseOrder: getPurchaseOrder, setPurchaseOrder: setPurchaseOrder,

            getCodeValueLists: getCodeValueLists, setCodeValueLists: setCodeValueLists,

            getClientOrganizationList: getClientOrganizationList, setClientOrganizationList: setClientOrganizationList,

            getValidationMessages: getValidationMessages, setValidationMessages: setValidationMessages,
        };

        var data = {
            purchaseOrderLineDefault: {},
            purchaseOrder: {},

            codeValueLists: {},

            listOrganizationInternal: [],
            listOrganizationClient: [],
            listOrganizationSupplier: [],

            organizationDetail: {},

            canadianIncProfiles: [],
            organizationProfiles: {},

            validationMessages: [],

            showReplacedEntities: false,
        };
        return service;

        function getPurchaseOrderLineDefault() { return angular.copy(data.purchaseOrderLineDefault); }
        function setPurchaseOrderLineDefault(purchaseOrderDefault) { data.purchaseOrderLineDefault = angular.copy(purchaseOrderDefault); }

        function getCodeValueLists() { return data.codeValueLists; }
        function setCodeValueLists(codeValueLists) { data.codeValueLists = codeValueLists; }

        function getClientOrganizationList() { return data.listOrganizationClient; }
        function setClientOrganizationList(listOrganizationClient) { data.listOrganizationClient = listOrganizationClient; }

        function getValidationMessages() { return data.validationMessages; }
        function setValidationMessages(validationMessages) { data.validationMessages = validationMessages; }

        function getPurchaseOrder() { return angular.copy(data.purchaseOrder); }
        function setPurchaseOrder(purchaseOrder) {
            if (common.isEmptyObject(purchaseOrder)) {
                setValidationMessages([]);
            }
            data.purchaseOrder = angular.copy(purchaseOrder);
        }
    }

}(Phoenix.Services));
