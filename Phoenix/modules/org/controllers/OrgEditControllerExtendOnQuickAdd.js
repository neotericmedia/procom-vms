(function (angular, app) {
    'use strict';

    var controllerId = 'OrgEditControllerExtendOnQuickAdd';

    angular.module('phoenix.org.controllers').controller(controllerId, ['self', '$state', 'common', 'NavigationService', 'OrgApiService', 'ProfileApiService', OrgEditControllerExtendOnQuickAdd]);

    function OrgEditControllerExtendOnQuickAdd(self, $state, common, NavigationService, OrgApiService, ProfileApiService) {

        angular.extend(self, {
            quickAdd: {
                onClickSave: function () {
                    self.entity.OrganizationSubVendorRoles = null;
                    self.entity.OrganizationLimitedLiabilityCompanyRoles = null;
                    self.entity.OrganizationInternalRoles = null;
                    self.entity.OrganizationClientRoles = null;
                    
                    OrgApiService.organizationNewOnQuickAdd(self.entity).then(function (responseOnSuccess) {
                        if (responseOnSuccess.IsValid) {
                            common.logSuccess("Organization Created");
                            $state.transitionTo('org.edit.details', { organizationId: responseOnSuccess.EntityId }, { reload: true, inherit: true, notify: true });
                        } else {
                            self.validationMessages = common.responseErrorMessages(responseOnSuccess);
                        }
                    }, function (responseOnError) {
                        //"There are documents that must be uploaded before the organization can be submitted"
                        var complianceDocumentValidationException = '';
                        angular.forEach(responseOnError.ValidationMessages, function (validationMessage) {
                            if (validationMessage.Message.indexOf('documents that must be uploaded') != -1) {
                                complianceDocumentValidationException = validationMessage.Message;
                            }
                        });
                        if (complianceDocumentValidationException.length > 0) {
                            common.logError(complianceDocumentValidationException);
                            $state.transitionTo('org.edit.details', { organizationId: responseOnError.EntityId }, { reload: true, inherit: true, notify: true });
                        }
                        else {
                            self.validationMessages = common.responseErrorMessages(responseOnError);
                        }
                    });
                },
                onClickCancel: function () {
                    $state.transitionTo('ngtwo.m', { p: "organization/search" });
                },
                changePrimaryEmailInput: function () {
                    if (self.entity.Contact.Email) {
                        ProfileApiService.searchWorkerCanadianIncProfile(self.entity.Contact.Email).then(
                            function (resultSuccess) {
                                self.entity.Contact = {
                                    ContactId: resultSuccess.Contact.Id,
                                    Email: resultSuccess.PrimaryEmail,
                                    PersonTitleId: resultSuccess.Contact.PersonTitleId,
                                    FirstName: resultSuccess.Contact.FirstName,
                                    LastName: resultSuccess.Contact.LastName,
                                    PhoneTypeId: resultSuccess.UserProfilePhones[0] ? resultSuccess.UserProfilePhones[0].ProfilePhoneTypeId : null,
                                    PhoneNumber: resultSuccess.UserProfilePhones[0] ? resultSuccess.UserProfilePhones[0].Phone : null,
                                    PhoneExtension: resultSuccess.UserProfilePhones[0] ? resultSuccess.UserProfilePhones[0].Extension : null,
                                };
                            },
                            function (resultException) {
                                var exc = resultException;
                            });
                    }
                },
            },
        });

        self.actionScope.event.organizationTaxNumber.add();
    }

})(angular, Phoenix.App);