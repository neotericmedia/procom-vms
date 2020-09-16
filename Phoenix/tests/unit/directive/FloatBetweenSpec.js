describe("the float between directive", function () {

    beforeEach(module('directives'));

    var elm, scope, form;

    beforeEach(inject(function($rootScope, $compile) {
        elm = angular.element('<div data-ng-form="form"><input data-ng-model="data.someValue" name="someValue" float-between-input="" from="0.01" to="24" decimalplaces="2"/></div>');
        scope = $rootScope;
        scope.data = { someValue: 0.01 };
        $compile(elm)(scope);
        scope.$digest();
        form = scope.form;
    }));

    it('should expect someValue to be valid', function() {
        expect(form.someValue.$valid).toBe(true);
    });
    
    it('should expect 1.00001 to be formatted as 1.00', function () {
        form.someValue.$setViewValue('1.00001');
        scope.$digest();
        expect(form.someValue.$viewValue).toBe('1.00');
        expect(form.someValue.$modelValue).toBe('1.00');
       
    });
    
    it('should expect 1.25 to be formatted as 1.25', function () {
        form.someValue.$setViewValue('1.25');
        scope.$digest();
        expect(form.someValue.$viewValue).toBe('1.25');
        expect(form.someValue.$modelValue).toBe('1.25');

    });
    
    //it('should expect the value to be rounded to, 1.256 should become 1.26', function () {
    //    form.someValue.$setViewValue('1.256');
    //    scope.$digest();
    //    expect(form.someValue.$viewValue).toBe('1.26');
    //    expect(form.someValue.$modelValue).toBe('1.26');

    //});
    

});


