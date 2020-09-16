(function (directives) {

    /// <reference  path="../app.js"/>
    /*global PheonixTrackDirectives:false */

    'use strict';

    /**
    @name directives.ptAntiForgery
    @description
    Allows for the use of the Razor HTML Helper -  @Html.AntiForgeryToken()
    Requires an input element on the screen to have a name of RequestVerificationToken.
    example:
    
    <form class="form-horizontal" pt-antiforgery="" ng-model="user" name="RegistrationForm" ng-submit="register(user);">
        @Html.AntiForgeryToken()
        <input type="hidden" ng-model="user.__RequestVerificationToken" value="" name="RequestVerificationToken"/>
    </form>
    */
    
    // TODO: Prevent templateCache from storing pages that use this directive. Or, have directive make a new call to generate
    // a new token each time the screen loads. 
    directives.directive('ptAntiforgery', function () {
        return {
            restrict: 'A',
            require: 'form',
            link: function(scope, elem, attrs, formController) {
                var key = $("[NAME=__RequestVerificationToken]");
                formController.RequestVerificationToken.$setViewValue(key.val());
            }
        };
    });
})(Phoenix.Directives);