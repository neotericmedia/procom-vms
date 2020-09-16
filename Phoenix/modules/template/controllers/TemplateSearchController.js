
(function () {
    var app = angular.module('phoenix.template.controllers');
    app.controller('TemplateSearchController', [
        '$scope', '$state', 'NavigationService', 'TemplateApiService', '$rootScope', 'CodeValueService', TemplateSearchController]);

    function TemplateSearchController($scope, $state, NavigationService, TemplateApiService, $rootScope, CodeValueService) {

        function getEntityTypeId() {
            var entityTypeId = null;
            if ($state.current.name == 'template.search') {
                entityTypeId = ApplicationConstants.EntityType.Assignment;
            }
            else if ($state.current.name == 'commission.templatesearch') {
                entityTypeId = ApplicationConstants.EntityType.CommissionRateHeader;
            }

            return entityTypeId;
        }

        $scope.entityTypeId = getEntityTypeId();

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        if ($state.current.name == 'template.search') {
            NavigationService.setTitle('Search Work Order Templates', 'icon icon-commission');
        } else {
            NavigationService.setTitle('Search Commission Templates', 'icon icon-commission');
        }
        

        $scope.model = {};
        $scope.model.search = '';

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.isLoading = true;

        // Used for the loading bar
        $scope.loadItemsPromise = null;

        //var templateDataParams = oreq.request().withExpand(['TemplateMetadatas']).withSelect(['Id', 'Name', 'Description', 'EntityTypeId', 'EntityTemplate',
        //    'CreatedByProfileId', 'CreatedDateTime', 'LastModifiedByProfileId', 'LastModifiedDateTime', 'IsDraft', 'IsPrivate', 'CreatedByFirstName',
        //    'CreatedByLastName', 'CreatedByFullName',
        //'TemplateMetadatas/TemplateMetadataName', 'TemplateMetadatas/TemplateMetadataValue']).url();
        var templateDataParams = '';

        // Reloading data entry point
        $scope.callServer = function (tableState) {

            $scope.currentPage = $scope.currentPage || 1;

            var isPaging = false;

            // full refresh
            if (tableState.pagination.start === 0) {
                angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                $scope.currentPage = 1;
                isPaging = false;
            }
                // pagination
            else {
                $scope.currentPage++;
                isPaging = true;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;
            

            if (tableState) {
                $scope._tableState = tableState;
                if (tableState.search.predicateObject) {
                    var templateMetadataValue = tableState.search.predicateObject["TemplateMetadatas/TemplateMetadataValue"];
                    templateDataParams = "";
                    if (templateMetadataValue) {
                        templateDataParams = oreq.request().url();
                        var temp = [];
                        for (var i = 0; i < templateMetadataValue.length; i++) {
                            var item = templateMetadataValue[i];
                            temp.push("TemplateMetadatas/any(t: t/TemplateMetadataName eq 'CommissionRateTypeId' and t/TemplateMetadataValue eq "+item+")");
                        }
                        templateDataParams = "&$filter=(" + temp.join(" or ") + ")" + templateDataParams;                        
                    }
                    delete tableState.search.predicateObject["TemplateMetadatas/TemplateMetadataValue"];
                }
            }

            var promise = TemplateApiService.getTemplatesByEntityTypeIdAndTableState(tableState, templateDataParams, $scope.entityTypeId)
               .then(function (response) {
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(response.Items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = response.Items;
                   }
               });

            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        $scope.templateControl = {};

        $scope.rowCallback = function (rowaction, item) {
            switch (rowaction) {
                case 'click':
                    break;
                case 'view':
                    $scope.loadTemplate(item);
                    break;
                case 'create':
                    $scope.createItemFromTemplate(item);
                    break;
                case 'settings':
                    $scope.editTemplateSettings(item);
                    break;
            }
        };

        $scope.createItemFromTemplate = function (template) {
            if (template.EntityTypeId == ApplicationConstants.EntityType.Assignment) {
                
            }
            else if (template.EntityTypeId == ApplicationConstants.EntityType.CommissionRateHeader) {
                    
            }
        };

        $scope.editTemplateSettings = function (template) {
            $scope.templateControl.openDialog(template).then(function (result) {
                if (result && result.Name) {
                    angular.forEach($scope.model.data, function (item, index) {
                        if (item.Id == result.Id) {
                            item.Name = result.Name;
                            item.Description = result.Description;
                            item.IsPrivate = result.IsPrivate;
                            return;
                        }
                    });

                    $rootScope.$broadcast('event:template-updated');

                }
            });
        };

        $scope.loadTemplate = function (template) {
            if (template.EntityTypeId == ApplicationConstants.EntityType.Assignment) {
                $state.go('template.workorder.edit.core', {templateId: template.Id});
            }
            else if (template.EntityTypeId == ApplicationConstants.EntityType.CommissionRateHeader) {
                $state.go('commission.templateedit.details', {templateId: template.Id});
            }
        };

        $scope.lists = {
            listCommissionRateType: CodeValueService.getCodeValues(CodeValueGroups.CommissionRateType, true)
        };


    }


}) (angular);