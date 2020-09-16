/// <reference path="../../../libs/jquery/jquery-1.9.0.js" />
/// <reference path="../../../libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="../../../libs/angular/angular.js" />
(function (directives) {
    directives.directive('ptStepWizard', [function () {
        var $tabClickable = false;
        return {
            restrict: 'A',
            //scope: true,
            controller: function ($scope, $element, $attrs) {
                var tabs = $scope.tabs = [];

                $scope.wizardForm = null;
                $scope.currentTab = {};
                $scope.currentForm = null;
                $scope.isFirstTab = true;
                $scope.isLastTab = false;

                // visual status indicators
                $scope.progresBarWidth = 'width: 0%';
                $scope.numberOfPages = '';

                $scope.onNextTab = function (activeTab, navigation, index) {
                    return $scope.currentForm.$valid;
                };

                $scope.onLast = function (activeTab, navigation, index) {
                    return $scope.currentForm.$valid;
                };

                $scope.onTabClick = function (activeTab, navigation, currentIndex, clickedIndex) {
                    return $tabClickable && $scope.currentForm.$valid;
                };

                $scope.onTabShow = function (activeTab, navigation, index) {
                    var $total = tabs.length;
                    var $current = index + 1;
                    var $percent = ($current / $total) * 100;

                    $scope.progresBarWidth = 'width: ' + $percent + '%';
                    $scope.numberOfPages = $current + ' of ' + $total;

                    $scope.currentTabIndex = index;
                    $scope.currentTab = tabs[index];
                    if ($scope.currentTab) {
                        $scope.currentForm = $scope.currentTab.form;
                    }
                    $scope.isFirstTab = ($current == 1);
                    $scope.isLastTab = ($current >= $total);

                    if ($scope.$root && $scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') { $scope.$apply(); }
                    else { $scope.$eval(); }

                    if ($attrs.onTabShow) {
                        var fnOnTabShow = $attrs.onTabShow + '(currentTabIndex)';
                        $scope.$eval(fnOnTabShow);
                    }
                };

                this.addTab = function (name, form, scope) {
                    tabs.push({ name: name, form: form, scope: scope });
                };
            },
            compile: function (elem, attr) {
                if (attr.ptTabClickable) $tabClickable = attr.ptTabClickable;

                return {
                    pre: function preLink(scope, element, attrs, controller) {
                    },
                    post: function postLink(scope, element, attrs, controller) {
                        scope.wizardForm = scope[attrs.ptStepWizard + 'Form'];

                        element.bootstrapWizard({
                            nextSelector: '.wizard-action .next',
                            previousSelector: '.wizard-action .previous',
                            firstSelector: '.wizard-action .first',
                            lastSelector: '.wizard-action .last',
                            onTabShow: scope.onTabShow,
                            onNext: scope.onNextTab,
                            onLast: scope.onLast,
                            onTabClick: scope.onTabClick
                        });
                    }
                };
            }
        };
    }]).directive('ptStepWizardTab', ['$compile', function ($compile) {
        var $tabName;
        return {
            restrict: 'A',
            require: '^ptStepWizard',
            compile: function (elem, attr) {
                $tabName = attr.ptStepWizardTab;
                elem.attr('id', $tabName);
                return {
                    post: function postLink(scope, element, attrs, controller) {
                        var tabForm = scope[attrs.ngForm];
                        controller.addTab($tabName, tabForm, scope);
                    }
                };
            }

        };
    }]).directive('ptStepWizardProgressBar', [function () {
        return {
            restrict: 'A',
            require: '^ptStepWizard',
            replace: true,
            template: '<div class="section-content item bg-blue-medium padding-top10 padding-bottom10 no-border-top"> ' +
                      '     <div id="bar" class="progress progress-info progress-mini no-margin"> ' +
                      '         <div class="bar" style="{{progresBarWidth}}"></div> ' +
                      '     </div> ' +
                      '</div> ',
            compile: function (elem, attr) {
            }
        };
    }]).directive('ptStepWizardButtons', [function () {
        return {
            restrict: 'A',
            require: '^ptStepWizard',
            replace: true,
            template: '<div class="section-content footer"> ' +
                        '    <ul class="wizard-action wizard-pager"> ' +
                        '        <li><a class="previous first btn" href="javascript:void(0);" data-ng-disabled="isFirstTab">First</a></li> ' +
                        '        <li><a class="previous btn btn-blue" href="javascript:void(0);" data-ng-disabled="isFirstTab"><i class="fontello-icon-left-circle2"></i> Previous</a></li> ' +
                        '        <li><a class="next last btn" href="javascript:void(0);" data-ng-show="!isLastTab" data-ng-disabled="!currentForm.$valid">Last</a></li> ' +
                        '        <li><a class="next btn btn-blue" href="javascript:void(0);" data-ng-show="!isLastTab" data-ng-disabled="!currentForm.$valid">Next <i class="fontello-icon-right-circle2"></i></a></li> ' +
                        '        <li><a class="next finish btn btn-green" href="javascript:void(0);" data-ng-show="isLastTab" data-ng-disabled="!wizardForm.$valid" data-ng-click="onSubmitClick()">Submit</a></li> ' +
                        '        <li><a class="next cancel btn btn-red" href="javascript:void(0);" data-ng-show="isLastTab" data-ng-click="onCancelClick()">Cancel</a></li> ' +
                        '    </ul> ' +
                        '</div>',
            link: function (scope, elm, attrs, ctrl) {
                var cancelFnExp = attrs.ptWizardCancel,
                    submitFnExp = attrs.ptStepWizardButtons;

                scope.onSubmitClick = function () {
                    if (submitFnExp) {
                        scope.$eval(submitFnExp);
                    }
                };
                scope.onCancelClick = function () {
                    if (cancelFnExp) {
                        scope.$eval(cancelFnExp);
                    }
                };
            }
        };
    }]);


})(Phoenix.Directives);