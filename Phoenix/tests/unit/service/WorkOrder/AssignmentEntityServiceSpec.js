//describe("the assignment entity service", function () {

//    beforeEach(module('services'));

//    var workOrderService;
//    beforeEach(function () {
//        this.addMatchers({
//            toEqualData: function (expected) {
//                return angular.equals(this.actual, expected);
//            }
//        });

//        this.addMatchers(
//            {
//                toNotContainErrors: function () {
//                    return (this.actual == []._ || this.actual.length == 0);

//                },
//                toContainError: function (errorMessage, errorCode) {
//                    if (this.actual == []._ || this.actual.length == 0) {
//                        return false;
//                    } else {
//                        // if the error message is undefined, just return the fact that we have an error
//                        if (errorMessage == []._) {
//                            return true;
//                        } else {
//                            // if there is an error message defined, check for that exact error.
//                            return _.indexOf(this.actual, errorMessage) >= 0;
//                        }
//                    }
//                }
//            });




//        //inject your service for testing.
//        inject(function (AssignmentValidationService) {
//            workOrderService = AssignmentValidationService;
//        });
//    });

//    it("should expect the work order service to be defined", function () {
//        expect(workOrderService).toBeDefined();
//    });

//    it('should contain a validation error for Start Date if start date is not provided', function () {
//        var entity = {
//            BrokenRules: {},
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.StartDate).toContainError('Start Date must be entered');

//    });

//    it('should contain a validation error for End Date if end date is not provided', function () {
//        var entity = {
//            BrokenRules: {},
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.EndDate).toContainError('End Date must be entered');

//    });

//    it('should not contain a validation error for Start date and End Date if they are defined, and  End Date > Start Date', function () {
//        var entity = {
//            BrokenRules: {},
//            StartDate: new Date('01/01/2012'),
//            EndDate: new Date('01/01/2090')
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.EndDate).toNotContainErrors();

//    });

//    it('should contain a validation error for Start date and End Date if they are defined, and End Date < Start Date', function () {
//        var entity = {
//            BrokenRules: {},
//            StartDate: new Date('01/01/2013'),
//            EndDate: new Date('01/01/2012')
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.EndDate).toContainError('The end date must be today\'s date or later');

//    });

//    it('should contain a validation error for Internal Organization if undefined or zero', function () {
//        var entity = {
//            BrokenRules: {},
//            StartDate: new Date('01/01/2013'),
//            EndDate: new Date('01/01/2012')
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.OrganizationId).toContainError('Internal Company must be selected');
//    });

//    it('should not contain a validation error for Internal Organization if defined and not zero', function () {
//        var entity = {
//            BrokenRules: {},
//            OrganizationId: 1
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.OrganizationId).toNotContainErrors();
//    });

//    it('should not contain a validation error fro Internal Organization if defined and not zero', function () {
//        var entity = {
//            BrokenRules: {},
//            OrganizationId: 1
//        };
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.OrganizationId).toNotContainErrors();
//    });

//    it('should contain validation error for Line Of Business if not selected', function () {

//        var entity = {
//            BrokenRules: {},
//            LineOfBusinessId: 0
//        };

//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.LineOfBusinessId).toContainError('Line of business must be selected');
//        entity.LineOfBusinessId = []._;
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.LineOfBusinessId).toContainError('Line of business must be selected');
//        entity.LineOfBusinessId = null;
//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.LineOfBusinessId).toContainError('Line of business must be selected');

//    });


//    it('should not contain validation  for Line Of Business if selected', function () {
//        var entity = {
//            BrokenRules: {},
//            LineOfBusinessId: 1
//        };

//        workOrderService.validateCore(entity);
//        expect(entity.BrokenRules.LineOfBusinessId).toNotContainErrors();

//    });

//    describe('the validateCore functionality', function () {
//        it('should contain a collection of broken rules if no details have been set', function () {
//            var entity = {
//                BrokenRules: {},
//            };

//            workOrderService.validateCore(entity);
//            expect(entity.BrokenRules.StartDate).toContainError('Start Date must be entered');
//            expect(entity.BrokenRules.EndDate).toContainError('End Date must be entered');
//            expect(entity.BrokenRules.OrganizationId).toContainError('Internal Company must be selected');
//            expect(entity.BrokenRules.LineOfBusinessId).toContainError('Line of business must be selected');
//            expect(entity.BrokenRules.WorksiteId).toContainError('Physical Work Location must be selected');
//            expect(entity.BrokenRules.PositionTitleId).toContainError('Position title must be selected');

//            // handle date errors


//        });

//        it('should handle date errors if start date and end date have been provided', function () {
//            var entity = {
//                BrokenRules: {},
//                StartDate: new Date(2011, 1, 1),
//                EndDate: new Date(2011, 1, 1)
//            };

//            workOrderService.validateCore(entity);
//            expect(entity.BrokenRules.EndDate).toContainError('The end date must be today\'s date or later');

//            entity = { BrokenRules: {}, StartDate: new Date(2011, 1, 2), EndDate: new Date(2011, 1, 1) };
//            workOrderService.validateCore(entity);
//            expect(entity.BrokenRules.DatesCompare).toContainError('The end date must be greater than the start date');

//        });



//    });

//});
