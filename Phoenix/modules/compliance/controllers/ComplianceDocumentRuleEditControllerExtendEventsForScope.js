(function (angular, app) {
    'use strict';

    var controllerId = 'ComplianceDocumentRuleEditControllerExtendEventsForScope';

    angular.module('phoenix.compliancedocumentrule.controllers').controller(controllerId,
        ['self', '$state', 'common', 'dialogs', 'CodeValueService', ComplianceDocumentRuleEditControllerExtendEventsForScope]);

    function ComplianceDocumentRuleEditControllerExtendEventsForScope(self, $state, common, dialogs, CodeValueService) {

        angular.extend(self, {
            supportingDocument: {
                docTypeId: null,
                dataHeaderText: "Upload a supporting document to your Document Rule",
                contentText1: "Accepted file types: PNG, JPG, JPEG, TIF, BMP, PDF, DOC, DOCX",
                uploadDocument: function (docTypeId) {
                    self.supportingDocument.docTypeId = docTypeId;

                    if (self.supportingDocument.docTypeId === ApplicationConstants.DocumentTypes.ComplianceDocumentRuleSample) {
                        self.supportingDocument.dataHeaderText = "Upload a Sample document to your Document Rule";
                        self.supportingDocument.contentText1 = "Accepted file types: PDF, JPG, JPEG, PNG, DOC, DOCX";
                        self.supportingDocument.acceptFileTypes = /(\.|\/)(pdf|jpe?g|png|doc|docx)$/i;
                    }
                    else if (self.supportingDocument.docTypeId === ApplicationConstants.DocumentTypes.ComplianceDocumentRuleTemplate) {
                        self.supportingDocument.dataHeaderText = "Upload a Template document to your Document Rule";
                        self.supportingDocument.contentText1 = "Accepted file types: DOCX";
                        self.supportingDocument.acceptFileTypes = /(\.|\/)(docx|doc)$/i;
                    }
                },

                documentUploadCallbackOnDone: function (document) {
                    self.supportingDocument.docTypeId = null;
                },

                listDocumentTypesToUpload: [],

                funcGetDocumentsUploadedTypes: function (documentsUploadedTypes, entityTypeId, entityId) {
                    self.supportingDocument.listDocumentTypesToUpload = _.reject(self.lists.listDocumentTypes, function (itemDocumentType) {
                        return _.some(documentsUploadedTypes, function (documentsUploadedType) {
                            return documentsUploadedType.DocumentTypeId === itemDocumentType.id;
                        });

                    });
                },

                funcOnDocumentDeleteException: function (documentsUploadedException, entityTypeId, entityId) {
                    common.logError("Concurrency exception on delete document. The documents list will be refreshed");
                },
            },
            actionScope: {
                show: {
                    isEditMode: false,
                    showAddDocumentType: false,
                    showDeleteDocumentType: false,
                    showAddModifyRestrictionType: false,
                    showComplianceDocumentRuleRequiredSituations: false,

                    selectedRestrictionList: [],

                    getSelectedRestrictionList: function () {
                        var result = _.map(_.groupBy(self.entity.ComplianceDocumentRuleRestrictions, 'ComplianceDocumentRuleRestrictionTypeId'),
                            function (value, key) {
                                var id = parseInt(key);
                                var codeValue = _.find(self.lists.listComplianceDocumentRuleRestrictionType, function (item) {
                                    return item.id === id;
                                });
                                return {
                                    RestrictionTypeId: codeValue.id,
                                    RestrictionTypeName: codeValue.text,
                                    RestrictionTypeCode: codeValue.code,
                                    IsInclusive: value[0].IsInclusive,
                                    SelectedRestrictions: value
                                };
                            });
                        return result;
                    },

                    filterRestrictionTypes: function (restrictionType) {
                        if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.Branch) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.WorkerType) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.Worker || self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.Organization || self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.Worksite) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.Worker);
                        }
                        else if (restrictionType.id === ApplicationConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility) {
                            return self.entity.ComplianceDocumentRuleEntityTypeId !== null && (self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.Worker || self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder);
                        }
                        else {
                            common.logError('The Restriction Type ' + restrictionType.id + ' is not supported');
                        }
                    },
                },

                showToRecalc: function () {

                    self.actionScope.show.isEditMode =
                        self.entity.ComplianceDocumentRuleStatusId === ApplicationConstants.ComplianceDocumentRuleStatus.New ||
                        self.entity.ComplianceDocumentRuleStatusId === ApplicationConstants.ComplianceDocumentRuleStatus.Draft;

                    self.actionScope.show.showAddDocumentType = self.actionScope.show.isEditMode &&
                        (
                            (self.entity.IsMultipleSubstitutionsAllowed && self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.length < self.listUserDefinedCodeComplianceDocumentType.length) ||
                            (!self.entity.IsMultipleSubstitutionsAllowed && self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.length === 0)
                        );

                    self.actionScope.show.showDeleteDocumentType = self.actionScope.show.isEditMode;

                    self.actionScope.show.showAddModifyRestrictionType = self.actionScope.show.isEditMode;

                    self.actionScope.show.showComplianceDocumentRuleRequiredSituations = self.entity.ComplianceDocumentRuleEntityTypeId === ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder;

                    self.actionScope.show.selectedRestrictionList = self.actionScope.show.getSelectedRestrictionList();
                },

                event: {

                    onChangeOrganizationIdClient: function (version) {
                        self.recalcNavigationName();
                    },
                    onChangeComplianceDocumentRuleEntityTypeId: function () {
                        if (self.entity.ComplianceDocumentRuleEntityTypeId !== ApplicationConstants.ComplianceDocumentRuleEntityType.WorkOrder) {
                            angular.forEach(self.entity.ComplianceDocumentRuleRequiredSituations, function (item) {
                                item.IsSelected = false;
                            });
                        }

                        self.entity.ComplianceDocumentRuleRestrictions = [];

                        self.actionScope.showToRecalc();
                    },
                    onVersionClick: function (version) {
                        $state.transitionTo($state.current.name, { complianceDocumentRuleId: version.Id }, { reload: false, inherit: true, notify: true });
                    },

                    restriction: {

                        update: function (restrictionTypeId) {

                            var restrictionDialogConfig = {
                                title: "Add/Edit Restriction - " + CodeValueService.getCodeValue(restrictionTypeId, CodeValueGroups.ComplianceDocumentRuleRestrictionType).text,
                                entityRestriction_List: self.entity.ComplianceDocumentRuleRestrictions,
                                entityRestriction_FieldName_RestrictionTypeId: 'ComplianceDocumentRuleRestrictionTypeId',
                                restrictionTypeId: restrictionTypeId,
                                restrictionTypeName: CodeValueService.getCodeValue(restrictionTypeId, CodeValueGroups.ComplianceDocumentRuleRestrictionType).text,
                                showIsInclusive: true
                            };

                            switch (restrictionTypeId) {
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.Branch:
                                    restrictionDialogConfig.viewType = 'Checkbox';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'BranchId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listInternalOrganizationDefinition1;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness:
                                    restrictionDialogConfig.viewType = 'Checkbox';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'LineOfBusinessId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listLineOfBusiness;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.WorkerType:
                                    restrictionDialogConfig.viewType = 'Checkbox';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'ProfileTypeId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listProfileType;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType:
                                    restrictionDialogConfig.viewType = 'Checkbox';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'OrganizationRoleTypeId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listOrganizationRoleType;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.Worksite:
                                    restrictionDialogConfig.viewType = 'DropDown';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'WorksiteId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listWorksite;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization:
                                    restrictionDialogConfig.viewType = 'DropDown';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'ClientOrganizationId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'Id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'LegalName';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listClient;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization:
                                    restrictionDialogConfig.viewType = 'DropDown';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'InternalOrganizationId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'Id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'LegalName';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listInternalOrganization;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision:
                                    restrictionDialogConfig.viewType = 'DropDown';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'TaxSubdivisionId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listTaxSubdivision;
                                    break;
                                case ApplicationConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility:
                                    restrictionDialogConfig.viewType = 'Checkbox';
                                    restrictionDialogConfig.idColumnNameByRestrictionType = 'WorkerEligibilityId';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'id';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'text';
                                    restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listWorkerEligibility;
                                    break;
                            }

                            dialogs.create('/Phoenix/app/directive/restrictionAddDialog/RestrictionAddDialog.html', 'RestrictionAddDialogController', restrictionDialogConfig, {
                                keyboard: false, backdrop: 'static', windowClass: 'restrictionTypeWindow'
                            }).result.then(
                                function (result) {
                                    if (result.action == 'create') {
                                        self.entity.ComplianceDocumentRuleRestrictions = angular.copy(result.entityRestriction_List);
                                        self.actionScope.showToRecalc();
                                    }
                                }, function () {
                                    self.actionScope.showToRecalc();
                                });
                        },
                    },

                    documentType: {

                        currentUserDefinedCodeComplianceDocumentTypeId: null,

                        select: function (item) {

                            if (self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.length === 0) {

                                if (self.entity.DisplayName === null || typeof self.entity.DisplayName === 'undefined' || self.entity.DisplayName.length === 0) {
                                    self.entity.DisplayName = item.Name;
                                }

                                if (self.entity.Description === null || typeof self.entity.Description === 'undefined' || self.entity.Description.length === 0) {
                                    self.entity.Description = item.Description;
                                }
                            }

                            self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.push({
                                UserDefinedCodeComplianceDocumentTypeId: item.Id,
                            });



                            self.actionScope.event.documentType.currentUserDefinedCodeComplianceDocumentTypeId = null;
                            self.actionScope.showToRecalc();
                        },

                        remove: function (documentType) {
                            var index = self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.indexOf(documentType);
                            if (index >= 0) self.entity.ComplianceDocumentRuleUserDefinedDocumentTypes.splice(index, 1);
                            self.actionScope.showToRecalc();
                        },

                        onChangeIsMultipleSubstitutionsAllowed: function () {
                            self.actionScope.showToRecalc();
                        },

                    },

                },
            },
        });

    }

})(angular, Phoenix.App);