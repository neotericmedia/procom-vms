/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';
    app.controller('dialogCommentController', ['$scope', '$uibModalInstance', 'data', function ($scope, $uibModalInstance, data) {
        $scope.config = {
            title: data.title || 'Enter Reason',
            inputname: data.inputname || '',
            helpblock: data.helpblock || 'Reason must be entered',
            saveButtonText: data.saveButtonText || 'Ok',
            cancelButtonText: data.cancelButtonText || 'Cancel',
            maxlength: data.maxlength || 32000
        };

        $scope.model = { comment: '' };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancelled');
        };

        $scope.save = function () {
            $uibModalInstance.close($scope.model.comment);
        };

        $scope.hitEnter = function (evt) {
            if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.model.comment, null) || angular.equals($scope.model.comment, '')))
                $scope.save();
        };
    }])
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put('/dialogs/dialogCommentTemplate.html',
            //'<div class="modal">' +
            //'<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header"><span class="modal-title">{{config.title}}</span></div>' +
            '<div class="modal-body">' +
            '<ng-form name="nameDialog" novalidate role="form">' +
            '<div class="form-group input-group-lg" ng-class="{true: \'has-error\'}[nameDialog.comment.$dirty && nameDialog.comment.$invalid]">' +
            '<label class="control-label modal-inputname" for="comment">{{config.inputname}}</label>' +
            //'<input type="text" class="form-control" name="comment" id="comment" ng-model="model.comment" ng-keyup="hitEnter($event)" required>' +
            '<textarea style="width:100%;height:100px;" class="form-control" name="comment" id="comment" ng-model="model.comment" required maxlength="{{config.maxlength}}"></textarea>' +
            '<span class="help-block">{{config.helpblock}}</span>' +
            '</div></ng-form></div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" ng-click="cancel()">{{config.cancelButtonText}}</button>' +
            '<button type="button" class="btn btn-primary" ng-click="save()" ng-disabled="(nameDialog.$dirty && nameDialog.$invalid) || nameDialog.$pristine">{{config.saveButtonText}}</button>' +
            '</div>' +
            //'</div>' +
            //'</div>' +
            '</div>'
            );

    }]); // end run / module
})(Phoenix.App);