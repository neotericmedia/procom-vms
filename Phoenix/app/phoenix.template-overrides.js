angular.module('phoenix.template-overrides', []).run(['$templateCache', '$interpolate', function ($templateCache, $interpolate) {
	var startSym = $interpolate.startSymbol();
	var endSym = $interpolate.endSymbol();

	//angular-dialog-service
	$templateCache.put('/dialogs/confirm.html',
		'<div class="confirm-dialog">' +
		'	<div class="modal-header dialog-header-confirm">' +
		'		<h4 class="modal-title">'+startSym+'header'+endSym+'</h4>' +
		'	</div>' +
		'	<div class="modal-body" ng-bind-html="msg"></div>' +
		'	<div class="modal-footer">' +
		'		<button type="button" class="btn btn-default" ng-click="no()">'+startSym+'"DIALOGS_NO" | translate'+endSym+'</button>' +
		'		<button type="button" class="btn btn-primary" ng-click="yes()">'+startSym+'"DIALOGS_YES" | translate'+endSym+'</button>' +
		'	</div>' +
		'</div>'
	);

	$templateCache.put('/dialogs/notify.html',
		'<div class="notify-dialog">' +
		'	<div class="modal-header dialog-header-notify">' +
		'		<h4 class="modal-title">'+startSym+'header'+endSym+'</h4>' +
		'	</div>' +
		'	<div class="modal-body" ng-bind-html="msg"></div>' +
		'	<div class="modal-footer">' +
		'		<button type="button" class="btn btn-primary" ng-click="close()">'+startSym+'"DIALOGS_OK" | translate'+endSym+'</button>' +
		'	</div>' +
		'</div>'
	);
}]);