(function () {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactHistoryController', ContactHistoryController);

    // this is the overall "top parent" controller in the top-level state/route
    ContactHistoryController.$inject = ['$state', 'CodeValueService', 'contactService', 'profile'];
    function ContactHistoryController($state, CodeValueService, contactService, profile) {

        var self = this;
        
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            currentContact: profile.Contact,
            currentProfile: profile,
            cultureId: ApplicationConstants.Culture.Default,
            contactId: $state.params.contactId
        });

        self.init = function (edit) {
            self.edit = edit;
            self.edit.isNotProfilePage = true;
        };

        self.changeHistoryBlackList = [
            { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
            { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
            { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
            { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },

            { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
            { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },

            { TableSchemaName: '', TableName: '', ColumnName: 'ContactId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'UserProfileId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'ProfileStatusId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'IsPrimary' },
            { TableSchemaName: '', TableName: '', ColumnName: 'UserStatusId' },
            { TableSchemaName: '', TableName: '', ColumnName: 'UserProfileWorkerId' },

            { TableSchemaName: 'usr', TableName: 'Contact', ColumnName: 'LoginUserId' },
            { TableSchemaName: 'payment', TableName: 'PaymentMethod', ColumnName: 'PaymentMethodTypeId' },
            { TableSchemaName: 'usr', TableName: 'UserProfileWorkerSourceDeduction', ColumnName: 'SourceDeductionTypeId' },
            { TableSchemaName: 'usr', TableName: 'UserProfileWorkerOtherEarning', ColumnName: 'PaymentOtherEarningTypeId' },
            
        ];
    }
})();