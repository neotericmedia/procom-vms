///// <reference path="../../../../libs/jasmine-1.3.1/jasmine.js" />
///// <reference path="../../../../libs/angular/angular.js" />
///// <reference path="../../../../libs/angular/angular-resource.js" />
///// <reference path="../../../../libs/angular/angular-sanitize.js" />
///// <reference path="../../../../libs/angular/angular-mocks.js" />
///// <reference path="../../../../libs/mvcbase/jquery-1.7.1.js" />
///// <reference path="../../../../libs/mvcbase/jquery-ui-1.8.20.js" />
///// <reference path="../../../../libs/bootstrap/bootstrap.js" />
///// <reference path="../../../../libs/angular-ui/angular-ui.js" />
///// <reference path="../../../../libs/Base64/" />
///// <reference path="../../../../libs/moment/moment.js" />
///// <reference path="../../../../libs/moment/moment-range.js" />
///// <reference path="../../../../libs/pdfjs/pdf.js" />
///// <reference path="../../../../libs/underscore/underscore.js" />
///// <reference path="../../../../js/app/app.js" />
///// <reference path="../../../../js/app/controller/" />
///// <reference path="../../../../js/app/filter/" />
///// <reference path="../../../../js/app/directive/" />
///// <reference path="../../../../js/app/service/" />

///*
//    Root Controller Functionality
//    - Load UserContext
//    - Handles Navigation Events
//        - on routeChangeSuccess, find navigation item that matches the route
//    - Warn user about leaving current route if dirty form exists
//        - confirm exit - change route
//        - cancel exit, stay on current

//*/

//describe("The Root Controller", function () {

//    beforeEach(module('Phoenix'));

//    var scope, ctrl, rootScope, common, userService, $httpBackend, controller;

//    describe("Loading a user with only 1 workspace", function () {
        
//        beforeEach(inject(function ($injector, $rootScope, $controller, common, UserApiService) {
            
//            userService = UserApiService;
//            scope = $rootScope.$new();
            
//            $httpBackend = $injector.get('$httpBackend');

//            $httpBackend.expectGET('/api/UserAPI/GetContext').respond({ "IsLoggedIn": true, "UserName": "Worker@acme.ca", "ApiSessionId": "7e146d28-10d2-4a92-a27c-42b0d69f4749", "Workspaces": [{ "Code": "Worker", "SortOrder": 3, "Name": "Worker", "Description": "Worker", "IconUrl": "", "UpdateUserId": 0, "UpdatedTimestamp": "2013-02-11T11:57:18.6443872", "ValidationMessages": [] }], "UserId": 49 });
//            $httpBackend.expectGET('/api/UserAPI/GetWorkspaceNavigation/Worker').respond([{ Code: "BillingDocuments", SortOrder: 512, Name: "Billing Documents", Description: "Billing Documents", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments", SubItems: [{ Code: "BillingDocuments.BillingDocuments", SortOrder: 528, Name: "Billing Documents", Description: "Billing Documents", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "BillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments/BillingDocuments", SubItems: [{ Code: "BillingDocuments.BillingDocuments.BillingDocumentsLandingPage", SortOrder: 529, Name: "Billing Documents Landing Page", Description: "Billing Documents Landing Page", IconUrl: "", FunctionalOperationCode: "BillingDocumentsLandingPage", ParentItemCode: "BillingDocuments.BillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments/BillingDocumentsLandingPage", SubItems: [] }] }, { Code: "BillingDocuments.EnterBillingDocuments", SortOrder: 544, Name: "Enter Billing Documents", Description: "Enter Billing Documents", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "BillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments/EnterBillingDocuments", SubItems: [{ Code: "BillingDocuments.EnterBillingDocuments.EnterTimesheets", SortOrder: 545, Name: "Enter Timesheets", Description: "Enter Timesheets", IconUrl: "", FunctionalOperationCode: "EnterTimesheets", ParentItemCode: "BillingDocuments.EnterBillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/EnterBillingDocuments/EnterTimesheets", SubItems: [] }] }, { Code: "BillingDocuments.ManageBillingDocuments", SortOrder: 592, Name: "Manage Billing Documents", Description: "Manage Billing Documents", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "BillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments/ManageBillingDocuments", SubItems: [{ Code: "BillingDocuments.ManageBillingDocuments.ManageTimesheets", SortOrder: 593, Name: "Manage Timesheets", Description: "Manage Timesheets", IconUrl: "", FunctionalOperationCode: "ManageTimesheets", ParentItemCode: "BillingDocuments.ManageBillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/ManageBillingDocuments/ManageTimesheets", SubItems: [] }] }, { Code: "BillingDocuments.ProjectManagement", SortOrder: 608, Name: "Project Management", Description: "Project Management", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "BillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments/ProjectManagement", SubItems: [{ Code: "BillingDocuments.ProjectManagement.CreateNewProject", SortOrder: 609, Name: "Create New Project", Description: "Create New Project", IconUrl: "", FunctionalOperationCode: "CreateNewProject", ParentItemCode: "BillingDocuments.ProjectManagement", Controller: "", Template: "", RouteTypeId: null, RouteString: "/ProjectManagement/CreateNewProject", SubItems: [] }] }, { Code: "BillingDocuments.ExportBillingDocuments", SortOrder: 624, Name: "Export Billing Documents", Description: "Export Billing Documents", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "BillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/BillingDocuments/ExportBillingDocuments", SubItems: [{ Code: "BillingDocuments.ExportBillingDocuments.ExportTimesheets", SortOrder: 625, Name: "Export Timesheets", Description: "Export Timesheets", IconUrl: "", FunctionalOperationCode: "ExportTimesheets", ParentItemCode: "BillingDocuments.ExportBillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/ExportBillingDocuments/ExportTimesheets", SubItems: [] }, { Code: "BillingDocuments.ExportBillingDocuments.ExportExpenseClaims", SortOrder: 626, Name: "Export Expense Claims", Description: "Export Expense Claims", IconUrl: "", FunctionalOperationCode: "ExportExpenseClaims", ParentItemCode: "BillingDocuments.ExportBillingDocuments", Controller: "", Template: "", RouteTypeId: null, RouteString: "/ExportBillingDocuments/ExportExpenseClaims", SubItems: [] }] }] }, { Code: "SystemAdministration", SortOrder: 32512, Name: "System Administration", Description: "System Administration", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "", Controller: "", Template: "", RouteTypeId: null, RouteString: "/SystemAdministration", SubItems: [{ Code: "SystemAdministration.SystemAdministration", SortOrder: 32528, Name: "System Administration", Description: "System Administration", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "SystemAdministration", Controller: "", Template: "", RouteTypeId: null, RouteString: "/SystemAdministration/SystemAdministration", SubItems: [{ Code: "SystemAdministration.SystemAdministration.SystemAdministrationLandingPage", SortOrder: 32529, Name: "System Administration Landing Page", Description: "System Administration Landing Page", IconUrl: "", FunctionalOperationCode: "SystemAdministrationLandingPage", ParentItemCode: "SystemAdministration.SystemAdministration", Controller: "", Template: "", RouteTypeId: null, RouteString: "/SystemAdministration/SystemAdministrationLandingPage", SubItems: [] }] }, { Code: "SystemAdministration.Profile", SortOrder: 32544, Name: "Profile", Description: "Profile", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "SystemAdministration", Controller: "", Template: "", RouteTypeId: null, RouteString: "/SystemAdministration/Profile", SubItems: [{ Code: "SystemAdministration.Profile.EditProfile", SortOrder: 32545, Name: "Edit Profile", Description: "Edit Profile", IconUrl: "", FunctionalOperationCode: "EditProfile", ParentItemCode: "SystemAdministration.Profile", Controller: "", Template: "", RouteTypeId: null, RouteString: "/Profile/EditProfile", SubItems: [] }, { Code: "SystemAdministration.Profile.MergeAccounts", SortOrder: 32547, Name: "Merge Accounts", Description: "Merge Accounts", IconUrl: "", FunctionalOperationCode: "MergeAccounts", ParentItemCode: "SystemAdministration.Profile", Controller: "", Template: "", RouteTypeId: null, RouteString: "/Profile/MergeAccounts", SubItems: [] }] }, { Code: "SystemAdministration.Reports", SortOrder: 32592, Name: "Reports", Description: "Reports", IconUrl: "", FunctionalOperationCode: "", ParentItemCode: "SystemAdministration", Controller: "", Template: "", RouteTypeId: null, RouteString: "/SystemAdministration/Reports", SubItems: [{ Code: "SystemAdministration.Reports.ReportsDetail", SortOrder: 32593, Name: "Reports Detail", Description: "Reports Detail", IconUrl: "", FunctionalOperationCode: "ReportsDetail", ParentItemCode: "SystemAdministration.Reports", Controller: "", Template: "", RouteTypeId: null, RouteString: "/Reports/ReportsDetail", SubItems: [] }] }] }]);

//            controller = $controller;

            
            

//        }));

//        it('should call getContext', function () {
//            spyOn(userService, "getContext");
            
//            ctrl = controller("RootController", { $scope: scope, common: common, UserApiService: userService });
            
//            expect(userService.getContext).toHaveBeenCalled();
//        });

//        it('should load the first/only workspace', function () {
//            spyOn(userService, "setActiveWorkspace");
//            ctrl = controller("RootController", { $scope: scope, common: common, UserApiService: userService });
//            $httpBackend.flush();
//            // todo  Figure out why we are not picking up if setActiveWorkspace is getting called. When stepping through the code - it is.
//            //expect(userService.setActiveWorkspace).toHaveBeenCalledWith("Worker");
//        });
//    });
   
   
//});
