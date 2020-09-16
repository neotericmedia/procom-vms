(function (services) {
    'use strict';

    var serviceId = 'applicationHub';
    services.constant('$', $);



    services.factory(serviceId, ['common', 'config', '$', '$timeout', 'phoenixapi', applicationHub]);

    function applicationHub(common, config, $, $timeout, phoenixapi) {

        common.setControllerName('applicationHub');


        var proxy;
        var connection;

        function startConnection() {
            connection.logging = false;

            connection.start().done(function () {
                console.log('Application Now connected, connection ID=' + connection.id);
                joinGroup();
            }).fail(function () { console.log('Application Could not connect'); });
        }

        function joinGroup() {
            proxy.invoke('joinGroup').done(function () {
                console.log('Invocation of JoinGroup succeeded');
            }).fail(function (error) {
                console.log('JoinGroup error: ' + error);
            });
        }


        return {
            connect: function () {
                connection = $.hubConnection();
                proxy = connection.createHubProxy('applicationHub');
                startConnection();
            },
            switchProfile: function (profile) {
                proxy.invoke('switchProfile', profile).done(function () {
                    phoenixapi.setCurrentProfile(profile.Id);
                    console.log('Invocation of switchProfile succeeded');
                }).fail(function (error) {
                    console.log('switchProfile error: ' + error);
                });
            },
        };
    }

}(Phoenix.Services));