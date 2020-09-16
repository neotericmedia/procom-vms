(function (app) {
    'use strict';

    var controllerId = 'RestrictionAddDialogController';

    app.controller(controllerId,
        ['$scope', '$uibModalInstance', 'common', 'data', RestrictionAddDialogController]);

    function RestrictionAddDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);
        var scope = this;

        angular.extend(scope, {
            data: data,

            viewType: data.optionsOfRestrictionTypeList_Content.length > 10 ? 'DropDown' : 'Checkbox',
            modalStyle: null,

            model: {
                isInclusive: true
            },

            cancel: function () {
                var result = { action: "cancel" };
                $uibModalInstance.close(result);
            },

            create: function () {
                var resultRestrictions = [];
                angular.forEach(scope.data.entityRestriction_List, function (restriction) {
                    if (restriction[scope.data.entityRestriction_FieldName_RestrictionTypeId] != scope.data.restrictionTypeId) {
                        resultRestrictions.push(restriction);
                    }
                });
                angular.forEach(scope.data.optionsOfRestrictionTypeList_Content, function (item) {

                    if (common.isEmptyObject(item.entity)) {
                        if (item.isApplied) {
                            var newRestriction = {};
                            newRestriction[scope.data.entityRestriction_FieldName_RestrictionTypeId] = scope.data.restrictionTypeId;
                            newRestriction[scope.data.idColumnNameByRestrictionType] = item[scope.data.optionsOfRestrictionTypeList_FieldName_Id];
                            newRestriction.Name = item[scope.data.optionsOfRestrictionTypeList_FieldName_Display];
                            resultRestrictions.push(newRestriction);
                        }
                    }
                    else {
                        var existingRestriction = _.find(scope.data.entityRestriction_List, [scope.data.idColumnNameByRestrictionType, item[scope.data.optionsOfRestrictionTypeList_FieldName_Id]]);
                        if (item.isApplied) {
                            existingRestriction[scope.data.entityRestriction_FieldName_RestrictionTypeId] = scope.data.restrictionTypeId;
                            existingRestriction[scope.data.idColumnNameByRestrictionType] = item[scope.data.optionsOfRestrictionTypeList_FieldName_Id];
                            existingRestriction.Name = item[scope.data.optionsOfRestrictionTypeList_FieldName_Display];
                            resultRestrictions.push(existingRestriction);
                        }
                        else {
                            existingRestriction = null;
                        }
                    }
                });

                var resultRestrictionsForType = _.filter(resultRestrictions, function (restriction) {
                    return restriction[scope.data.entityRestriction_FieldName_RestrictionTypeId] === scope.data.restrictionTypeId;
                });

                if (scope.data.showIsInclusive) {
                    angular.forEach(resultRestrictionsForType, function (item) {
                        item.IsInclusive = scope.model.isInclusive;
                    });
                }

                var result = {
                    action: "create",
                    restrictionTypeId: scope.data.restrictionTypeId,
                    entityRestriction_List: resultRestrictions,
                };
                $uibModalInstance.close(result);
            },

            addRestriction: function (restriction) {
                restriction.isApplied = true;
            },

            removeRestriction: function (restriction) {
                restriction.isApplied = false;
            },

            onLoad: function () {
                scope.modalStyle = scope.viewType === 'DropDown' ? { 'min-height': '600px' } : {};

                var ratesByCurrentType = _.filter(scope.data.entityRestriction_List, function (rate) {
                    return rate[scope.data.entityRestriction_FieldName_RestrictionTypeId] === scope.data.restrictionTypeId;
                });

                if (ratesByCurrentType.length && ratesByCurrentType[0].IsInclusive != null) {
                    scope.model.isInclusive = ratesByCurrentType[0].IsInclusive;
                } else {
                    scope.model.isInclusive = true;
                }

                angular.forEach(scope.data.optionsOfRestrictionTypeList_Content, function (item) {
                    var existingRestriction = _.find(ratesByCurrentType, [scope.data.idColumnNameByRestrictionType, item[scope.data.optionsOfRestrictionTypeList_FieldName_Id]]);
                    if (!common.isEmptyObject(existingRestriction)) {
                        item.entity = existingRestriction;
                        item.isApplied = true;
                    }
                    else {
                        item.entity = null;
                        item.isApplied = false;
                    }
                });
            }
        });

        scope.onLoad();

        angular.extend($scope, scope);
    }
})(Phoenix.App);