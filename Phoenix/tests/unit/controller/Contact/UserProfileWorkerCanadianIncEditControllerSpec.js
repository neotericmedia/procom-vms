//describe("Functionality of the Canadian Inc Edit Controller", function () {
//    var $httpBackend, scope, ctrl;
    
//    beforeEach(module('Phoenix'));
//    describe("Editing a Canadian Inc Edit Profile", function() {
//        // $scope', '$rootScope', '$location', '$route', 'OrganizationService', 'OrganizationDetailService', 'UserProfileWorkerCanadianIncService', 'CodeValueService', 'common', 'UtilityService', 'OrganizationDetailService', 'UserProfileService', 'NavigationService'
//        beforeEach(inject(function(_$httpBackend_, $rootScope, _$route_, $controller, OrganizationService, OrganizationDetailService, UserProfileWorkerCanadianIncService, CodeValueService, common, UtilityService, OrganizationDetailService, UserProfileService, NavigationService) {
//            $httpBackend = _$httpBackend_;
//            // data setup in tests/data/UserContext.js
//            $httpBackend.expectGET("/api/AppUser/GetUserContext").respond(200, angular.copy(window.UserContextResponse));
//            $httpBackend.expectGET("/api/AppUser/GetUserContext").respond(200, angular.copy(window.UserContextResponse));
//            // test data setup in tests/data/UserProfileWorkerCanadianInc_1.js
//            $httpBackend.expectGET("/api/UserProfileWorkerCanadianInc/36").respond(200, angular.copy(window.UserProfileWorkerCanadianInc_1.worker));
//            $httpBackend.expectGET("/api/Organization/GetIndependentContractorOrganizationDetails").respond(200, angular.copy(window.UserProfileWorkerCanadianInc_1.independentcontractorOrgDetails));
//            $httpBackend.expectGET("/api/UserProfile/CreateUserProfilePhone/36").respond(200, angular.copy(window.UserProfileWorkerCanadianInc_1.createUserProfilePhone));
//            $httpBackend.expectGET("/api/UserProfile/CreateUserProfileAddress/36").respond(200, angular.copy(window.UserProfileWorkerCanadianInc_1.createProfileAddress));
//            $httpBackend.expectGET("/api/UserProfileWorkerCanadianInc/CreateUserProfileWorkerSPTaxNumber/36").respond(200, angular.copy(window.UserProfileWorkerCanadianInc_1.createProfileTax));

//            scope = $rootScope.$new();
//            _$route_.current =
//            {
//                params: { entityId: 36 }
//            };

//            ctrl = $controller("UserProfileWorkerCanadianIncEditController",
//                {
//                    $scope: scope,
//                    $rootScope: $rootScope,
//                    OrganizationService: OrganizationService,
//                    OrganizationDetailService: OrganizationDetailService,
//                    UserProfileWorkerCanadianIncService: UserProfileWorkerCanadianIncService,
//                    CodeValueService: CodeValueService,
//                    common: common,
//                    UtilityService: UtilityService,
//                    OrganizationDetailService: OrganizationDetailService,
//                    UserProfileService: UserProfileService,
//                    $route: _$route_
//                });
//        }));

//        it('Should load the Inc Profile and set up the model', function() {
//            $httpBackend.flush();
//            expect(scope.model).toNotBe(undefined);
//            expect(scope.model.entity.Id).toEqual(36);
//        });

//        it('Should be loaded in in a "view" state', function () {
//            $httpBackend.flush();
//            expect(scope.model.mode.state).toBe('view');
//        });

//        it('Should keep the Preferred name in Sync with Legal Name if Preferred name has not been modified', function () {
//            $httpBackend.flush();
//            expect(scope.model.entity.Contact.FirstName).toEqual("First Name");
//            expect(scope.model.entity.Contact.PreferredFirstName).toEqual("First Name");
//            scope.model.entity.Contact.FirstName = "New Name";
//            if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {scope.$apply();}
//            else {scope.$eval();}
//            expect(scope.model.entity.Contact.FirstName).toEqual("New Name");
//            expect(scope.model.entity.Contact.PreferredFirstName).toEqual("New Name");
//        });

//        it('Should not keep Preferred name in Sync if the user modifies it directly', function() {
//            $httpBackend.flush();
//            expect(scope.model.entity.Contact.FirstName).toEqual("First Name");
//            expect(scope.model.entity.Contact.PreferredFirstName).toEqual("First Name");

//            scope.model.entity.Contact.PreferredFirstName = "New Name";
//            scope.model.entity.Contact.FirstName = "Other Name";

//            if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {scope.$apply();}
//            else {scope.$eval();}

//            expect(scope.model.entity.Contact.FirstName).toEqual("Other Name");
//            expect(scope.model.entity.Contact.PreferredFirstName).toEqual("New Name");
//        });
//    });
//});