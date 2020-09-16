// todo: document this properly
(function (directives) {
    directives
        .constant('ftAccordionConfig', {
            closeOthers: true
        })
        .controller('ftAccordionController', ['$scope', '$attrs', 'ftAccordionConfig', function ($scope, $attrs, ftAccordionConfig) {
            this.groups = [];

            this.closeOthers = function (openGroup) {
                var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : ftAccordionConfig.closeOthers;
                if (closeOthers) {
                    angular.forEach(this.groups, function (group) {
                        if (group !== openGroup) {
                            group.isOpen = false;
                        }
                    });
                }
            };

            this.addGroup = function (groupScope) {
                var that = this;
                this.groups.push(groupScope);

                groupScope.$on('$destroy', function (event) {
                    that.removeGroup(groupScope);
                });
            };

            this.removeGroup = function (group) {
                var index = this.groups.indexOf(group);
                if (index !== -1) {
                    this.groups.splice(this.groups.indexOf(group), 1);
                }
            };

        }])
        .directive('ftAccordion', [function () {
            return {
                restrict: 'EA',
                controller: 'ftAccordionController',
                transclude: true,
                replace: false,
                template: '<div class="accordion" ng-transclude></div>'
            };
        }])
        .directive('ftAccordionGroup', ['$parse', function ($parse) {
            return {
                require: '^ftAccordion',
                restrict: 'EA',
                transclude: true,
                replace: true,
                templateUrl: function (element, attrs) {
                    return attrs.template || '/Phoenix/app/directive/ftAccordionGroup.html';
                },
                scope: {heading: '@'},
                controller: ['$scope', function ($scope) {
                    this.setHeading = function (element) {
                        this.heading = element;
                    };
                }],
                link: function (scope, element, attrs, accordionCtrl) {
                    var getIsOpen, setIsOpen;

                    accordionCtrl.addGroup(scope);

                    scope.isOpen = false;

                    if (attrs.isOpen) {
                        getIsOpen = $parse(attrs.isOpen);
                        setIsOpen = getIsOpen.assign;

                        scope.$watch(
                            function watchIsOpen() {
                                return getIsOpen(scope.$parent);
                            },
                            function updateOpen(value) {
                                scope.isOpen = value;
                            }
                        );

                        scope.isOpen = getIsOpen ? getIsOpen(scope.$parent) : false;
                    }

                    scope.$watch('isOpen', function (value) {
                        if (value) {
                            accordionCtrl.closeOthers(scope);
                        }
                        if (setIsOpen) {
                            setIsOpen(scope.$parent, value);
                        }
                    });
                }
            };
        }])
        .directive('ftAccordionHeading', [function () {
            return {
                restrict: 'E',
                transclude: true,
                template: '',
                replace: true,
                require: '^ftAccordionGroup',
                compile: function (element, attr, transclude) {
                    return function link(scope, element, attr, accordionGroupCtrl) {
                        accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
                    };
                }
            };
        }])
        .directive('ftAccordionTransclude', [function () {
            return {
                require: '^ftAccordionGroup',
                link: function (scope, element, attr, controller) {
                    scope.$watch(function () {
                        return controller[attr.ftAccordionTransclude];
                    }, function (heading) {
                        if (heading) {
                            element.html('');
                            element.append(heading);
                        }
                    });
                }
            };
        }]);
})(Phoenix.Directives);