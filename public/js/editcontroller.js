(function () {
	'use strict';

	angular
		.module('webapp')
		.controller('editController', editController)
		.service('editService', editService);

	editService.$inject = [
		'$resource'
	];

	/**  */
	function editService ($resource) {
		return {
			eventNames: eventNames
		};
		function eventNames () {
			return $resource('/api/0/events/list', {
				name: '@name'
			}, {
				query: {
					method: 'GET',
					isArray: false
				}
			});
		}
	}

	/**  */
	editController.$inject = [
		'$rootScope',
		'$scope',
		'$location',
		'$route',
		'$routeParams',
		'$timeout',
		'editService'
	];

	/**  */
	function editController ($rootScope, $scope, $location, $route, $routeParams, $timeout, editService) {
		// Immediately call function
		editService.eventNames().query({}, function (res) {
			$scope.events = res.events;
			$timeout(function () {
				$('input.minicolors').minicolors({theme: 'bootstrap'});
			}, 1);
		});
	}
})();
