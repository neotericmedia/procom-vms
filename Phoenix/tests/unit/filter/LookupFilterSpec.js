
describe("The lookup filter", function () {
    beforeEach(module('filters'));

    var lookup;
    beforeEach(function () {
        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });
    });

    beforeEach(inject(function($filter) {
        lookup = $filter('lookup');
    }));
    
    it("should return the value in an array proiveded the id.", function() {
        var sourceArray = [{ id: 1, text: 'Test 1' }, { id: 2, text: 'Test 2' }];
        var selectedItem = 1;
        var result = lookup(selectedItem, sourceArray);
        expect(result).toEqual('Test 1');
    });    

    it("should allow the user to define the id/value properties.", function () {
        var sourceArray = [{ Key: 1, Value: 'Test 1' }, { Key: 2, Value: 'Test 2' }];
        var selectedItem = 1;
        var result = lookup(selectedItem, sourceArray, 'Key', 'Value');
        expect(result).toEqual('Test 1');
    });
    
    it("should return input value if not found in collection.", function () {
        var sourceArray = [{ Key: 1, Value: 'Test 1' }, { Key: 2, Value: 'Test 2' }];
        var selectedItem = 3;
        var result = lookup(selectedItem, sourceArray, 'Key', 'Value');
        expect(result).toEqual(3);
    });

    // write test case for 
    // - result not found, 
    // - user defines an id/value property that is not in the array
    // - user passes in something that is not an array
    // - more than 1 result is found for a given key
    // - user passes in an id key, but no description key
    // - user passes in something that is not a number / boolean / string 
    // - the source array is a promise that needs to be resolved / isn't yet resolved. 

});