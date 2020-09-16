
//describe("Localization Service Functionality", function () {
//    beforeEach(module('services'));

//    beforeEach(function () {
//        this.addMatchers({
//            toEqualData: function (expected) {
//                return angular.equals(this.actual, expected);
//            }
//        });
//    });

//    var loc, log;
    
//    beforeEach(inject(function (LocalizationService, PhoenixLogService) {
//        loc = LocalizationService;
//        log = PhoenixLogService;
//        window.resource_injector_section_one = { Data: [{ Key: "KeyOne", Value: "One" }, { Key: "KeyTwo", Value: "Two" }] };
//    }));

 
    
//    describe("Load Section functionality", function () {
       
//        it("should return null if resource_injector_{sectionId} is not found", function () {

//            var result = loc.loadSection("section_two");
//            expect(result).toEqual(null);

//        });

//        it("should call $log.error if a section could not be found/loaded", function () {
//            spyOn(log, "error");
//            var result = loc.loadSection("section_two");
//            expect(log.error).toHaveBeenCalled();
//        });

//        it("should return an object  if resource_injector_{sectionId} is found", function() {
//            var result = loc.loadSection("section_one");
//            expect(result).toNotBe(null);
//        });
        
//        it("should return a section with a sectionId equal to section_one", function () {
//            var result = loc.loadSection("section_one");
//            expect(result.sectionId).toEqual("section_one");
            
//        });
        
//        it("should return a section with two keys", function () {
//            var result = loc.loadSection("section_one");
//            expect(result.keys.length).toEqual(2);

//        });

        
//    });

//    describe("[US1] As a site administrator, I want to be able to have localizations available on screens, such that I can service customers in multipul languages", function () {

//        it("[US1AC1] If a localization section and key is found, it should return the localized value", function () {
//            var result = loc.loadSection("section_one");
//            var keyValue = loc.getString("section_one", "KeyOne");
//            expect(keyValue).toEqual("One");
//        });
        
//        it("[US1AC2] If a localization section and/or key is not found, it should return the key as the localized value so something is still displayed", function () {
//            var result = loc.loadSection("section_one");
//            var keyValue = loc.getString("section_one", "KeyThree");
//            expect(keyValue).toEqual("KeyThree");
//        });
        
//        it("[US1AC3] If a localization section and/or key is not found, it should raise a log/warning event so I can review the logs and see where localization data is missing", function () {
//            spyOn(log, "error");
//            var keyValue = loc.getString("section_one", "KeyThree");
//            expect(log.error).toHaveBeenCalled();
//        });
//    });


//});