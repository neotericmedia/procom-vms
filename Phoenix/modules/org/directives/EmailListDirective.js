(function (directives) {
    'use strict';

    //  Examle to use:
    //  <email-list-directive ng-model="scopeOrg.entity.OrganizationIndependentContractorRoles[0].NotificationEmail" name="NotificationEmail" data-pt-field-view="scopeOrg.ptFieldViewConfigOnChangeStatusId"></email-list-directive>

    var directiveName = 'emailListDirective';

    directives
        .directive('checkUnique', [function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {

                    if (!ngModel) {
                        return;
                    }

                    var valueList = scope.$eval(attrs.checkUnique);

                    //For DOM -> model validation
                    ngModel.$parsers.unshift(function (currentValue) {
                        var isInvalid = false;

                        angular.forEach(valueList, function (val) {
                            var value = val;
                            if (typeof val == "object") {
                                value = val.val;
                            }

                            if (typeof value === "undefined") {
                                return; // Continue
                            }

                            if (currentValue.trim().toLowerCase() == value.trim().toLowerCase()) {
                                isInvalid = true;
                            }
                        });

                        ngModel.$setValidity('unique', !isInvalid);

                        return currentValue;// ? currentValue : undefined;
                    });

                    //For model -> DOM validation
                    ngModel.$formatters.unshift(function (value) {
                        //ngModel.$setValidity('blacklist', blacklist.indexOf(value) === -1);
                        return value;
                    });
                }
            };
        }])
        .directive(directiveName, [function () {

            var directive = {
                restrict: 'E',
                require: 'ngModel',
                scope: {
                    ngModel: "="
                    //, isDraft: "@?"
                    //, emailFormValid: "=?"
                },
                controllerAs: 'emailDirectiveVm',
                link: function (scope, element, attrs, ngModelController) {
                    scope.emailDirectiveVm.ngModelController = ngModelController;
                    if (!scope.ngModel) {
                        ngModelController.$setValidity('invalid-email-list-input', false);
                    }

                },
                controller: ['$scope', function ($scope) {
                    //var isDraft = !!$scope.isDraft;

                    var vm = this;
                    vm.list = [];
                    vm.ngModelController = null;
                    vm.name = $scope.name;

                    vm.calculateValidity = function () {
                        var validity = _.every(vm.list, function (x) {
                            x.valid = ApplicationConstants.Regex.Email.test(x.val);
                            return x.valid;
                        });
                        vm.ngModelController.$setValidity('invalid-email-list-input', validity);
                    };

                    vm.setList = function (newString) {
                        if (typeof newString === "string") {
                            vm.list = [];
                            var splitArr = newString.split(';');
                            for (var i = 0; i < splitArr.length; i++) {
                                var trimmedValue = splitArr[i].trim();
                                if (trimmedValue) {
                                    vm.list.push({ val: trimmedValue, valid: true });
                                }
                            }
                            vm.calculateValidity();
                        }
                    };

                    vm.add = function () {
                        vm.list.push({ val: "", valid: false });
                        vm.calculateValidity();
                    };

                    vm.remove = function (emailVm) {
                        var index = vm.list.indexOf(emailVm);
                        if (index > -1) { vm.list.splice(index, 1); }
                        var newEmailArr = _.filter(_.map(vm.list, "val"));
                        $scope.ngModel = newEmailArr.join('; ');
                        vm.calculateValidity();
                    };

                    vm.changedVal = function (emailVm, el, idx) {
                        emailVm.valid = el.$valid;
                        vm.calculateValidity();
                        var currEl = "email_input_" + idx;
                        if ($scope.emailSubForm[currEl]) {
                            $scope.emailSubForm[currEl].$setValidity("ng-valid", vm.list[idx].valid);
                        }                        
                       
                        // only update if validation passed
                        if (emailVm.val) {
                            var newEmailArr = _.filter(_.map(vm.list, "val"));
                            $scope.ngModel = newEmailArr.join('; ');
                        }
                        else {
                            var excludedEmailArr = _.filter(_.map(_.filter(vm.list, function (q) {
                                return _.findIndex(vm.list, emailVm) !== -1;
                            }), "val"));
                            $scope.ngModel = excludedEmailArr.join('; ');
                            //if (!isDraft) {
                            //    $scope.ngModel = undefined;
                            //}
                        }
                    };

                    // external changes
                    $scope.$watch('ngModel', function (newVal, oldVal) {
                        // ignore the first blank set. (No, don't ignore. Otherwise the input box is blank. Bug 31693)
                        if (!!newVal && vm.list.length === 0) { //oldVal != newVal || (
                            vm.setList(newVal);
                        }
                        if (vm.list.length === 0) {
                            vm.add();
                        }
                    });

                    return vm;
                }],
                template: '<form name="emailSubForm">' +
                                '<div ng-repeat="emailVm in emailDirectiveVm.list track by $index" class="input-group input-role-email">' +
                                    '<input type="email" required="required" name="email_input_{{$index}}" ng-change="emailDirectiveVm.changedVal(emailVm, this.emailSubForm, $index)" ' + //ng-model-options="{ allowInvalid: !!$scope.isDraft }"
                                    ' check-unique="emailDirectiveVm.list" data-ng-pattern="ApplicationConstants.Regex.Email" ng-maxlength="128" maxlength="128" name="NotificationEmail" class="form-control ng-valid-email" data-required-message="Required" autocomplete="off" data-ng-model="emailVm.val" />' +
                                    '<div class="input-group-btn" >' +
                                        '<button type="button" ng-show="emailDirectiveVm.list && emailDirectiveVm.list.length>1" class="btn btn-default btn-material" data-ng-click="emailDirectiveVm.remove(emailVm)"><i class="material-icons">delete</i></button>' +
                                        '<button ng-class="{\'invisible\' : ($index < emailDirectiveVm.list.length-1 )}" type="button" class="btn btn-default btn-role-email btn-material" data-ng-click="emailDirectiveVm.add()" title="">'+
                                        '<i class="material-icons email-add-button-icon" >add</i>' +
                                        '</button>' +
                                    '</div>' +
                                '</div>' +
                            '</form>'                        
            };
            return directive;
        }]);


})(Phoenix.Directives);