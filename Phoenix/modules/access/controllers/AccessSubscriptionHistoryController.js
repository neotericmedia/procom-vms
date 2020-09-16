(function (angular, app) {
    'use strict';

    angular.module('phoenix.access.controllers').controller('AccessSubscriptionHistoryController', AccessSubscriptionHistoryController);

    AccessSubscriptionHistoryController.$inject = ['$state', 'common', 'CodeValueService', 'AccessSubscriptionApiService', 'Subscription' ];

    function AccessSubscriptionHistoryController($state, common, CodeValueService, AccessSubscriptionApiService, Subscription) {

        var self = this;

        angular.extend(self, {
            Subscription: Subscription,
            cultureId: ApplicationConstants.Culture.Default
        });

        self.init = function (edit) {
            self.edit = edit;
            self.edit.IsNotSubscriberPage = true;
        };

        self.changeHistoryBlackList =
            [
                { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
                { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
                { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
                { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
                { TableSchemaName: '', TableName: '', ColumnName: 'AccessSubscriptionId' },

                { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
                { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
            ];
    }

})(angular, Phoenix.App);