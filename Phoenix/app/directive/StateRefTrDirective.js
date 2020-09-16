function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed) { ref = current + '(' + preparsed[1] + ')'; }
    parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4) { throw new Error("Invalid state ref '" + ref + "'"); }
    return { state: parsed[1], paramExpr: parsed[3] || null };
}
function stateContext(el) {
    var stateData = el.parent().inheritedData('$uiView');

    if (stateData && stateData.state && stateData.state.name) {
        return stateData.state;
    }
}
$StateRefTrDirective.$inject = ['$state', '$timeout', '$compile', '$http'];
function $StateRefTrDirective($state, $timeout, $compile, $http) {
    var allowedOptions = ['location', 'inherit', 'reload', 'absolute'];

    return {
        restrict: 'A',
        require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
        link: function (scope, element, attrs, uiSrefActive) {
            var ref = parseStateRef(attrs.uiSrefTr, $state.current.name);
            var params = null, url = null, base = stateContext(element) || $state.$current;
            // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
            var hrefKind = Object.prototype.toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
                       'xlink:href' : 'href';
            var newHref = null, isAnchor = element.prop("tagName").toUpperCase() === "A";
            var isForm = element[0].nodeName === "FORM";
            var attr = isForm ? "action" : hrefKind, nav = true;

            var options = { relative: base, inherit: true };
            var optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};

            angular.forEach(allowedOptions, function (option) {
                if (option in optionsOverride) {
                    options[option] = optionsOverride[option];
                }
            });

            var update = function (newVal) {
                if (newVal) { params = angular.copy(newVal); }
                if (!nav) { return; }

                newHref = $state.href(ref.state, params, options);

                var activeDirective = uiSrefActive[1] || uiSrefActive[0];
                if (activeDirective) {
                    activeDirective.$$addStateInfo(ref.state, params);
                }
                if (newHref === null) {
                    nav = false;
                    return false;
                }
                attrs.$set(attr, newHref);
            };

            if (ref.paramExpr) {
                scope.$watch(ref.paramExpr, function (newVal, oldVal) {
                    if (newVal !== params) update(newVal);
                }, true);
                params = angular.copy(scope.$eval(ref.paramExpr));
            }
            update();

            if (isForm) { return; }

            element.bind("click", function (e) {
                var target = e.target || e.srcElement;
                if (angular.element(target).is("input")) {
                    return;
                }
                var button = e.which || e.button;
                var ignorePreventDefaultCount;

                if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target'))) {
                    // HACK: This is to allow ng-clicks to be processed before the transition is initiated:

                    var transition = $timeout(function () {
                        $state.go(ref.state, params, options);
                    });
                    e.preventDefault();

                    // if the state has no URL, ignore one preventDefault from the <a> directive.
                    ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
                    e.preventDefault = function () {
                        if (ignorePreventDefaultCount-- <= 0)
                            $timeout.cancel(transition);
                    };
                } else if (button === 1 && (e.ctrlKey || e.metaKey || e.shiftKey)) {
                    var url = $state.href(ref.state, params, options);
                    window.open(url, '_blank');
                    e.preventDefault();
                    // if the state has no URL, ignore one preventDefault from the <a> directive.
                    ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
                    e.preventDefault = function () {
                        if (ignorePreventDefaultCount-- <= 0)
                            $timeout.cancel(transition);
                    };
                }
            });
            element.bind("mousedown", function (e) {
                var target = e.target || e.srcElement;
                if (angular.element(target).is("input")) {
                    return;
                }
                var button = e.which || e.button;
                if (button === 2) {
                    var url = $state.href(ref.state, params, options);
                    window.open(url, '_blank');
                    e.preventDefault();
                    // if the state has no URL, ignore one preventDefault from the <a> directive.
                    var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
                    e.preventDefault = function () {
                        if (ignorePreventDefaultCount-- <= 0)
                            $timeout.cancel(transition);
                    };
                }
            });
        }
    };
}

angular.module('directives')
  .directive('uiSrefTr', $StateRefTrDirective);