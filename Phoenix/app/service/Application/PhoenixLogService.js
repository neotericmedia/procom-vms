(function (services) {
    'use strict';

    services.factory('PhoenixLogService',
        ['$http', '$route', '$log', function ($http, $route, $log) {

            function PhoenixLogService() {
            }

            PhoenixLogService.prototype.error = function (message) {
                this.logmsg(5, message);
            };

            PhoenixLogService.prototype.warn = function (message) {
                this.logmsg(4, message);
            };

            PhoenixLogService.prototype.info = function (message) {
                this.logmsg(3, message);
            };


            PhoenixLogService.prototype.logmsg = function (level, message) {
                var route = ($route.current) ? $route.current.loadedTemplateUrl : 'no route';
                var params = ($route.current) ? JSON.stringify($route.current.params) : 'no route';
                if ((level === null) || (message === null) || (message === '')) {
                    $log.error("Invalid or missing arguments for phoenix log service");
                    return;
                }

                $http({
                    url: "/api/PhoenixLog/Log",
                    method: "POST",
                    data: { Level: level, Message: message, Route: route, Params: params },
                }).success(function(data) {
                    return;
                }).error(function(data) {
                    $log.error("Unable to send error log to Phoenix Log server");
                });
                
            };

            return new PhoenixLogService();
        }]);


}(Phoenix.Services));

