(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsFixedPriceDocumentFilesController', VmsFixedPriceDocumentFilesController);

    /** @ngInject */
    VmsFixedPriceDocumentFilesController.$inject = ['$state', 'CodeValueService', 'DocumentApiService', 'VmsApiService', 'vmsTableParams', 'vmsNewTableState', 'mixinsFactory'];

    function VmsFixedPriceDocumentFilesController($state, CodeValueService, DocumentApiService, VmsApiService, vmsTableParams, vmsNewTableState, mixinsFactory) {

        var self = this;

        angular.extend(self, {
            documentId: parseInt($state.params.documentId, 10),
            internalOrganizationId: parseInt($state.params.internalOrganizationId,10),
            documentTypes: CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, ApplicationConstants.EntityType.VmsImportedRecord, CodeValueGroups.EntityType),
            document: document,
            items: [],

            getCsvStreamByPublicId:getCsvStreamByPublicId
        });

        self.initialize = function(document) {
            self.document = document;
            self.document.isTabLoaded = false;
        };

        var vmsFixedPriceDataParams = oreq.request()
            .withSelect([
                'FileName',
                'DocumentTypeId',
                'UploadDate',
                'UploadedBy',
                'PublicId',
                'DocumentId',
                'DocumentChildId',
                'DocumentChildTypeId',
                'DocumentChildFileName',
                'DocumentChildPublicId'
            ]).url();

        var args = [self.internalOrganizationId, self.documentId];

        VmsApiService.getVmsFixedPriceDocument('', vmsFixedPriceDataParams, args).then(
            function (response) {
                self.items = response.Items;
                if (self.items.length > 0 && self.items[0].DocumentChildId > 0) {
                    var mainItem = self.items[0];
                    var originalItem = {
                        FileName: mainItem.DocumentChildFileName,
                        PublicId: mainItem.DocumentChildPublicId,
                        DocumentTypeId: mainItem.DocumentChildTypeId,
                        UploadDate: mainItem.UploadDate,
                        UploadedBy: mainItem.UploadedBy
                    };
                    self.items.push(originalItem);
                }
                self.document.isTabLoaded = true;
            },
            function (error) {
                self.document.isTabLoaded = true;
            }
        );        

        function getCsvStreamByPublicId(publicId) {
            return DocumentApiService.getCsvStreamByPublicId(publicId);
        }

        return self;
    }
})();
