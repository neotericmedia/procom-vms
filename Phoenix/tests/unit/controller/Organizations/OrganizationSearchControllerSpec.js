///// <reference path="../../../../../libs/jquery/jquery-1.9.0.js" />
///// <reference path="../../../../../libs/jquery/jquery.cookie.js" />
///// <reference path="../../../../../libs/jasmine-1.3.1/jasmine.js" />
///// <reference path="../../../../../libs/angular/angular.js" />
///// <reference path="../../../../../libs/angular/angular-resource.js" />
///// <reference path="../../../../../libs/angular/angular-sanitize.js" />
///// <reference path="../../../../../libs/angular/angular-mocks.js" />
///// <reference path="../../../../../libs/angular-ui/angular-ui.js" />
///// <reference path="../../../../../libs/angular-ui-bootstrap/ui-bootstrap-0.3.0.js" />
///// <reference path="../../../../../libs/angular-ui-bootstrap/ui-bootstrap-tpls-0.3.0.js" />
///// <reference path="../../../../../libs/ng-grid/ng-grid-1.9.0.js" />
///// <reference path="../../../../../libs/angular/angular-cookies.js" />
///// <reference path="../../../../../libs/underscore/underscore.js" />
///// <reference path="../../../../../js/app/app.js" />
///// <reference path="../../../../../js/app/controller/" />
///// <reference path="../../../../../js/app/filter/" />
///// <reference path="../../../../../js/app/directive/" />
///// <reference path="../../../../../js/app/service/" />
///// <reference path="../../../../../js/appTests/data/orgs.js" />



//describe("Organization Search Controller Functionality", function () {

//    beforeEach(module('Phoenix'));
//    beforeEach(function () {
//        this.addMatchers({
//            toEqualData: function (expected) {
//                return angular.equals(this.actual, expected);
//            }
//        });
//    });

//    var scope, ctrl, $httpBackend, timeout;
//    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, OrganizationService, $filter, $timeout, $location, NavigationService) {
//        var orgs = angular.copy(Organizations);
        
//        timeout = $timeout;
//        $httpBackend = _$httpBackend_;
//        $httpBackend.expectGET("/api/OrganizationAPI/Get").respond(200, orgs);
//        scope = $rootScope.$new();
        
//        ctrl = $controller("OrganizationSearchController",
//            {
//                $scope: scope,
//                OrganizationService: OrganizationService,
//                $filter: $filter,
//                data: orgs,
//                $timeout: $timeout,
//                $location: $location,
//                NavigationService: NavigationService
                

//            });

//    }));
    
//    it("should load all of the organizations when the screen loads", function () {
//        expect(scope.model.data.length).toEqual(504);
        
//    });
    
    
//});