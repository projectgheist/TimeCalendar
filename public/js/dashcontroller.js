(function() {
	'use strict';

	angular
        .module('webapp')
        .controller('dashController', dashController)
        .service('dashService', dashService);
	
	dashService.$inject = [
		'$resource'
	];

	function dashService($resource) {
		return {
		};
	};

    dashController.$inject = [
		'$rootScope', 
		'$scope', 
		'$http', 
		'$location',
		'$route',
		'$routeParams', 
		'$anchorScroll', 
		'$sce', 
		'$timeout', 
		'$window', 
		'dashService'
	];

	function dashController($rootScope, $scope, $http, $location, $route, $routeParams, $anchorScroll, $sce, $timeout, $window, dashService) {
		// !Prevents the page from scrolling to the id
		$('.nav-tabs a').click(function (e) {
			e.preventDefault()
			$(this).tab('show');
		});
	
		$scope.startdate = new Date();
		$scope.starttime = new Date();
		//These variables MUST be set as a minimum for the calendar to work
		$scope.calendarview = 'day';
		$scope.calendarday = new Date();
		$scope.autoOpen = true;
		$scope.events = [
			{
				title: 'An event',
				type: 'warning',
				startsAt: moment().startOf('week').subtract(2, 'days').add(8, 'hours').toDate(),
				endsAt: moment().startOf('week').add(1, 'week').add(9, 'hours').toDate(),
				draggable: true,
				resizable: true
			}, {
				title: '<i class="glyphicon glyphicon-asterisk"></i> <span class="text-primary">Another event</span>, with a <i>html</i> title',
				type: 'info',
				startsAt: moment().subtract(1, 'day').toDate(),
				endsAt: moment().add(5, 'days').toDate(),
				draggable: true,
				resizable: true
			}, {
				title: 'This is a really long event title that occurs on every year',
				type: 'important',
				startsAt: moment().startOf('day').add(7, 'hours').toDate(),
				endsAt: moment().startOf('day').add(19, 'hours').toDate(),
				recursOn: 'year',
				draggable: true,
				resizable: true
			}
		];
		$scope.$broadcast('calendar.refreshView');
	}
})();