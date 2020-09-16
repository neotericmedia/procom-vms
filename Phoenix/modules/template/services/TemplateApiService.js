(function () {
    'use strict';

    var serviceId = 'TemplateApiService';
    angular.module('phoenix.template.services').factory(serviceId, ['phoenixapi', 'SmartTableService', TemplateApiService]);

    function TemplateApiService(phoenixapi, SmartTableService) {

        var service = {
            get: get,
            getTemplatesByEntityTypeIdAndTableState: getTemplatesByEntityTypeIdAndTableState,
            getTemplatesByEntityTypeId: getTemplatesByEntityTypeId,

            assignmentToTemplate: assignmentToTemplate,
            commissionToTemplate: commissionToTemplate,

            templateNew: templateNew,
            updateTemplateBody: updateTemplateBody,
            updateTemplateSettings: updateTemplateSettings,
        };


        return service;

        // Queries
        function get(id) {
            if (id && !isNaN(id)) {
                return phoenixapi.query('template/' + id);
            } else {
                return phoenixapi.query('template');
            }
        }
        function getTemplatesByEntityTypeIdAndTableState(tableState, oDataParams, entityTypeId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('template/getTemplatesByEntityTypeId/' + entityTypeId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getTemplatesByEntityTypeId(entityTypeId) {
            var filter = oreq.filter('StatusId').eq(1);
            var params = oreq.request().withFilter(filter).url();
            return phoenixapi.query('template/getTemplatesByEntityTypeId/' + entityTypeId + '?' + params);
        }

        // Commands
        function templateNew(command) {
            command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("TemplateNew", command);
        }

        function updateTemplateBody(command) {
            command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("UpdateTemplateBody", command);
        }

        function updateTemplateSettings(command) {
            command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("UpdateTemplateSettings", command);
        }


        function changeEntityChain(obj, changeObjects, changeValues) {
            var objects = [];

            var forEachChangeObjects = function (index, objectModified, changeObject) {
                if (index == changeObject.key) {
                    obj[index] = changeObject.value;
                    objectModified = true;
                }
            };

            var forEachChangeValues = function (index, changeValue) {
                if (index == changeValue.key) {
                    obj[index] = changeValue.value;
                }
            };

            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                if (typeof obj[i] == 'object') {
                    var objectModified = false;
                    angular.forEach(changeObjects, forEachChangeObjects.bind(null, i, objectModified));
                    if (!objectModified) {
                        objects = objects.concat(changeEntityChain(obj[i], changeObjects, changeValues));
                    }
                } else {
                    angular.forEach(changeValues, forEachChangeValues.bind(null, i));
                }
            }
            return obj;
        }

        function assignmentToTemplate(sourceAssignment, workOrderIndex, workOrderVersionIndex) {
            var assignmentCopied = {};
            assignmentCopied.Id = 0;
            assignmentCopied.StatusId = ApplicationConstants.WorkOrderStatus.New;
            assignmentCopied.OrganizationIdInternal = sourceAssignment.OrganizationIdInternal;
            assignmentCopied.OrganizationCode = sourceAssignment.OrganizationCode;
            assignmentCopied.UserProfileIdWorker = sourceAssignment.UserProfileIdWorker;

            assignmentCopied.WorkOrders = [];
            assignmentCopied.WorkOrders.push(angular.copy(sourceAssignment.WorkOrders[workOrderIndex]));
            assignmentCopied.WorkOrders[0].WorkOrderNumber = 1;
            assignmentCopied.WorkOrders[0].WorkOrderVersion = 1;
            assignmentCopied.WorkOrders[0].WorkOrderVersions = [];
            assignmentCopied.WorkOrders[0].WorkOrderVersions.push(angular.copy(sourceAssignment.WorkOrders[workOrderIndex].WorkOrderVersions[workOrderVersionIndex]));
            // Cleanup WorkOrderVersion
            assignmentCopied.WorkOrders[0].WorkOrderVersions[0].VersionNumber = 1;
            delete assignmentCopied.WorkOrders[0].WorkOrderVersions[0].extended; // WorkOrderDetailModel

            var result = changeEntityChain(assignmentCopied,
                [{ key: 'Assignment', value: null },
                 { key: 'WorkOrder', value: null },
                 { key: 'WorkOrderVersion', value: null },
                 { key: 'BillingInfo', value: null },
                 { key: 'PaymentInfo', value: null },
                 { key: 'Organization', value: null },
                 { key: 'UserProfile', value: null },
                 { key: 'PaymentContact1', value: null },
                 { key: 'PaymentContact2', value: null },
                 { key: 'CreatedDatetime', value: null },
                 { key: 'LastModifiedDatetime', value: null },
                 { key: 'WorkOrderPurchaseOrderLines', value: [] }
                ],
                 [{ key: 'Id', value: 0 },
                 { key: 'IsDraft', value: true },
                 { key: 'StatusId', value: ApplicationConstants.WorkOrderStatus.New },
                 { key: 'AssignmentId', value: 0 },
                 { key: 'WorkOrderId', value: 0 },
                 { key: 'WorkOrderVersionId', value: 0 },
                 { key: 'BillingInfoId', value: 0 },
                 { key: 'PaymentInfoId', value: 0 },
                 { key: 'SourceId', value: null },
                 { key: 'LastModifiedByProfileId', value: 0 },
                 { key: 'CreatedByProfileId', value: 0 }]
             );
            return result;
        }

        function commissionToTemplate(commissionRoleId, commissionRateTypeId, commissionDescription, percentage, commissionRateRestrictions) {
            var result = changeEntityChain({
                CommissionRoleId: commissionRoleId ? parseInt(commissionRoleId, 10) : null,
                CommissionRateTypeId: commissionRateTypeId ? parseInt(commissionRateTypeId, 10) : null,
                Description: commissionDescription,
                CommissionRateHeaderStatusId: ApplicationConstants.CommissionRateHeaderStatus.New,
                CommissionRateRestrictions: commissionRateRestrictions,
                CommissionRateVersions: [
                    {
                        Percentage: percentage ? parseFloat(percentage) : null,
                        CommissionRateVersionStatusId: ApplicationConstants.CommissionRateVersionStatus.New,
                        ScheduledChangeRateApplicationId: ApplicationConstants.ScheduledChangeRateApplication.AllWorkOrders
                    }],
                TemplateMetadatas: (commissionRateTypeId ? [{"TemplateMetadataName": "CommissionRateTypeId", "TemplateMetadataValue": parseInt(commissionRateTypeId, 10) }] : null)
            },
            [
                { key: 'CommissionUserProfile', value: null },
            ],
            [
                { key: 'Id', value: 0 },
                { key: 'IsDraft', value: true },
                { key: 'CommissionRateHederStatusId', value: ApplicationConstants.CommissionRateHeaderStatus.New },
                { key: 'CommissionRateVersionStatusId', value: ApplicationConstants.CommissionRateVersionStatus.New },
                { key: 'CommissionRateHeaderId', value: 0 },
                { key: 'CommissionUserProfileId', value: 0 },
                { key: 'CommissionUserProfileFirstName', value: '' },
                { key: 'CommissionUserProfileLastName', value: '' },
                { key: 'SourceId', value: null },
                { key: 'LastModifiedByProfileId', value: 0 },
                { key: 'CreatedByProfileId', value: 0 }
            ]
            );

            return result;
        }
    }
})();