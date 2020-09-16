(function (angular) {
    angular.module('phoenix.dashboard', ['phoenix.dashboard.controllers', 'adf', 'adf.structures.base', 'phoenix.widgets']);
    angular.module('phoenix.dashboard.controllers', []);
    angular.module('phoenix.widgets', ['adf.provider']);

    angular.module('phoenix.widgets').provider('dashboardProviderInstance',['dashboardProvider',function(dashboardProvider){
        this.$get=function(){
            return dashboardProvider;
        };
    }]);
})(angular);