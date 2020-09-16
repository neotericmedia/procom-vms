/// <reference path="../../../../libs/jquery/jquery-1.9.1.js" />
/// <reference path="../../../../libs/jquery/jquery-1.9.1.intellisense.js" />
/// <reference path="../../../../libs/angular/angular.js" />
(function (directives) {
    'use strict';
    /**
           @name directives.utilityDataChangeTracker
           @description
           Used as show entity changes
           
           Attributes:
                data-culture-Id        - (int) cultureId (48)
                data-entity-type-id    - (int) "ApplicationConstants.EntityType.TimeSheet" or entity type id (parent table  id to choose related document Type IDs)
                data-entity-id         - (int) entity.Id
                data-template-url      - template url path (optinal)
   
           example:   

           $scope.model.changeHistoryBlackList = [
                    { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' }
                    , { TableSchemaName: '', TableName: '', ColumnName: 'Id' }
                    , { TableSchemaName: 'workorder', TableName: 'WorkOrder', ColumnName: 'WorkOrderVersion' }
            ];


           <utility-data-change-tracker
                data-culture-id="model.cultureId"
                data-entity-type-id="ApplicationConstants.EntityType.PurchaseOrder"
                data-entity-id="model.entity.Id"
                data-get-by-capture-type="getByAuditHistoryTable"
                data-template-url="/Phoenix/modules/utility/views/DataChangeTrackDefault.html"
                data-black-list="model.changeHistoryBlackList"
            ></utility-data-change-tracker>
       **/
    directives.directive('utilityDataChangeTracker', ['$http', '$templateCache', '$compile', '$filter', function ($http, $templateCache, $compile, $filter) {
        var getTemplate = function (templateUrl) {
            return $http.get(templateUrl, { cache: $templateCache });
        };
        return {
            restrict: 'E',
            scope:
            {
                cultureId: '=',
                entityTypeId: '=',
                entityId: '=',
                getByCaptureType: '=',
                blackList: '='
            },
            transclude: true,
            controller: ['$scope', '$attrs', '$element', 'common', 'UtilityDataChangeTrackerApiService', 'AssignmentDataService', 'CodeValueService', function ($scope, $attrs, $element, common, UtilityDataChangeTrackerApiService, AssignmentDataService, CodeValueService) {

                common.setControllerName('utilityDataChangeTracker');

                $scope.data = {};

                var globalBlackList = [
                    { TableSchemaName: '', TableName: '', ColumnName: 'SysStartTime' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'SysEndTime' }
                ];

                $scope.getModel = function () {

                    function changeHistoryModelBuilder(data) {
                        $scope.data = data || [];
                        angular.forEach($scope.data, function (set) {
                            set.numberOfChangesToShow = 0;

                            angular.forEach(set.Tables, function (table) {

                                angular.forEach(table.Columns, function (column) {

                                    var itemIsBlack = _.some(($scope.blackList || []).concat(globalBlackList), function (blackItem) {
                                        return (
                                            blackItem.TableSchemaName == table.SchemaName &&
                                            blackItem.TableName == table.Name &&
                                            blackItem.ColumnName == column.Name) ||
                                           (blackItem.TableSchemaName.length === 0 &&
                                                    blackItem.TableName == table.Name &&
                                                    blackItem.ColumnName == column.Name) ||
                                            (blackItem.TableSchemaName.length === 0 &&
                                                blackItem.TableName.length === 0 &&
                                                blackItem.ColumnName == column.Name);
                                    });
                                    column.itemIsBlack = itemIsBlack;
                                    if (!itemIsBlack) {
                                        set.numberOfChangesToShow++;
                                    }

                                    if (column.Name == 'Metadata') {
                                        if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                                            table.oldValuesMetadata = $scope.$eval(column.OldValue.Value);
                                            if ($scope.entityTypeId == ApplicationConstants.EntityType.WorkOrder && table.oldValuesMetadata.EffectiveDate) {
                                                set.oldValuesEffectiveDate = table.oldValuesMetadata.EffectiveDate;
                                            }
                                        }
                                        if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                                            table.newValuesMetadata = $scope.$eval(column.NewValue.Value);
                                            if ($scope.entityTypeId == ApplicationConstants.EntityType.WorkOrder && table.newValuesMetadata.EffectiveDate) {
                                                set.newValuesEffectiveDate = table.newValuesMetadata.EffectiveDate;
                                            }
                                        }
                                    }

                                    if (column.Name == 'LastModifiedDatetime' || column.Name == 'CreatedDatetime' ||
                                        column.Name == 'StartDate' || column.Name == 'EndDate' ||
                                        column.Name == 'EffectiveDate' || column.Name == 'TerminationDate' ||
                                        column.Name == 'UploadedDatetime' || column.Name == 'UpdateDate' ||
                                        column.Name == 'RequestTime' || column.Name == 'SendTime' ||
                                        column.Name == 'OrgReqDate' || column.Name == 'UpdateDate' ||
                                        column.Name == 'ExpiryDate' || column.Name == 'SpentDate' ||
                                        column.Name == 'ApprovedOn' || column.Name == 'DateOfBirth'
                                        ) {
                                        if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                                            column.OldValue.DisplayValue = $filter('date')(column.OldValue.Value, ApplicationConstants.formatDate);//ApplicationConstants.formatDateTimeHMS
                                        }
                                        if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                                            column.NewValue.DisplayValue = $filter('date')(column.NewValue.Value, ApplicationConstants.formatDate);
                                        }
                                    }

                                    if (table.Name == 'ClientBasedEntityCustomFieldValue' && column.Name.indexOf('Datepicker') !== -1) {
                                        if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                                            column.OldValue.DisplayValue = $filter('date')(column.OldValue.Value, ApplicationConstants.formatDate);//ApplicationConstants.formatDateTimeHMS
                                        }
                                        if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                                            column.NewValue.DisplayValue = $filter('date')(column.NewValue.Value, ApplicationConstants.formatDate);
                                        }
                                    }

                                    if ($scope.entityTypeId == ApplicationConstants.EntityType.Organization || $scope.entityTypeId == ApplicationConstants.EntityType.UserProfile) {
                                        if (table.Name == 'PaymentMethod' && (column.Name == 'IsSelected' || column.Name == 'IsPreferred')) {
                                            if (column.Metadata && column.Metadata.length > 0) {
                                                var metadataPaymentMethodType = $scope.$eval(column.Metadata);
                                                if (metadataPaymentMethodType.PaymentMethodTypeId) {
                                                    var textPaymentMethodType = CodeValueService.getCodeValue(metadataPaymentMethodType.PaymentMethodTypeId, CodeValueGroups.PaymentMethodType).text;
                                                    column.DisplayName = textPaymentMethodType + ' ' + column.DisplayName;
                                                }
                                            }
                                        }
                                    }

                                    if ($scope.entityTypeId == ApplicationConstants.EntityType.UserProfile) {
                                        if (table.Name == 'UserProfileWorkerSourceDeduction' && column.Name == 'IsApplied') {
                                            if (column.Metadata && column.Metadata.length > 0) {
                                                var sourceDeductionType = $scope.$eval(column.Metadata);
                                                if (sourceDeductionType.SourceDeductionTypeId) {
                                                    var textsourceDeductionType = CodeValueService.getCodeValue(sourceDeductionType.SourceDeductionTypeId, CodeValueGroups.SourceDeductionType).text;
                                                    column.DisplayName = textsourceDeductionType + ' ' + column.DisplayName;
                                                }
                                            }
                                        }
                                        if (table.Name == 'UserProfileWorkerOtherEarning' && column.Name == 'IsApplied') {
                                            if (column.Metadata && column.Metadata.length > 0) {
                                                var paymentOtherEarningType = $scope.$eval(column.Metadata);
                                                if (paymentOtherEarningType.PaymentOtherEarningTypeId) {
                                                    var textPaymentOtherEarningType = CodeValueService.getCodeValue(paymentOtherEarningType.PaymentOtherEarningTypeId, CodeValueGroups.PaymentOtherEarningType).text;
                                                    column.DisplayName = textPaymentOtherEarningType + ' ' + column.DisplayName;
                                                }
                                            }
                                        }
                                    }

                                    if ($scope.entityTypeId == ApplicationConstants.EntityType.Organization) {
                                        if (table.Name == 'OrganizationClientRoleLOB' && column.Name == 'IsSelected') {
                                            if (column.Metadata && column.Metadata.length > 0) {
                                                var metadataLob = $scope.$eval(column.Metadata);
                                                if (metadataLob.LineOfBusinessId) {
                                                    var textLineOfBusiness = CodeValueService.getCodeValue(metadataLob.LineOfBusinessId, CodeValueGroups.LineOfBusiness).text;
                                                    column.DisplayName = textLineOfBusiness + ' ' + column.DisplayName;
                                                }
                                            }
                                        }

                                        if (table.Name === 'OrganizationInternalRole' &&
                                            (column.Name === 'DocumentIdHeader' || column.Name === 'DocumentIdFooter' ||
                                             column.Name === 'DocumentIdLandscapeHeader' || column.Name === 'DocumentIdLandscapeFooter')) {
                                            if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                                                column.NewValue.DisplayValue = $scope.$eval('(' + column.NewValue.Metadata + ')')[column.Name];
                                            }
                                            if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                                                column.OldValue.DisplayValue = $scope.$eval('(' + column.OldValue.Metadata + ')')[column.Name];
                                            }
                                        }
                                    }

                                    if ($scope.entityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule) {
                                        if (table.Name == 'ComplianceDocumentRuleRequiredSituation' && column.Name == 'IsSelected') {
                                            if (column.Metadata && column.Metadata.length > 0) {
                                                var metadataRequiredSituationType = $scope.$eval(column.Metadata);
                                                if (metadataRequiredSituationType.ComplianceDocumentRuleRequiredSituationTypeId) {
                                                    var textRequiredSituationType = CodeValueService.getCodeValue(metadataRequiredSituationType.ComplianceDocumentRuleRequiredSituationTypeId, CodeValueGroups.ComplianceDocumentRuleRequiredSituationType).text;
                                                    column.DisplayName = textRequiredSituationType + ' ' + column.DisplayName;
                                                }
                                            }
                                        }
                                    }

                                    if ($scope.entityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule) {
                                        if (table.Name == 'ComplianceDocumentRuleProfileVisibility' && column.Name == 'IsSelected') {
                                            if (column.Metadata && column.Metadata.length > 0) {
                                                var metadataRequiredSituationType = $scope.$eval(column.Metadata);
                                                if (metadataRequiredSituationType.ComplianceDocumentRuleProfileVisibilityTypeId) {
                                                    var textProfileVisibilityType = CodeValueService.getCodeValue(metadataRequiredSituationType.ComplianceDocumentRuleProfileVisibilityTypeId, CodeValueGroups.ComplianceDocumentRuleProfileVisibilityType).text;
                                                    column.DisplayName =  textProfileVisibilityType + ' ' + column.DisplayName;
                                                }
                                            }
                                        }
                                    }
                                    if ($scope.entityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule) {
                                        if (table.Name === 'ComplianceDocumentRuleRestriction' && (column.Name === 'InternalOrganizationId' || column.Name === 'ClientOrganizationId')) {
                                            if (column.NewValue.Value && column.NewValue.Value.length > 0) {
                                                column.NewValue.DisplayValue = $scope.$eval('(' + column.NewValue.Metadata + ')')[column.Name];
                                            }
                                            if (column.OldValue.Value && column.OldValue.Value.length > 0) {
                                                column.OldValue.DisplayValue = $scope.$eval('(' + column.OldValue.Metadata + ')')[column.Name];
                                            }
                                        }
                                    }
                                });
                            });
                        });
                    }

                    var changeHistoryModel = AssignmentDataService.getChangeHistoryModel($scope.entityTypeId);

                    //if (common.isEmptyObject(changeHistoryModel) || changeHistoryModel.entityId != $scope.entityId) {

                    var promise = //($scope.getByCaptureType !== null && ($scope.getByCaptureType == '2' || $scope.getByCaptureType == 2)) ?
                        //UtilityDataChangeTrackerApiService.getByAuditHistoryTable($scope.entityTypeId, $scope.entityId) :
                        UtilityDataChangeTrackerApiService.getTrackDataChange($scope.entityTypeId, $scope.entityId);

                    $scope.loadItemsPromise = promise;
                    promise.then(function (responseSuccess) {
                        AssignmentDataService.setChangeHistoryModel($scope.entityTypeId, { entityId: $scope.entityId, data: responseSuccess.Items });
                        changeHistoryModelBuilder(responseSuccess.Items);
                    },
                    function (responseError) {
                        changeHistoryModelBuilder([]);
                    }).finally(function () {
                        $scope.loadItemsPromise = null;
                    });
                    //}
                    //else {
                    //    changeHistoryModelBuilder(changeHistoryModel.data);
                    //}
                };
                $scope.getModel();
            }],
            link: function (scope, el, attrs) {
                if (!attrs.templateUrl) {
                    attrs.templateUrl = '/Phoenix/modules/utility/views/DataChangeTrackDefault.html';
                }
                var obtainEmptyContainer = function () {
                    // We don't want to replace element but instead change the content 
                    // this is done by adding a container if one doesn't exist yet
                    var container = el.children()[0] || el.append('<div></div>');
                    $(container).html(''); // clear content
                    return $(container).append('<div></div>');
                };
                // When the templateUrl attribute of the directive changes,
                attrs.$observe('templateUrl', function (newVal, oldVal) {
                    // get the new template
                    var template = getTemplate(newVal);
                    // and the container
                    var container = obtainEmptyContainer();

                    template.success(function (html) {
                        // set the container to the uncompiled template
                        container.html(html);
                    }).then(function (response) {
                        // compile (render) and replace the container
                        container.replaceWith($compile(container.html())(scope));
                    });
                });
            }
        };
    }]);

})(Phoenix.Directives);