(function (services) {
    'use strict';

    var serviceId = 'AssignmentDataService';
    services.factory(serviceId, ['common', AssignmentDataService]);

    function AssignmentDataService(common) {

        common.setControllerName(serviceId);

        var service = {

            getCodeValueLists: getCodeValueLists, setCodeValueLists: setCodeValueLists,

            getDefaultAssignment: getDefaultAssignment, setDefaultAssignment: setDefaultAssignment,
            getDefaultWorkOrderPurchaseOrderLine: getDefaultWorkOrderPurchaseOrderLine, setDefaultWorkOrderPurchaseOrderLine: setDefaultWorkOrderPurchaseOrderLine,

            getAssignment: getAssignment, setAssignment: setAssignment,
            getChangeHistoryModel: getChangeHistoryModel, setChangeHistoryModel: setChangeHistoryModel,
            getAssignmentCopied: getAssignmentCopied, setAssignmentCopied: setAssignmentCopied,

            
            getListOrganizationClient: getListOrganizationClient,
            setListOrganizationClient: setListOrganizationClient,
            delListOrganizationClient: delListOrganizationClient,

            getListOrganizationSupplier: getListOrganizationSupplier,
            setListOrganizationSupplier: setListOrganizationSupplier,
            delListOrganizationSupplier: delListOrganizationSupplier,

            getSalesTaxVersionRatesBySubdivisionAndOrganization: getSalesTaxVersionRatesBySubdivisionAndOrganization,
            setSalesTaxVersionRatesBySubdivisionAndOrganization: setSalesTaxVersionRatesBySubdivisionAndOrganization,

            getListUserProfileWorker: getListUserProfileWorker,
            setListUserProfileWorker: setListUserProfileWorker,
            delListUserProfileWorker: delListUserProfileWorker,

            getProfilesListOrganizational: getProfilesListOrganizational, setProfilesListOrganizational: setProfilesListOrganizational,
            getProfilesListByOrganizationId: getProfilesListByOrganizationId, setProfilesListByOrganizationId: setProfilesListByOrganizationId,

            getValidationMessages: getValidationMessages, setValidationMessages: setValidationMessages,

            getValueShowReplacedEntities: getValueShowReplacedEntities, setValueShowReplacedEntities: setValueShowReplacedEntities,

            getWorkOrderIds: getWorkOrderIds,
            getWorkOrderVersionWithMaxId: getWorkOrderVersionWithMaxId,
            getWorkOrderVersionWithCurrentActiveStatus : getWorkOrderVersionWithCurrentActiveStatus,
            getWorkOrderVersionIndexById: getWorkOrderVersionIndexById,
            getWorkOrderIndexById: getWorkOrderIndexById,
        };

        var data = {
            assignmentDefault: {},
            assignmentCopied: {},
            workOrderPurchaseOrderLineDefault: {},
            assignment: {},
            changeHistoryModel: {},

            codeValueLists: {},

            organizationsListClient: [],
            organizationsListIndependentContractor: [],
            salesTaxVersionRatesBySubdivisionAndOrganization: [],

            profilesListWorker: [],
            profilesListOrganizational: {},
            profilesListByOrganizationId: {},

            validationMessages: [],

            showReplacedEntities: false,
        };
        return service;


        function getWorkOrderIds(assignment, ids) {
            var assignmentId = ids.assignmentId;
            var workOrderId = ids.workOrderId;
            var workOrderVersionId = ids.workOrderVersionId;

            if (assignment) {
                assignmentId = (!assignmentId && assignmentId > 0) ? assignmentId : 0;
                assignmentId = (assignmentId === 0 && assignment.Id && assignment.Id > 0) ? assignment.Id : 0;
                if (workOrderVersionId && workOrderVersionId > 0) {
                    var workOrderIdTmp = 0;
                    angular.forEach(assignment.WorkOrders, function (workOrder) {
                        angular.forEach(workOrder.WorkOrderVersions, function (workOrderVersion) {
                            if (workOrderVersion.Id == workOrderVersionId) {
                                workOrderIdTmp = workOrderVersion.WorkOrderId;
                            }
                        });
                    });
                    workOrderId = workOrderIdTmp;
                } else if (workOrderId && workOrderId > 0) {
                    workOrderVersionId = getWorkOrderVersionWithCurrentActiveStatus(assignment, workOrderId); 
                } else {
                    var workOrderVersionWithMaxId = getWorkOrderVersionWithMaxId(assignment);
                    if (workOrderVersionWithMaxId) {
                        workOrderId = workOrderVersionWithMaxId.WorkOrderId;
                        workOrderVersionId = workOrderVersionWithMaxId.Id;
                    } else {
                        workOrderId = 0;
                        workOrderVersionId = 0;
                    }
                }
            } else {
                assignmentId = assignmentId || 0;
                workOrderId = workOrderId || 0;
                workOrderVersionId = workOrderVersionId || 0;
            }
            ids.assignmentId = assignmentId;
            ids.workOrderId = workOrderId;
            ids.workOrderVersionId = workOrderVersionId;
            return ids;
        }

        function getWorkOrderIndexById(workOrders, workOrderId) {
            var workOrderIndex = 0;
            if (workOrders && workOrderId && workOrders.length > 0) {
                var workOrder = _.find(workOrders, function (workOrder) { return workOrder.Id == workOrderId; });
                workOrderIndex = _.indexOf(workOrders, workOrder);
            }
            if (workOrderIndex < 0) {
                workOrderIndex = 0;
            }
            return workOrderIndex;
        }

        function getWorkOrderVersionIndexById(workOrders, workOrderId, workOrderVersionId) {
            var workOrderVersionIndex = 0;
            var workOrderIndex = getWorkOrderIndexById(workOrders, workOrderId);
            if (workOrders[workOrderIndex].WorkOrderVersions && workOrderVersionId > 0 && workOrders[workOrderIndex].WorkOrderVersions.length > 0) {
                var workOrderVersion = _.find(workOrders[workOrderIndex].WorkOrderVersions, function (workOrderVersion) { return workOrderVersion.Id == workOrderVersionId; });
                workOrderVersionIndex = _.indexOf(workOrders[workOrderIndex].WorkOrderVersions, workOrderVersion);
            }
            if (workOrderVersionIndex < 0) {
                workOrderVersionIndex = 0;
            }
            return workOrderVersionIndex;
        }

        function getWorkOrderVersionWithMaxId(assignment, workOrderId) {
            workOrderId = workOrderId || 0;
            var wovWithMaxId = {};
            var wovId = 0;
            if (workOrderId > 0) {
                var workOrderById = _.find(assignment.WorkOrders, function (workOrder) { return workOrder.Id == workOrderId; });
                wovWithMaxId = _.max(workOrderById.WorkOrderVersions, function (workOrderVersion) { return workOrderVersion.Id; });
                wovId = wovWithMaxId.Id;
            } else {
                angular.forEach(assignment.WorkOrders, function (workOrder) {
                    var wodWithMaxIdPreWO = _.max(workOrder.WorkOrderVersions, function (workOrderVersion) { return workOrderVersion.Id; });
                    if (wodWithMaxIdPreWO.Id > wovId) {
                        wovWithMaxId = wodWithMaxIdPreWO;
                        wovId = wovWithMaxId.Id;
                    }
                });
            }
            if (wovId > 0) {
                return wovWithMaxId;
            } else {
                return null;
            }
        }

        function getWorkOrderVersionWithCurrentActiveStatus(assignment, workOrderId) { 
            workOrderId = workOrderId || 0;
            var wovCas = {};
            var wovId = 0;
          
            var workOrderById = _.find(assignment.WorkOrders, function (workOrder) { return workOrder.Id == workOrderId; }); 
            var wovCas = _.filter(workOrderById.WorkOrderVersions, function (workOrderVersion) { return workOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Active; });
            var wovCas = _.filter(wovCas, function (w) { return moment(w.EffectiveDate).diff(moment(new Date())) <= 0 }); 
            var wovCas = _.orderBy(wovCas, [function (w) { return new Date(w.EffectiveDate); }], ['desc']);
           
            wovId = wovCas.length > 0 ? wovCas[0].Id : getWorkOrderVersionWithMaxId(assignment, workOrderId).Id; 
            return wovId;
        }

        function getValueShowReplacedEntities() { return angular.copy(data.showReplacedEntities); }
        function setValueShowReplacedEntities(showReplacedEntities) { data.showReplacedEntities = angular.copy(showReplacedEntities); }

        function getDefaultAssignment() { return angular.copy(data.assignmentDefault); }
        function setDefaultAssignment(assignmentDefault) { data.assignmentDefault = angular.copy(assignmentDefault); }

        function getDefaultWorkOrderPurchaseOrderLine() { return angular.copy(data.workOrderPurchaseOrderLineDefault); }
        function setDefaultWorkOrderPurchaseOrderLine(workOrderPurchaseOrderLineDefault) { data.workOrderPurchaseOrderLineDefault = angular.copy(workOrderPurchaseOrderLineDefault); }

        function getAssignmentCopied() { return angular.copy(data.assignmentCopied); }
        function setAssignmentCopied(assignmentCopied) { data.assignmentCopied = angular.copy(assignmentCopied); }

        function getCodeValueLists() { return angular.copy(data.codeValueLists); }
        function setCodeValueLists(codeValueLists) { data.codeValueLists = angular.copy(codeValueLists); }

        function delListOrganizationClient() { data.organizationsListClient = []; }
        function getListOrganizationClient() { return angular.copy(data.organizationsListClient); }
        function setListOrganizationClient(organizationsListClient) { data.organizationsListClient = angular.copy(organizationsListClient); }

        function delListOrganizationSupplier() { data.organizationsListIndependentContractor = []; }
        function getListOrganizationSupplier() { return angular.copy(data.organizationsListIndependentContractor); }
        function setListOrganizationSupplier(organizationsListIndependentContractor) { data.organizationsListIndependentContractor = angular.copy(organizationsListIndependentContractor); }

        function getSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId) {
            if (!common.isEmptyObject(data.salesTaxVersionRatesBySubdivisionAndOrganization[subdivisionIdSalesTax])) {
                return angular.copy(data.salesTaxVersionRatesBySubdivisionAndOrganization[subdivisionIdSalesTax][organizationId]);
            }
            else {
                return [];
            }
        }
        function setSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId, listSalesTaxVersionRatesBySubdivisionAndOrganization) {
            if (common.isEmptyObject(data.salesTaxVersionRatesBySubdivisionAndOrganization[subdivisionIdSalesTax])) {
                data.salesTaxVersionRatesBySubdivisionAndOrganization[subdivisionIdSalesTax] = [];
            }
            data.salesTaxVersionRatesBySubdivisionAndOrganization[subdivisionIdSalesTax][organizationId] = angular.copy(listSalesTaxVersionRatesBySubdivisionAndOrganization);
        }
   
        function delListUserProfileWorker() { data.profilesListWorker = []; }
        function getListUserProfileWorker() { 
            // 15634 - workers belonging to certain profileTypes should not appear if they are missing an org
            var workers = angular.copy(data.profilesListWorker).filter(
                function(item) {
                    return (item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc ||
                               item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerSubVendor ||
                               item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC)?
                        (item.OrganizationId != null) : true;
                });
            return workers;
        }
        function setListUserProfileWorker(profilesListWorker) { data.profilesListWorker = angular.copy(profilesListWorker); }

        function getProfilesListOrganizational(organizationId) { return angular.copy(data.profilesListOrganizational[organizationId]); }
        function setProfilesListOrganizational(organizationId, profilesListOrganizational) { data.profilesListOrganizational[organizationId] = angular.copy(profilesListOrganizational); }

        function getProfilesListByOrganizationId(organizationId) { return angular.copy(data.profilesListByOrganizationId[organizationId]); }
        function setProfilesListByOrganizationId(organizationId, profilesListByOrganizationId) { data.profilesListByOrganizationId[organizationId] = angular.copy(profilesListByOrganizationId); }

        function getValidationMessages() { return data.validationMessages; }
        function setValidationMessages(validationMessages) { data.validationMessages = validationMessages; }

        function getChangeHistoryModel(entityTypeId) { return angular.copy(data.changeHistoryModel[entityTypeId]); }
        function setChangeHistoryModel(entityTypeId, changeHistoryData) { data.changeHistoryModel[entityTypeId] = angular.copy(changeHistoryData); }

        function getAssignment() { return angular.copy(data.assignment); }
        function setAssignment(assignment) {
            if (common.isEmptyObject(assignment)) {
                setValidationMessages([]); data.changeHistoryModel = {};
                //data.workflowHistoryModel = {};
            } data.assignment = angular.copy(assignment);
        }
    }

}(Phoenix.Services));
