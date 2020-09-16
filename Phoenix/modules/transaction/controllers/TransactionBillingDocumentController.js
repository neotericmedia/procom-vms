(function (app) {
    'use strict';

    var controllerId = 'TransactionBillingDocumentController';


    angular.module('phoenix.transaction.controllers').controller(controllerId, ['$scope', '$rootScope', '$state', 'dialogs', 'CodeValueService', 'DocumentApiService', 'TimesheetApiService', 'phoenixapi',  TransactionBillingDocumentController]);

    function TransactionBillingDocumentController($scope, $rootScope, $state, dialogs, CodeValueService, DocumentApiService, TimesheetApiService, phoenixapi) {

        $scope.model.documents = [];
        $scope.emptyDocList = "";
        $scope.model.transactionTimeSheetId = $scope.model.transactionHeader.TimeSheetId;
        $scope.lists = { documentTypeList: [] };
        $scope.lists.documentTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, ApplicationConstants.EntityType.TransactionHeader, CodeValueGroups.EntityType);

        function toLocalTime(date) {
            if (!date) return null;
            date = moment(date).format('YYYY-MM-DD HH:mm:ss');
            date = moment.utc(date).toDate();
            return date;
        }

        $scope.documentUploadCallbackOnDone = function () { };

        $scope.changeTimesheet = function (timesheetId) {
            $scope.model.transactionHeader.TimeSheetId = timesheetId;
        };

        $scope.viewTimesheet = function () {
            var timesheetId = $scope.model.transactionTimeSheetId;
            if (!timesheetId)
                return;
            var timesheet = _.filter($scope.model.allTimesheets, function (ts) {
                return ts.Id == timesheetId;
            });
            if (timesheet && timesheet[0]) {
                if (timesheet[0].TimeSheetTypeId === ApplicationConstants.TimeSheetType.Imported) {
                    $state.go('timesheet.details', {
                        timesheetId: timesheetId, workOrderId: timesheet[0].WorkOrderId
                    });
                } else {
                    $state.go('ngtwo.m', { p: 'timesheet/' + timesheetId});
                }
            } else {
                $scope.emptyDocList = "*Error with navigation to timesheet.";
            }
        };

        $scope.getEntityDocuments = function () {
            DocumentApiService.getEntityDocuments(ApplicationConstants.EntityType.TransactionHeader, $scope.model.transactionHeader.Id).then(function success(response) {
                _.each(response.Items, function (item) {
                    item.CreatedDatetime = toLocalTime(item.CreatedDatetime);
                    item.LastModifiedDatetime = toLocalTime(item.LastModifiedDatetime);
                });
                $scope.model.documents = response.Items;
                if (response.Items.length === 0)
                    $scope.emptyDocList = "*There are no uploaded documents for this transaction.";
                else $scope.emptyDocList = "";
            });
        };
        $scope.getEntityDocuments();

        $scope.getPdfStreamByPublicId = function (publicId) {
            return DocumentApiService.getPdfStreamByPublicId(publicId);
        };

        $scope.documentDelete = function (document) {
            var dlg = dialogs.confirm('Document Delete', 'This document will be deleted. Continue?');
            dlg.result.then(function (btn) {
                var result = 'Confirmed';
                DocumentApiService.deleteDocumentByPublicId(document.PublicId).then(function () {
                    $scope.getEntityDocuments();
                });
            }, function (btn) {
                var result = 'Not Confirmed';
            });
        };

        var refreshDocumentsListHandler = $rootScope.$on('event:refresh-documents-list', function () {
            $scope.getEntityDocuments();
        });
        $scope.$on("$destroy", function () {
            refreshDocumentsListHandler();
        });
    }

})(angular, Phoenix.App);