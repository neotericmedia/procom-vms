(function (services) {
    'use strict';

    var serviceId = 'DocumentApiService';
    services.factory(serviceId, ['$sce', 'common', 'config', 'phoenixapi', 'SmartTableService', DocumentApiService]);

    function DocumentApiService($sce, common, config, phoenixapi, SmartTableService) {

        var service = {
            //  api/document
            getDocumentByPublicId: getDocumentByPublicId,
            getStreamByPublicId: getStreamByPublicId,
            getPdfStreamByPublicId: getPdfStreamByPublicId,
            getCsvStreamByPublicId: getCsvStreamByPublicId,
            getEntityDocuments: getEntityDocuments,
            getEntityDocumentsST: getEntityDocumentsST,
            getDocuments: getDocuments,
            //  api/report
            getPdfStreamForPayment: getPdfStreamForPayment,
            //  commands
            deleteDocumentByPublicId: deleteDocumentByPublicId,
        };

        return service;

        //  api/document
        function getDocumentByPublicId(publicId) {
            return phoenixapi.query('document/' + publicId);
        }
        function getPdfStreamByPublicId(publicId) {
            return phoenixapi.url('document/' + publicId + '/getPdfStreamByPublicId');
        }
        function getStreamByPublicId(publicId) {
            return phoenixapi.url('document/' + publicId + '/getStreamByPublicId');
        }
        function getCsvStreamByPublicId(publicId) {
            return $sce.trustAsResourceUrl(phoenixapi.url('document/' + publicId + '/getCsvStreamByPublicId') + '&wmode=transparent');
        }
        function getEntityDocuments(entityTypeId, entityId) {
            return phoenixapi.query('document/' + entityTypeId + '/' + entityId);
        }
        function getEntityDocumentsST(entityTypeId, entityId, tableState) {
            var params = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('document/' + entityTypeId + '/' + entityId + '?' + params);
        }
        function getDocuments(oDataParams) {
            return phoenixapi.query('document' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        //  api/report
        function getPdfStreamForPayment(paymentId) {
            return $sce.trustAsResourceUrl(phoenixapi.url('report/getPdfStreamForPayment/' + paymentId) + '&wmode=transparent');
        }
        //  commands
        function deleteDocumentByPublicId(publicId) {
            return phoenixapi.command('RemoveDocument', { PublicId: publicId, IncludeChildren: true, WorkflowPendingTaskId: -1 });
        }
    }

}(Phoenix.Services));