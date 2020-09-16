(function () {
    'use strict';

    var app = angular.module('Phoenix');

    var configId = 'configAdmin';

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

            $stateProvider

            .state("admin", {
                url: '/admin',
                template:   '<div data-ui-view="" autoscroll="false">'+
                                '<div class="">' +
                                    '<ul>' +
                                        '<li><a data-ui-sref="admin.workflow">Workflow</a></li>' +
                                        '<li><a data-ui-sref="admin.forceinvalidatecodecache">Force invalidate code cache</a></li>' +
                                        '<li><a data-ui-sref="admin.wikipedia">Wikipedia</a></li>' +
                                        '<li><a data-ui-sref="admin.payment">Payment</a></li>' +
                                    '</ul>' +
                                '</div>' +
                            '</div>'
            })
            .state("admin.workflow", {
                url: '/workflow',
                'abstract': false,
                controller: 'AdminWorkflowRootController',
                template:
                    '<div data-ui-view="" autoscroll="false">' +
                        '<div class="">' +
                            '<ul><b>Workflow Migration</b>' +
                                '<li><a data-ui-sref="admin.workflow.begin">Workflow Migration Begin For Existing Entity</a></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>'
            })
            .state("admin.workflow.begin", {
                url: '/begin',
                template: '<div data-ui-view="" autoscroll="false">Workflow Migration Progress:</div>' +
                    '<div>{{scopeUiRoot.progressLine.CountLeft}} - Left</div>' +
                    '<div>{{scopeUiRoot.progressLine.CountTotal}} - Total</div>' +
                    '<div>{{scopeUiRoot.progressLine.CountFinishedWithSuccess}} - Finished with Success</div>' +
                    '<div>{{scopeUiRoot.progressLine.CountFinishedWithException}} - Finished with Exception</div>' +
                    '<div data-pt-validation-messages="scopeUiRoot.ValidationMessages"></div>',
                controllerAs: 'scopeUiRoot',
                controller: ['$state', 'common', 'WorkflowApiService', 'phoenixsocket', function ($state, common, WorkflowApiService, phoenixsocket) {
                    var self = this;

                    WorkflowApiService.executeCommand({ CommandName: 'WorkflowMigration_ExistingEntityPushToWorkflow' }).then(
                     function (responseSucces) {
                         if (responseSucces.IsValid) {
                             common.logSuccess('Success');
                             $state.go('admin.workflow');
                         }
                         else {
                             self.ValidationMessages = common.responseErrorMessages(responseSucces);
                         }
                     },
                     function (responseError) {
                         common.responseErrorMessages(responseError);
                         self.ValidationMessages = common.responseErrorMessages(responseError);
                     });

                    self.progressLine = {};
                    phoenixsocket.onPrivate('WorkflowMigration_ExistingEntityPushToWorkflow_ProgressLine', function (event, data) {
                        self.progressLine = data;
                    });
                }]
            })
            .state("admin.wikipedia", {
                url: '/wikipedia',
                'abstract': false,
                //controller: 'AdminWorkflowRootController',
                template:
                    '<div data-ui-view="" autoscroll="false">' +
                        '<div class="">' +
                            '<ul><b>Docs:</b>' +
                                 '<li><a data-ui-sref="admin.wikipedia.doctheentitysecurityaccessvalidation">The Entity Security Access Validation</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.docworkflow">Workflow</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.angularmigration">Angular Migration</a></li>' +
                            '</ul>' +
                            '<ul><b>DB Diagrams:</b>' +
                                 '<li><a data-ui-sref="admin.wikipedia.dbcompliancedocumentruleold">Compliance Document Rule (old)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.dbcompliancedocumentrulenew">Compliance Document Rule (new)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.dbworkflow">Workflow</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.dborganization">Organization</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.dbsourcedeductions">Source Deductions</a></li>' +
                            '</ul>' +
                            '<ul><b>fontello:</b>' +
                                 '<li><a data-ui-sref="admin.wikipedia.fontello">Fontello Icons</a></li>' +
                            '</ul>' +
                             '<ul><b>Workflow Diagrams:</b>' +
                                 '<li><a data-ui-sref="admin.wikipedia.timesheet">                            range:  20001 -  29999 (Timesheet)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.workorder">                            range:  30001 -  39999 (Workorder)</a></li>' +

                                 '<li><a data-ui-sref="admin.wikipedia.transactionheadermanualdraft">         range:  40001 -  49999 (Tr.H - Transaction Header Manual Draft)</a></li>' +
                                 
                                 '<li><a data-ui-sref="admin.wikipedia.billingtransaction">                   range:  40300 -  40399 (Tr.H - BillingTransaction)</a></li>' +
                                 
                                 '<li><a data-ui-sref="admin.wikipedia.paymenttransaction">                   range:  40001 -  49999 (Tr.H - Payment Transaction)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.transactionheaderactivenotreversed">   range:  40001 -  49999 (Tr.H - Transaction Header Active Not Reversed)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.transactionheaderactivereversed">      range:  40001 -  49999 (Tr.H - Active Reversed)</a></li>' +

                                 '<li><a data-ui-sref="admin.wikipedia.invoice">                              range:  41000 -  41099 (Invoice)</a></li>' +

                                 '<li><a data-ui-sref="admin.wikipedia.paymentreleasebatch">                  range:  50001 -  59999 (Payment Release Batch)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.payment">                              range:  60001 -  69999 (Payment)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.payrollfederaltax">                    range:  70001 -  79999 (Payroll Federal Tax)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.payrollprovincialtax">                 range:  80001 -  89999 (Payroll Provincial Tax)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.payrollsalestax">                      range:  90001 -  99999 (Payroll Sales Tax)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.vmsprocessedrecord">                   range: 100001 - 109999 (Vms Processed Record)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.paymenttransactiongarnishee">          range: 110001 - 119999 (Payment Transaction Garnishee)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.commissionrate">                       range: 120001 - 129999 (Commission Rate)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.vmsfee">                               range: 130001 - 139999 (VMS Fee)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.rebate">                               range: 140001 - 149999 (Rebate)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.organization">                         range: 170001 - 179999 (Organization)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.userprofile">                          range: 180001 - 189999 (User Profile)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.accesssubscription">                   range: 200001 - 209999 (AccessS ubscription)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.vmsdiscountrecord">                    range: 210001 - 219999 (Vms Discount Record)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.vmsdocument">                          range: 220001 - 229999 (VMS Document)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.compliancedocumentrule">               range: 300001 - 309999 (Compliance Document Rule)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.compliancedocument">                   range: 310001 - 319999 (Compliance Document)</a></li>' +
                            '</ul>' +
                            '<ul><b>Workflow Diagrams Old:</b>' +
                                 '<li><a data-ui-sref="admin.wikipedia.oldtimesheetsubmission">               (old) - Timesheet Submission</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.oldtransactionheader">                 (old) - Transaction Header</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.billing">                              (old) - Transaction Header  40001 -  49999 (Tr.H - Billing)</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.oldworkorderbasedonversionposition">   (old) - WorkOrder Based On Version Position</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.oldworkorderworkflowmigration">        (old) - WorkOrder Workflow Migration</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.oldcompliancedocumentrule">            (old) - Compliance Document Rule</a></li>' +
                                 '<li><a data-ui-sref="admin.wikipedia.oldcompliancedocument">                (old) - Compliance Document</a></li>' +
                             '</ul>' +
                        '</div>' +
                    '</div>'
            })
            .state("admin.wikipedia.timesheet", {
                url: '/timesheet',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/020001_029999_Timesheet.html',
            })
            .state("admin.wikipedia.workorder", {
                url: '/workorder',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/030001_039999_WorkOrder.html',
            })
            .state("admin.wikipedia.transactionheaderactivenotreversed", {
                url: '/transactionheaderactivenotreversed',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/040001_049999_TransactionHeader_ActiveNotReversed.html',
            })
            .state("admin.wikipedia.transactionheaderactivereversed", {
                url: '/transactionheaderactivereversed',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/040001_049999_TransactionHeader_ActiveReversed.html',
            })
            .state("admin.wikipedia.billing", {
                url: '/billing',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/040001_049999_TransactionHeader_Billing.html',
            })
            .state("admin.wikipedia.transactionheadermanualdraft", {
                url: '/transactionheadermanualdraft',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/040001_049999_TransactionHeader_ManualDraft.html',
            })
            .state("admin.wikipedia.payment", {
                url: '/payment',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/040001_049999_TransactionHeader_Payment.html',
            })
            .state("admin.wikipedia.paymenttransaction", {
                url: '/paymenttransaction',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/040001_049999_TransactionHeader_PaymentTransaction.html',
            })
            .state("admin.wikipedia.paymentreleasebatch", {
                url: '/paymentreleasebatch',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/050001_059999_PaymentReleaseBatch.html',
            })
            .state("admin.wikipedia.payrollfederaltax", {
                url: '/payrollfederaltax',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/070001_079999_PayrollFederalTax.html',
            })
            .state("admin.wikipedia.payrollprovincialtax", {
                url: '/payrollprovincialtax',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/080001_089999_PayrollProvincialTax.html',
            })
            .state("admin.wikipedia.payrollsalestax", {
                url: '/payrollsalestax',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/090001_099999_PayrollSalesTax.html',
            })
            .state("admin.wikipedia.vmsprocessedrecord", {
                url: '/vmsprocessedrecord',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/100001_109999_VmsProcessedRecord.html',
            })
            .state("admin.wikipedia.paymenttransactiongarnishee", {
                url: '/paymenttransactiongarnishee',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/110001_119999_PaymentTransactionGarnishee.html',
            })
            .state("admin.wikipedia.vmsfee", {
                url: '/vmsfee',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/130001_139999_VmsFee.html',
            })
            .state("admin.wikipedia.rebate", {
                url: '/rebate',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/140001_149999_Rebate.html',
            })
            .state("admin.wikipedia.organization", {
                url: '/organization',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/170001_179999_Organization.html',
            })
            .state("admin.wikipedia.userprofile", {
                url: '/userprofile',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/180001_189999_UserProfile.html',
            })
            .state("admin.wikipedia.accesssubscription", {
                url: '/accesssubscription',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/200001_209999_AccessSubscription.html',
            })
            .state("admin.wikipedia.vmsdocument", {
                url: '/vmsdocument',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/220001_229999_VmsDocument.html',
            })                
            //.state("admin.wikipedia.compliancedocumentrule", {
            //    url: '/compliancedocumentrule',
            //    templateUrl: '/Phoenix/modules/admin/views/Workflow/300001_309999_ComplianceDocumentRule.html',
            //})
            .state("admin.wikipedia.oldcompliancedocumentrule", {
                url: '/oldcompliancedocumentrule',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/300001_309999_ComplianceDocumentRule.html',
            })
            .state("admin.wikipedia.oldcompliancedocument", {
                url: '/oldcompliancedocument',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/310001_319999_ComplianceDocument.html',
            })
            .state("admin.wikipedia.commissionrate", {
                url: '/commissionrate',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/120001_129999_CommissionRate.html',
            })
            .state("admin.wikipedia.oldtimesheetsubmission", {
                url: '/oldtimesheetsubmission',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/old_TimesheetSubmission.html',
            })
            .state("admin.wikipedia.oldtransactionheader", {
                url: '/oldtransactionheader',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/old_TransactionHeader.html',
            })
            .state("admin.wikipedia.oldworkorderbasedonversionposition", {
                url: '/oldworkorderbasedonversionposition',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/old_WorkOrder_BasedOnVersionPosition.html',
            })
            .state("admin.wikipedia.oldworkorderworkflowmigration", {
                url: '/oldworkorderworkflowmigration',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/old_WorkOrder_WorkflowMigration.html',
            })
            .state("admin.wikipedia.vmsdiscountrecord", {
                url: '/vmsdiscountrecord',
                templateUrl: '/Phoenix/modules/admin/views/Workflow/210001_219999_VmsDiscountRecord.html',
            })
            .state("admin.wikipedia.fontello", {
                url: '/fontello',
                templateUrl: '/Phoenix/modules/admin/views/FontelloIconDemo.html',
            })
            .state("admin.wikipedia.billingtransaction", {
                url: '/billingtransaction',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FBillingTransactionWorkflow.pdf&version=C8177&contentOnly=true&__v=5" title="Workflow">Workflow</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FBillingTransactionWorkflow.pdf&version=C8177&contentOnly=true&__v=5"></div>'
            })
            .state("admin.wikipedia.invoice", {
                url: '/invoice',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FInvoiceWorkflow.pdf&version=C8177&contentOnly=true&__v=5" title="Workflow">Workflow</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FInvoiceWorkflow.pdf&version=C8177&contentOnly=true&__v=5"></div>'
            })
            .state("admin.wikipedia.compliancedocumentrule", {
                url: '/compliancedocumentrule',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FComplianceDocumentRule.pdf&version=C609&contentOnly=true&__v=5">Workflow</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FComplianceDocumentRule.pdf&version=C609&contentOnly=true&__v=5"></div>'
            })
            .state("admin.wikipedia.compliancedocument", {
                url: '/compliancedocument',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FComplianceDocument.pdf&version=C609&contentOnly=true&__v=5" title="Workflow">Workflow</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FWorkflowDiagrams%2FComplianceDocument.pdf&version=C609&contentOnly=true&__v=5"></div>'
            })
            .state("admin.wikipedia.doctheentitysecurityaccessvalidation", {
                url: '/doctheentitysecurityaccessvalidation',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDocs%2FTheEntitySecurityAccessValidation.pdf&version=C361&contentOnly=true&__v=5" title="The Entity Security Access Validation">The Entity Security Access Validation</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDocs%2FTheEntitySecurityAccessValidation.pdf&version=C361&contentOnly=true&__v=5"></div>'
            })
            .state("admin.wikipedia.docworkflow", {
                url: '/docworkflow',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDocs%2FWorkflow.pdf&version=C393&contentOnly=true&__v=5" title="Workflow">Workflow</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDocs%2FWorkflow.pdf&version=C393&contentOnly=true&__v=5"></div>'
             })
            .state("admin.wikipedia.angularmigration", {
                url: '/angularmigration',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDocs%2FAngularMigration.pdf&version=C8978&contentOnly=true&__v=5" title="Angular Migration">Angular Migration</a></div>' +
                          '<div><object type="application/pdf" width="100%" height="800px" data="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDocs%2FAngularMigration.pdf&version=C8978&contentOnly=true&__v=5"></div>'
            })
            .state("admin.wikipedia.dbworkflow", {
                url: '/dbworkflow',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FWorkflow.png&version=C527&contentOnly=true&__v=5" title="DB - Workflow">DB - Workflow</a></div>' +
                          '<div style="width: 100%; min-height:2000px; background:           url(http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FWorkflow.png&version=C527&contentOnly=true&__v=5) no-repeat; "></div>'
            })
            .state("admin.wikipedia.dborganization", {
                url: '/dborganization',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FOrganization.png&version=C2012&contentOnly=true&__v=5" title="DB - Organization">DB - Organization</a></div>' +
                          '<div style="width: 100%; min-height:2000px; background:           url(http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Ramsey%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FOrganization.png&version=C2012&contentOnly=true&__v=5) no-repeat; "></div>'
            })
            .state("admin.wikipedia.dbsourcedeductions", {
                url: '/dbsourcedeductions',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FSourceDeductions.png&version=C2505&contentOnly=true&__v=5" title="DB - Source Deductions">DB - Organization</a></div>' +
                          '<div style="width: 100%; min-height:2000px; background:           url(http://webdr01:8080/tfs/DefaultCollection/3dbc2c43-469e-449a-92fc-3f8a687f5ea0/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FSourceDeductions.png&version=C2505&contentOnly=true&__v=5) no-repeat; "></div>'
            })
            .state("admin.wikipedia.dbcompliancedocumentruleold", {
                url: '/dbcompliancedocumentruleold',
                template: '<div><a class="btn btn-default" target="_blank"                 href="http://webdr01:8080/tfs/DefaultCollection/917eb53f-2964-40fb-99d3-03794844e344/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FComplianceDocumentRuleOld.png&version=C5928&contentOnly=true&__v=5" title="DB - Compliance Document Rule (old)">DB - Compliance Document Rule (old)</a></div>' +
                    '<div style="width: 100%; min-height:2000px; background:                 url(http://webdr01:8080/tfs/DefaultCollection/917eb53f-2964-40fb-99d3-03794844e344/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FComplianceDocumentRuleOld.png&version=C5928&contentOnly=true&__v=5) no-repeat; "></div>'
            })
            .state("admin.wikipedia.dbcompliancedocumentrulenew", {
                url: '/dbcompliancedocumentrulenew',
                template: '<div>DB - Compliance Document Rule (new)'
                    + '  <a class="btn btn-default" target="_blank"                        href="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FComplianceDocumentRuleNew.png&version=C6017&contentOnly=true&__v=5" title="Open in new window">Open in new window</a>'
                    + '  <a class="btn btn-default" target="_blank"                        href="http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FComplianceDocumentRuleNew.png&version=6017&contentOnly=false&__v=5" title="Download">Download</a>'
                          + '</div>'
                          + '<div style="width: 100%; min-height:2000px; background:         url(http://webdr01:8080/tfs/DefaultCollection/612f4733-539e-43f1-9bd1-90f94f84b9d2/_api/_versioncontrol/itemContent?repositoryId=&path=%24%2FPhoenix_Oppenheimer%2FPhoenix%2FProcom.Phoenix.Wikipedia%2FDatabaseDiagrams%2FComplianceDocumentRuleNew.png&version=6017&contentOnly=true&__v=5) no-repeat; "></div>'
             })
            .state("admin.forceinvalidatecodecache", {
                url: '/forceinvalidatecodecache',
                template: '<div data-ui-view="" autoscroll="false">Force Invalidate Code Cache</div>',
                controller: ['common', 'AdminApiService', function (common, AdminApiService) {
                    AdminApiService.forceInvalidateCodeCache().then(function (successObj) {
                        common.logSuccess("Code Cache successfully invalidated");
                    }, function (failObj) {
                        common.logError('Error invalidating Code Cache');
                    });
                }]
            })
            .state("admin.payment", {
                url: '/payment',
                template:
                    '<div data-ui-view="" autoscroll="false">' +
                        '<div class="">' +
                            '<ul><b>Update Payment Versions</b>' +
                                '<li><a data-ui-sref="admin.payment.updatepaymentversions">Update Payment Versions</a></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>'
            })
            .state("admin.payment.updatepaymentversions", {
                url: '/updatepaymentversions',
                controller:['common','AdminApiService','$scope',function(common,AdminApiService,$scope){
                    $scope.ids='';
                    $scope.submit = function(ids){
                        AdminApiService.updatePaymentVersions(ids.split(',')).then(function (successObj) {
                            common.logSuccess("Payment Versions successfully updated");
                        }, function (failObj) {
                            common.logError('Error updating Payment Versions');
                        });
                    }
                }],
                template:
                    '<div data-ui-view="" autoscroll="false">' +
                        '<div class="">' +
                            '<b>Enter list of Payment Ids separated by a comma</b>' +
                            '<input class="form-control" ng-model="ids"/>' +
                            '<button class="btn" ng-click="submit(ids)">Submit</button>' +
                        '</div>' +
                    '</div>'
            })
            //.state("admin.workflow.migration", {
            //    url: '/workflowmigration',
            //    //controller: 'AdminController',
            //    //templateUrl: '/Phoenix/modules/admin/views/admin.html',
            //    resolve: {
            //        resolveworkflowMigration: ['$q', '$state', 'common', 'AdminApiService', function ($q, $state, common, AdminApiService) {
            //            common.setControllerName(configId);
            //            var result = $q.defer();
            //            common.logSuccess('Workflow Migration BEGIN');
            //            AdminApiService.workflowMigration().then(
            //                function (response) {
            //                    common.logSuccess('Workflow Migration DONE.');
            //                    common.logSuccess('To disable Navigation menu: "Admin/Workflow Migration" please republish db');
            //                    result.resolve(response);
            //                    $state.go('workorder.search');
            //                },
            //                function (responseError) {
            //                    common.responseErrorMessages(responseError);
            //                    result.reject(responseError);
            //                });
            //            return result.promise;
            //        }]
            //    }
            //})
            ;
        }
    ]);
})();