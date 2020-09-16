(function (services) {
	'use strict';

	var serviceId = 'AssignmentApiService';

	angular.module('phoenix.workorder.services').factory(serviceId, ['$q', 'common', 'phoenixapi', 'SmartTableService', 'AssignmentDataService', 'CodeValueService', 'commonDataService', AssignmentApiService]);

	function AssignmentApiService($q, common, phoenixapi, SmartTableService, AssignmentDataService, CodeValueService, commonDataService) {
		common.setControllerName(serviceId);

		var service = {
			getAts: getAts,
			//  Queries
			getSearchByTableState: getSearchByTableState,
			getSearchByUserProfileIdWorker: getSearchByUserProfileIdWorker,
			getDuplicateAtsWorkOrder: getDuplicateAtsWorkOrder,
			getByAssignmentId: getByAssignmentId,
			getByWorkOrderId: getByWorkOrderId,
			getByWorkOrderVersionId: getByWorkOrderVersionId,
			getSalesTaxVersionRatesBySubdivisionAndOrganization: getSalesTaxVersionRatesBySubdivisionAndOrganization,
			getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker: getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker,

			getListOrganizationInternal: getListOrganizationInternal,
			getListOrganizationClient: getListOrganizationClient,
			getListOrganizationSupplier: getListOrganizationSupplier,

			getListUserProfileWorker: getListUserProfileWorker,
			getProfilesListOrganizational: getProfilesListOrganizational,
			getProfilesListOrganizationalByUserProfileType: getProfilesListOrganizationalByUserProfileType,
			getProfilesListByOrganizationId: getProfilesListByOrganizationId,
			getListUserProfileInternal: getListUserProfileInternal,
			getSalesPatterns: getSalesPatterns,

			getPaymentReleaseScheduleDetail: getPaymentReleaseScheduleDetail,

			getWCBHeadersBySubdivisionId: getWCBHeadersBySubdivisionId,
			getWCBCodesBySubdivisionId: getWCBCodesBySubdivisionId,
			getActiveWCBVersionInternalOrganizationProfileTypeByWCBHeaderIdAndOrganizationIdAndProfileTypeIdAndITWorker: getActiveWCBVersionInternalOrganizationProfileTypeByWCBHeaderIdAndOrganizationIdAndProfileTypeIdAndITWorker,

			getSearchWithDocumentCount: getSearchWithDocumentCount,
			getWorkOrdersWithDocumentCountForWidget: getWorkOrdersWithDocumentCountForWidget,
			getNoOfDeclinedWorkOrders: getNoOfDeclinedWorkOrders,
			//  Custom methods
			getWorkOrderCodeValueLists: getWorkOrderCodeValueLists,
			getSubdivisionIdByWorksiteId: getSubdivisionIdByWorksiteId,
			getDefaultAssignment: getDefaultAssignment,
			defaultAssignment: defaultAssignment,
			getDefaultWorkOrderPurchaseOrderLine: getDefaultWorkOrderPurchaseOrderLine,
			lazyLoadStaticDataToAssignmentDataService: lazyLoadStaticDataToAssignmentDataService,

			//  Commands
			workOrderSave: workOrderSave,
			workOrderSubmit: workOrderSubmit,
			workOrderFinalize: workOrderFinalize,
			workOrderTerminate: workOrderTerminate,
			workOrderNew: workOrderNew,
			workOrderScheduleChange: workOrderScheduleChange,
			workOrderCorrect: workOrderCorrect,
			transactionHeaderManualNew: transactionHeaderManualNew,
			transactionHeaderAdjustmentNew: transactionHeaderAdjustmentNew,
			workOrderVersionCommissionPicker: workOrderVersionCommissionPicker,
		};

		return service;

		//  Queries
		function getAts(atsSourceId, atsPlacementId) {
			return phoenixapi.query('assignment/getAts/atsSourceId/' + atsSourceId + '/atsPlacementId/' + atsPlacementId);
		}
		function getSearchByTableState(tableState, oDataParams, stateName) {
			var path = (stateName === 'workorder.pendingApproval') ? 'getPendingReview' : 'getSearch';
			var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
			return phoenixapi.query('assignment/' + path + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
		}

		function getSearchByUserProfileIdWorker(userProfileIdWOrker) {
			var path = 'getSearch';
			var oDataQuery = oreq.request().withSelect([
				'WorkOrderFullNumber',
				'WorkerName',
				'WorkerProfileType',
				'WorkOrderStatus',
				'AssignmentId',
				'WorkOrderId',
				'WorkOrderStatusId',
				'WorkOrderVersionId',
				'InternalCompanyDisplayName',
				'OrganizationIdInternal',
				'UserProfileIdWorker'
			])
				.withFilter(
					oreq.filter('UserProfileIdWorker').eq(userProfileIdWOrker).and().filter('WorkOrderStatusId').eq(ApplicationConstants.WorkOrderStatus.Active)
						.or()
						.filter('UserProfileIdWorker').eq(userProfileIdWOrker).and().filter('WorkOrderStatusId').eq(ApplicationConstants.WorkOrderStatus.Expired)
				)
				.url();
			return phoenixapi.query('assignment/' + path + '?' + oDataQuery);
		}

		function getDuplicateAtsWorkOrder(atsSourceId, atsPlacementId) {
			var path = 'getSearch';
			var oDataQuery = oreq.request().withSelect([
				'WorkOrderFullNumber',
				'WorkerName',
				'StartDate',
				'EndDate',
				'WorkOrderStatus',
				'AssignmentId',
				'WorkOrderId',
				'WorkOrderVersionId'
			])
			.withFilter(
				oreq.filter('AtsSourceId').eq(atsSourceId)
					.and().filter('AtsPlacementId').eq(atsPlacementId)
					.and().filter('WorkOrderStatusId').ne(ApplicationConstants.WorkOrderStatus.Cancelled)
					.and().filter('WorkOrderStatusId').ne(ApplicationConstants.WorkOrderStatus.Discarded)
			)
			.url();
			return phoenixapi.query('assignment/' + path + '?' + oDataQuery);
		}

		function getByAssignmentId(assignmentId, oDataParams) {
			return phoenixapi.query('assignment?id=' + assignmentId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
		}
		function getByWorkOrderId(workOrderId, oDataParams) {
			return phoenixapi.query('assignment/getByWorkOrderId/' + workOrderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}
		function getByWorkOrderVersionId(workOrderVersionId, oDataParams) {
			return phoenixapi.query('assignment/getByWorkOrderVersionId/' + workOrderVersionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}
		function getSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId, oDataParams) {
			//return phoenixapi.query('SalesTaxVersionRate/getSalesTaxVersionRatesBySubdivisionAndOrganization/subdivision/' + subdivisionIdSalesTax + '/Organization/' + organizationId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
			var deferred = $q.defer();
			if (subdivisionIdSalesTax && subdivisionIdSalesTax > 0 && organizationId && organizationId > 0) {
				oDataParams = oDataParams || oreq.request().withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'IsApplied', 'HasNumberAssigned']).url();
				if (common.isEmptyObject(AssignmentDataService.getSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId))) {
					phoenixapi.query('SalesTaxVersionRate/getSalesTaxVersionRatesBySubdivisionAndOrganization/subdivision/' + subdivisionIdSalesTax + '/Organization/' + organizationId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')).then(
						function (response) {
							AssignmentDataService.setSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId, response.Items);
							deferred.resolve(response.Items);
						},
						function (responseError) {
							deferred.reject(responseError);
						});
				} else {
					var salesTaxVersionRatesBySubdivisionAndOrganization = AssignmentDataService.getSalesTaxVersionRatesBySubdivisionAndOrganization(subdivisionIdSalesTax, organizationId);
					deferred.resolve(salesTaxVersionRatesBySubdivisionAndOrganization);
				}
			}
			else {
				deferred.resolve([]);
			}

			return deferred.promise;
		}

		function getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker(subdivisionIdSalesTax, profileId, oDataParams) {
			return phoenixapi.query('SalesTaxVersionRate/getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker/Subdivision/' + subdivisionIdSalesTax + '/Profile/' + profileId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}



		function getListOrganizationClient(oDataParams) {
			oDataParams = oDataParams || oreq.request().
				withExpand(['OrganizationAddresses, OrganizationClientRoles, OrganizationClientRoles/OrganizationClientRoleAlternateBills ']).
				withSelect(['Id', 'DisplayName', 'OrganizationAddresses/IsPrimary', 'OrganizationAddresses/SubdivisionId', 'OrganizationClientRoles/IsChargeSalesTax', 'OrganizationClientRoles/ClientSalesTaxDefaultId', 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/Id', 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillCode', 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillLegalName',
					'OrganizationClientRoles/UsesThirdPartyImport', 'OrganizationClientRoles/IsBillSalesTaxAppliedOnExpenseImport', 'OrganizationClientRoles/IsPaySalesTaxAppliedOnExpenseImport'])
				.url();
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getListOrganizationClient())) {
				phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + oDataParams).then(
					function (response) {
						AssignmentDataService.setListOrganizationClient(response.Items);
						deferred.resolve(response.Items);
					},
					function (responseError) {
						deferred.reject(responseError);
					});
			} else {
				deferred.resolve(AssignmentDataService.getListOrganizationClient());
			}
			return deferred.promise;
		}
		function getListOrganizationSupplier(oDataParams) {
			oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName']).url();
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getListOrganizationSupplier())) {
				// B8345 : phoenixapi.query('org/getListSupplierOrganizationsOriginalAndStatusIsActiveOrPendingChange?' + oDataParams).then(
				phoenixapi.query('org/getListSupplierOrganizationsOriginal?' + oDataParams).then(
					function (response) {
						AssignmentDataService.setListOrganizationSupplier(response.Items);
						deferred.resolve(response.Items);
					},
					function (responseError) {
						deferred.reject(responseError);
					});
			} else {
				deferred.resolve(AssignmentDataService.getListOrganizationSupplier());
			}
			return deferred.promise;
		}

		function getListUserProfileWorker(oDataParams) {
			oDataParams = oDataParams || oreq.request().withExpand(['Contact', 'UserProfileAddresses', 'UserProfileWorkerSourceDeductions', 'UserProfileWorkerOtherEarnings', 'UserProfilePaymentMethods', 'UserProfileWorkerSPGovernmentRulings']).
				withSelect(['Id', 'ContactId', 'ProfileStatusId', 'ProfileTypeId', 'PayeeName', 'PaymentMethodId', 'OrganizationId', 'UserProfileIdOrgRep', 'TaxSubdivisionId', 'Contact/Id', 'Contact/FullName',

					//'UserProfileWorkerSourceDeduction/Id',
					'UserProfileWorkerSourceDeductions/IsApplied',
					'UserProfileWorkerSourceDeductions/SourceDeductionTypeId',
					'UserProfileWorkerSourceDeductions/RatePercentage',
					'UserProfileWorkerSourceDeductions/RateAmount',

					//'UserProfileWorkerOtherEarnings/Id',
					'UserProfileWorkerOtherEarnings/IsApplied',
					'UserProfileWorkerOtherEarnings/IsAccrued',
					'UserProfileWorkerOtherEarnings/PaymentOtherEarningTypeId',
					'UserProfileWorkerOtherEarnings/RatePercentage',

					//'UserProfileAddresses/Id',
					'UserProfileAddresses/ProfileAddressTypeId',
					'UserProfileAddresses/SubdivisionId',

					//'UserProfileaymentMethods'
					'UserProfilePaymentMethods/PaymentMethodTypeId',
					'UserProfilePaymentMethods/IsSelected',
					'UserProfilePaymentMethods/IsPreferred',

					'UserProfileWorkerSPGovernmentRulings/OrganizationIdClient',
					'UserProfileWorkerSPGovernmentRulings/EffectiveYear'
				]).url();
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getListUserProfileWorker())) {
				phoenixapi.query('UserProfile/getListUserProfileWorker' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')).then(

					function (response) {

						AssignmentDataService.setListUserProfileWorker(response.Items);
						deferred.resolve(response.Items);
					},
					function (responseError) {
						deferred.reject(responseError);
					});
			} else {
				deferred.resolve(AssignmentDataService.getListUserProfileWorker());
			}
			return deferred.promise;
		}

		function getProfilesListOrganizationalByUserProfileType(organizationId, userProfileType, oDataParams) {
			oDataParams = oDataParams || oreq.request().withExpand(['Contact']).withSelect(['Id', 'ProfileStatusId', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName']).url();
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getProfilesListOrganizational(organizationId))) {
				phoenixapi.query('UserProfile/' + userProfileType + '/UserProfiles?organizationId=' + organizationId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : '')).then(
					function (response) {
						AssignmentDataService.setProfilesListOrganizational(organizationId, response.Items);
						deferred.resolve(response.Items);
					},
					function (responseError) {
						deferred.reject(responseError);
					});
			}
			else {
				deferred.resolve(AssignmentDataService.getProfilesListOrganizational(organizationId));
			}
			return deferred.promise;
		}

		function getProfilesListOrganizational(organizationId, oDataParams) {
			oDataParams = oDataParams || oreq.request().withExpand(['Contact']).withSelect(['Id', 'ProfileStatusId', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName']).url();
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getProfilesListOrganizational(organizationId))) {
				phoenixapi.query('UserProfile/' + ApplicationConstants.UserProfileType.Organizational + '/UserProfiles?organizationId=' + organizationId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : '')).then(
					function (response) {
						AssignmentDataService.setProfilesListOrganizational(organizationId, response.Items);
						deferred.resolve(response.Items);
					},
					function (responseError) {
						deferred.reject(responseError);
					});
			}
			else {
				deferred.resolve(AssignmentDataService.getProfilesListOrganizational(organizationId));
			}
			return deferred.promise;
		}
		function getProfilesListByOrganizationId(organizationId, oDataParams) {
			oDataParams = oDataParams || oreq.request().withExpand(['Contact']).withSelect(['Id', 'ProfileStatusId', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName']).url();
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getProfilesListByOrganizationId(organizationId))) {
				phoenixapi.query('UserProfile/' + 0 + '/UserProfiles?organizationId=' + organizationId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : '')).then(
					function (response) {
						AssignmentDataService.setProfilesListByOrganizationId(organizationId, response.Items);
						deferred.resolve(response.Items);
					},
					function (responseError) {
						deferred.reject(responseError);
					});
			}
			else {
				deferred.resolve(AssignmentDataService.getProfilesListByOrganizationId(organizationId));
			}
			return deferred.promise;
		}

		function getPaymentReleaseScheduleDetail(paymentReleaseScheduleId, oDataParams) {
			return phoenixapi.query('Payment/getPaymentReleaseScheduleDetail/' + paymentReleaseScheduleId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}
		function getWCBHeadersBySubdivisionId(subdivisionId, oDataParams) {
			return phoenixapi.query('Payroll/getWCBHeadersBySubdivisionId/' + subdivisionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}
		function getWCBCodesBySubdivisionId(subdivisionId, organizationIdInternal, oDataParams) {
			return phoenixapi.query('Payroll/getWCBCodesBySubdivisionId/' + subdivisionId + '/' + organizationIdInternal + '/' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}


		function getActiveWCBVersionInternalOrganizationProfileTypeByWCBHeaderIdAndOrganizationIdAndProfileTypeIdAndITWorker(headerId, organizationId, profileTypeId, isITWorker) {
			return phoenixapi.query('Payroll/getActiveWCBVersionInternalOrganizationProfileTypeByWCBHeaderIdAndOrganizationIdAndProfileTypeIdAndITWorker/' + headerId + '/' + organizationId + '/' + profileTypeId + '/' + isITWorker);
		}

		function getSearchWithDocumentCount(tableState, oDataParams) {
			var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
			return phoenixapi.query('assignment/getSearchWithDocumentCount?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
		}

		function getWorkOrdersWithDocumentCountForWidget(oDataParams) {
			return phoenixapi.query('assignment/getSearchWithDocumentCount?' + oDataParams);
		}

		function getNoOfDeclinedWorkOrders() {
			var oDataParams = "$inlinecount=allpages&$top=0";
			return phoenixapi.query('assignment/getDeclinedAssignmentSearch?' + oDataParams);
		}

		//  Custom methods
		function getWorkOrderCodeValueLists() {
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getCodeValueLists())) {
				var list = {};

				list.workOrderStatuses = CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true);


				//tab core
				list.lineOfBusinesses = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness);
				list.workOrderPositionTitles = CodeValueService.getCodeValues(CodeValueGroups.PositionTitle, true);
				list.workOrderWorkLocations = CodeValueService.getCodeValues(CodeValueGroups.Worksite, true);
				list.wcbCodeList = [];

				list.InternalOrganizationDefinition1List = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition1, true);
				list.InternalOrganizationDefinition2List = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition2, true);
				list.InternalOrganizationDefinition3List = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition3, true);
				list.InternalOrganizationDefinition4List = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition4, true);
				list.InternalOrganizationDefinition5List = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition5, true);

				//tab partiesAndRates
				list.currencies = CodeValueService.getCodeValues(CodeValueGroups.Currency);
				list.profileTypeList = CodeValueService.getCodeValues(CodeValueGroups.ProfileType, true);
				list.workOrderRateTypes = CodeValueService.getCodeValues(CodeValueGroups.RateType, true);
				list.workOrderRateTypes.splice(5, 1);// To Remove RateType 'Stat'; This RateType is calculated by the builder only
				list.workOrderRateTypes.splice(4, 1);// To Remove RateType 'Other'; This RateType is used for manual transaction only.
				list.workOrderRateUnits = CodeValueService.getCodeValues(CodeValueGroups.RateUnit, true);
				list.rebateTypes = CodeValueService.getCodeValues(CodeValueGroups.RebateType, true);

				//tab timeMaterialInvoice
				list.workOrderTimesheetCycles = CodeValueService.getCodeValues(CodeValueGroups.TimeSheetCycle, true);
				list.workOrderDeliveryMethods = CodeValueService.getCodeValues(CodeValueGroups.DeliveryMethod, true);
				list.workOrderPaymentMethods = CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType, true);

				list.workOrderBillingFrequencies = CodeValueService.getCodeValues(CodeValueGroups.BillingFrequency, true);
				list.workOrderPaymentReleaseSchedules = CodeValueService.getCodeValues(CodeValueGroups.PaymentReleaseSchedule, true);

				list.workOrderBillingInvoiceTerms = CodeValueService.getCodeValues(CodeValueGroups.BillingInvoiceTerms, true);
				list.billingInvoicePresentationStyles = CodeValueService.getCodeValues(CodeValueGroups.BillingInvoicePresentationStyle, true);
				list.billingConsolidationTypes = CodeValueService.getCodeValues(CodeValueGroups.BillingConsolidationType, true);

				list.billingTransactionGenerationMethod = _.map(CodeValueService.getCodeValues(CodeValueGroups.BillingTransactionGenerationMethod, true),
					function (i) {
						return { key: i.id, value: i.text };
					});
				list.workOrderPaymentInvoiceTerms = CodeValueService.getCodeValues(CodeValueGroups.PaymentInvoiceTerms, true);

				list.workOrderBillingInvoiceTemplates = CodeValueService.getCodeValues(CodeValueGroups.BillingInvoiceTemplate, true);
				list.workOrderPaymentInvoiceTemplates = CodeValueService.getCodeValues(CodeValueGroups.PaymentInvoiceTemplate, true);

				list.workOrderBillingRecipientTypes = CodeValueService.getCodeValues(CodeValueGroups.RecipientType, true);


				list.workOrderTimesheetMethodologies = CodeValueService.getCodeValues(CodeValueGroups.TimeSheetMethodology, true);
				list.workOrderTimesheetApprovalFlows = CodeValueService.getCodeValues(CodeValueGroups.TimeSheetApprovalFlow, true);

				//tab expense management
				list.workOrderExpenseMethodologies = CodeValueService.getCodeValues(CodeValueGroups.ExpenseMethodology, true);

				//tab Taxes
				let workOrderSalesTaxTerritoriesCA = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryCanada, CodeValueGroups.Country);
				let workOrderSalesTaxTerritoriesUSA = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryUSA, CodeValueGroups.Country);
				list.workOrderSalesTaxTerritories = workOrderSalesTaxTerritoriesCA.concat(workOrderSalesTaxTerritoriesUSA);
				list.salesTaxes = CodeValueService.getCodeValues(CodeValueGroups.SalesTax, true);

				list.purchaseOrderStatuses = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderStatus, true);
				list.purchaseOrderDepletedOptionList = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderDepletedOptions, true);
				list.purchaseOrderDepletedGroupList = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderDepletedGroups, true);
				list.currencyList = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);
				list.workOrderPurchaseOrderLineStatusList = CodeValueService.getCodeValues(CodeValueGroups.WorkOrderPurchaseOrderLineStatus, true);

				list.sourceDeductionTypeList = CodeValueService.getCodeValues(CodeValueGroups.SourceDeductionType, true);
				list.paymentOtherEarningTypeList = CodeValueService.getCodeValues(CodeValueGroups.PaymentOtherEarningType, true);

				AssignmentDataService.setCodeValueLists(list);
				deferred.resolve(list);
			} else {
				deferred.resolve(AssignmentDataService.getCodeValueLists());
			}
			return deferred.promise;
		}

		function getSubdivisionIdByWorksiteId(worksiteId) {
			var subdivisionId = 0;
			if (worksiteId) {
				var workOrderWorkLocations = CodeValueService.getCodeValues(CodeValueGroups.Worksite, true);

				var worksiteSelected = _.find(workOrderWorkLocations, function (worksite) { return worksite.id == worksiteId; });
				subdivisionId = worksiteSelected.parentId;
			}
			else {
				subdivisionId = 0;
			}
			return subdivisionId;
		}

		function defaultAssignment() {
			var response = {
				'Id': 0,
				'IsDraft': true,
				'StatusId': 1,
				'UserProfileIdWorker': 0,
				'OrganizationIdInternal': 0,
				'IsWorkflowRunning': false,
				'WorkOrders': [
					{
						'Id': 0,
						'AssignmentId': 0,
						'WorkOrderCreationReasonId': 1,
						'StatusId': 1,
						'IsDraft': true,
						'WorkOrderNumber': 0,
						'WorkOrderVersions': [
							{
								'Id': 0,
								'WorkOrderId': 0,
								'VersionNumber': 1,
								'EffectiveDate': new Date(),
								'WorkOrderCreationReasonId': 1,
								'StatusId': 1,
								'ExpenseMethodologyId': ApplicationConstants.ExpenseMethodology.NoExpense,
								'BillingInfoes': [
									{
										'Id': 0,
										'IsDraft': true,
										'WorkOrderVersionId': 0,
										'SubdivisionIdSalesTax': 0,
										'BillingRates': [
											{
												'BillingInfoId': 0,
												'Id': 0,
												'IsDraft': true,
												'RateTypeId': 1,
											}
										],
										'BillingSalesTaxes': [

										],
										'BillingInvoices': [
											{
												'Id': 0,
												'BillingInfoId': 0,
												'InvoiceTypeId': 1,
												'BillingInvoicePresentationStyleId': 2,
												'IsDraft': true,
												'BillingRecipients': [
													{
														'BillingInfoId': 0,
														'Id': 0,
														'IsDraft': true,
														'RecipientTypeId': 1,
													}
												],
											},
											{
												'Id': 0,
												'BillingInfoId': 0,
												'InvoiceTypeId': 2,
												'BillingInvoicePresentationStyleId': null,
												'IsDraft': true,
												'BillingRecipients': [
													{
														'BillingInfoId': 0,
														'Id': 0,
														'IsDraft': true,
														'RecipientTypeId': 1,
													}
												],
											}

										]
									}
								],
								'PaymentInfoes': [
									{
										'Id': 0,
										'WorkOrderVersionId': 0,
										'IsDraft': true,
										'SubdivisionIdSalesTax': null,
										'SubdivisionIdSourceDeduction': 0,
										'IsUseUserProfileWorkerSourceDeduction': true,
										'PaymentContacts': [
											{
												'Id': 0,
												'IsDraft': true,
												'PaymentInfoId': 0,
											}
										],
										'PaymentSalesTaxes': [],
										'PaymentSourceDeductions': [],
										'PaymentOtherEarnings': [],
										'PaymentRates': [
											{
												'Id': 0,
												'IsDraft': true,
												'PaymentInfoId': 0,
												'RateTypeId': 1,
												'IsApplyDeductions': true,
                                                'IsApplyVacation': true
											}
										],
										'PaymentInvoices': [
											{
												'Id': 0,
												'PaymentInfoId': 0,
												'InvoiceTypeId': 1,
												'IsDraft': true,
												'PaymentInvoiceTemplateId': ApplicationConstants.PaymentInvoiceTemplate.PCGLStandardPaymentVoucher,
												'PaymentMethodId': ApplicationConstants.PaymentMethodType.FromPayeeProfile,
											},
											{
												'Id': 0,
												'PaymentInfoId': 0,
												'InvoiceTypeId': 2,
												'IsDraft': true,
											}
										]
									}
								],
								'TimeSheetApprovers': [
									{
										'Id': 0,
										'WorkOrderVersionId': 0,
										'IsDraft': true,
										'MustApprove': true,
										'Sequence': 1,
									}
								],
								'ExpenseApprovers': [
									{
										'Id': 0,
										'WorkOrderVersionId': 0,
										'ApproverTypeId': 1,
										'IsDraft': true,
										'MustApprove': true,
										'Sequence': 3
									}
								],
								'IsEligibleForCommission': false,
								'TimeSheetApprovalFlowId': 2,   // Sequential
								'ExpenseApprovalFlowId': 2,     // Sequential
								'IsDraft': true,
							}
						],
						'IsWorkflowRunning': false
					}
				],

			};
			return response;
		}
		function getDefaultAssignment() {
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getDefaultAssignment())) {
				var response = defaultAssignment();
				AssignmentDataService.setDefaultAssignment(response);
				deferred.resolve(response);
				//    });
			}
			else {
				deferred.resolve(AssignmentDataService.getDefaultAssignment());
			}
			return deferred.promise;
		}

		function getDefaultWorkOrderPurchaseOrderLine() {
			var deferred = $q.defer();
			if (common.isEmptyObject(AssignmentDataService.getDefaultWorkOrderPurchaseOrderLine())) {
				var response = {
					'Id': 0,
					'WorkOrderId': 0,
					'PurchaseOrderLineId': 0,
					'AmountCommited': null,
					'StatusId': 1,
					'IsDraft': true,
					'AllocationNote': null,
					'LastModifiedByProfileId': 0,
					'LastModifiedByContactName': null,
					'LastModifiedDatetime': '0001-01-01T05:00:00.000Z',
					'CreatedByProfileId': 0,
					'CreatedByContactName': null,
					'CreatedDatetime': '0001-01-01T05:00:00.000Z',
					'AssignmentId': 0,
					'WorkOrderStartDate': null,
					'WorkOrderEndDate': null,
					'WorkOrderNumber': 0,
					'PurchaseOrderId': 0,
					'PurchaseOrderDescription': null,
					'PurchaseOrderLineEndDate': null,
					'PurchaseOrderLineNumber': null,
					'PurchaseOrderDepletionGroupId': null,
					'PurchaseOrderLineStartDate': null,
					'PurchaseOrderNumber': null,
					'OrganizationId': null,
					'OrganizationLegalName': null,
					'AmountAllowed': 0.0,
					'AmountReserved': 0.0,
					'AmountSpent': 0.0,
					'AmountTotal': 0.0,
					'IsWorkflowRunning': false
				};
				AssignmentDataService.setDefaultWorkOrderPurchaseOrderLine(response);
				deferred.resolve(response);
			}
			else {
				deferred.resolve(AssignmentDataService.getDefaultWorkOrderPurchaseOrderLine());
			}
			return deferred.promise;
		}
		function lazyLoadStaticDataToAssignmentDataService() {
			var promises = [];
			//phoenixapi.query('assignment?id=0');//   Its needed to cash Entity Framework SQL query to receive Assignment
			//phoenixapi.query('transactionHeader/getApprovedByWorkOrderId/0');//   Its needed to cash Entity Framework SQL query to receive Transactions
			promises.push(getDefaultAssignment());
			promises.push(getDefaultWorkOrderPurchaseOrderLine());
			promises.push(getListOrganizationInternal());
			promises.push(getListOrganizationClient());
			promises.push(getListOrganizationSupplier());
			promises.push(getListUserProfileWorker());
			promises.push(getWorkOrderCodeValueLists());

			return $q.all(promises);
		}

		function getListOrganizationInternal(oDataParams) {
			oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
			var deferred = $q.defer();
			deferred.resolve(commonDataService.getListOrganizationInternal(oDataParams));
			return deferred.promise;
		}

		function getListUserProfileInternal(oDataParams) {
			var filter = oreq.filter('Contact/UserStatusId').eq("'1'");
			var internalDataParams = oreq.request().withExpand(['Contact']).withSelect(['Id', 'Contact/FullName']).withFilter(filter).url();
			oDataParams = oDataParams || internalDataParams;

			return phoenixapi.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}

		function getSalesPatterns(oDataParams) {
			return phoenixapi.query('commission/getAllSalesPatterns' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
		}

		// Commands
		function workOrderSave(command) {
			return phoenixapi.command('WorkOrderSave', command);
		}
		function workOrderSubmit(command) {
			return phoenixapi.command('WorkOrderSubmit', command);
		}
		function workOrderFinalize(command) {
			return phoenixapi.command('WorkOrderFinalize', command);
		}
		function workOrderTerminate(command) {
			return phoenixapi.command('WorkOrderTerminate', command);
		}
		function workOrderNew(command) {
			return phoenixapi.command('WorkOrderNew', command);
		}
		function transactionHeaderManualNew(command) {
			return phoenixapi.command('TransactionHeaderManualNew', command);
		}
		function transactionHeaderAdjustmentNew(command) {
			return phoenixapi.command('TransactionHeaderAdjustmentNew', command);
		}
		function workOrderScheduleChange(command) {
			return phoenixapi.command('WorkOrderScheduleChange', command);
		}
		function workOrderCorrect(command) {
			return phoenixapi.command('WorkOrderCorrect', command);
		}
		function workOrderVersionCommissionPicker(command) {
			//SergeyM: NOT ok- must be migrated to assembler
			return phoenixapi.command('WorkOrderVersionCommissionPicker', command);
		}
	}
}(Phoenix.Services));