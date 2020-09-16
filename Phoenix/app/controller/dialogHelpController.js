/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';
    app.controller('dialogHelpController', ['$scope', '$uibModalInstance', 'data', function ($scope, $uibModalInstance, data) {
        $scope.config = {
            title: data.title || 'Help',
            className: data.className || '',
            exitButtonText: data.exitButtonText || 'Exit'
        };

        $scope.model = { comment: '' };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancelled');
        };

        $scope.save = function () {
            $uibModalInstance.close('saved');
        };


    }])
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put('/dialogs/dialogHelpTemplate.html',
            '<div class="modal-content">' +
            '<div class="modal-header"><span class="modal-title">{{config.title}}</span></div>' +
            '<div class="modal-body">' +
            '<div style="width: 100%;height: 500px;"><i class="{{config.className}}"></i></div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" ng-click="cancel()">{{config.exitButtonText}}</button>' +
            '</div>' +
            '</div>'
            );

    }]); // end run / module
})(Phoenix.App);