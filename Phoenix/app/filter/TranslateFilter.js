(function (filters) {
	filters.filter('phxTranslate', ['phxLocalizationService', function (phxLocalizationService) {

		function filter (){

			return phxLocalizationService.translate.apply(phxLocalizationService,arguments);
		
		};

		filter.$stateful = true;
	
		return filter;

	}]);
})(Phoenix.Filters);