(function (app) {
    'use strict';
    var controllerId = 'FeedbackDialogController';
    app.controller(controllerId, ["$scope", 'common', '$uibModalInstance', 'NoteApiService', '$location', 'phxLocalizationService', FeedbackDialogController]);
    function FeedbackDialogController($scope, common, $uibModalInstance, NoteApiService, $location, phxLocalizationService) {
        $scope.localization = {
            feedbackLabel: 'account.feedback.feedbackLabel',
            feedbackDescription: 'account.feedback.feedbackDescription',
            ideaLabel: 'account.feedback.ideaLabel',
            problemLabel: 'account.feedback.problemLabel',
            questionLabel: 'account.feedback.questionLabel',
            praiseLabel: 'account.feedback.praiseLabel',
            feedbackLengthMessage: 'account.feedback.feedbackLengthMessage',
            feedbackPlaceholder: 'account.feedback.feedbackPlaceholder',
            feedbackSuccessMessage: 'account.feedback.feedbackSuccessMessage',
            cancelButton: 'common.generic.cancel',
            submitButton: 'common.generic.Submit',
        };

        Object.keys($scope.localization).forEach(
            function (key, index) {
                $scope.localization[key] = phxLocalizationService.translate($scope.localization[key]);
            });

        $scope.types = [{ type: true }, { type: false }, { type: false }, { type: false }];

        $scope.cancelSend = function () {
            $uibModalInstance.close();
        };

        function getBrowserInfo() {
            var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return { name: 'IE ', version: (tem[1] || '') };
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR\/(\d+)/);
                if (tem !== null) { return { name: 'Opera', version: tem[1] }; }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) !== null) { M.splice(1, 1, tem[1]); }
            return {
                name: M[0],
                version: M[1]
            };
        }

        $scope.sendFeedback = function (feedback) {
            if ($.trim(feedback).length === 0)
                return;

            var type = $.trim($("#feedbackType .selected").text());
            feedback = $("#feedbackArea").val().replace(/\n/g, '<br/>');
            var url = $location.absUrl();
            var browser = getBrowserInfo();

            var sendFeedbackCommand = { Type: type, Feedback: feedback, Url: url, BrowserName: browser.name, BrowserVersion: browser.version };

            NoteApiService.sendFeedback(sendFeedbackCommand).then(
                function (response) {
                    $uibModalInstance.close();
                    common.logSuccess($scope.localization.feedbackSuccessMessage);
                }
            );
        };

        $scope.feedbackType = function (index) {
            $.each($scope.types, function (idx, feedback) {
                feedback.type = false;
            });
            $scope.types[index].type = true;
        };
        $scope.close = function () {
            $uibModalInstance.close();
        };
    }
}(Phoenix.App));
