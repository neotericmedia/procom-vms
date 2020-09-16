(function (angular, app) {
    'use strict';

    var controllerId = 'ComplianceDocumentRuleEditControllerExtendTabValidator';

    angular.module('phoenix.compliancedocumentrule.controllers').controller(controllerId, ['self', 'common', ComplianceDocumentRuleEditControllerExtendTabValidator]);

    function ComplianceDocumentRuleEditControllerExtendTabValidator(self, common) {
        angular.extend(self, {
            validator: {
                tabDetailsIsValid: false,
                tabRulesIsValid: false,
                isValidComplianceDocumentRuleRequiredSituations: function () {
                    return typeof (_.find(self.entity.ComplianceDocumentRuleRequiredSituations, ['IsSelected', true])) !== 'undefined';
                },

                tabValid: function (tab) {
                    if (tab.state == 'compliancedocument.documentrule.edit.details') {
                        common.validator.result.isValid = true;
                        common.validator.onValidatorResultIsValidToValidate__String(self.entity.DisplayName, 3, 128);
                        common.validator.onValidatorResultIsValidToValidate__String(self.entity.Description, 3, 255);

                        common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.IsMultipleSubstitutionsAllowed);
                        common.validator.onValidatorResultIsValidToValidate___Array(self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes);

                        //after FluentValidator testing
                        //need uncomment it for Task 39977:fix Bug 39976: bug (HIGH) Should not be able to submit if Multiple Substitution is selected as yes and only one document is uploaded, tab should still be in pending requirements status 
                        //if (self.entity.IsMultipleSubstitutionsAllowed === null) {
                        //    common.validator.result.isValid = false;
                        //}
                        //else if (self.entity.IsMultipleSubstitutionsAllowed === true && self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.length < 2) {
                        //    common.validator.result.isValid = false;
                        //}
                        //else if (self.entity.IsMultipleSubstitutionsAllowed === false && self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.length != 1) {
                        //    common.validator.result.isValid = false;
                        //}


                        self.validator.tabDetailsIsValid = common.validator.result.isValid;
                    }
                    else if (tab.state == 'compliancedocument.documentrule.edit.rules') {
                        common.validator.result.isValid = true;

                        common.validator.onValidatorResultIsValidToValidate______Id(self.entity.ComplianceDocumentRuleEntityTypeId);
                        common.validator.onValidatorResultIsValidToValidate______Id(self.entity.ComplianceDocumentRuleRequiredTypeId);
                        common.validator.onValidatorResultIsValidToValidate______Id(self.entity.ComplianceDocumentRuleExpiryTypeId);
                        common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.IsRequiredReview);

                        if (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder) {
                            //    disabled because of: Task 39875:fix Bug 39873:bug (HIGH) Document Rules Management text fixes
                            //  Enabled because: http://webdr01:8080/tfs/DefaultCollection/Phoenix_Ramsey/_workitems?id=860&_a=edit
                            common.validator.onValidatorResultIsValidToValidate___Array(self.entity.ComplianceDocumentRuleRequiredSituations);
                            if (typeof (_.find(self.entity.ComplianceDocumentRuleRequiredSituations, ['IsSelected', true])) === 'undefined') {
                                common.validator.result.isValid = false;
                            }
                        }

                        //  disabled because of: Task 39849:fix Bug 39848:bug (HIGH) Document Rules Management restrictions should not be mandatory
                        //common.validator.onValidatorResultIsValidToValidate___Array(self.entity.ComplianceDocumentRuleRestrictions);

                        self.validator.tabRulesIsValid = common.validator.result.isValid;
                    }
                },
            }
        });
    }

})(angular, Phoenix.App);