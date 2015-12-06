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
			eventNames: eventNames,
			changeEvent: changeEvent,
			tags: tags
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
		function changeEvent () {
			return $resource('/api/0/events', {
				id: '@id',
				name: '@name',
				fontTextColor: '@fontTextColor',
				fontBgColor: '@fontBgColor',
				tags: '@tags'
			});
		}
		function tags () {
			return $resource('/api/0/tags', {
				n: '@n',
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
		// Declare variables
		$scope.isEventSelected = false;
		
		//
		$scope.eventSelected = function (id) {
			$scope.isEventSelected = false;
			$scope.eventId = '';
			for (var i in $scope.events) {
				var ref = $scope.events[i];
				if (ref.selected) {
					if (ref.event.sid === id) {
						// flag for editing
						$scope.isEventSelected = true;
						// set variables
						$scope.eventId = ref.event.sid;
						$scope.eventName = ref.event.name;
						$('#textcolor').minicolors('value', ref.event.fontTextColor);
						$('#bgcolor').minicolors('value', ref.event.fontBgColor);
						// reset variable
						$('#tags').tagsinput('removeAll');
						// set event tags
						for (var j in ref.event.tags) {
							$('#tags').tagsinput('add', ref.event.tags[j].name, {preventPost: true});
						}
					} else {
						ref.selected = false;
					}
				}
			}
		};
		
		// POST changed event
		$scope.submitEvent = function () {
			editService.changeEvent().save({
				id: $scope.eventId,
				name: $scope.eventName,
				fontTextColor: $('#textcolor').minicolors('value'),
				fontBgColor: $('#bgcolor').minicolors('value'),
				tags: $('#tags').tagsinput('items')
			}, function (res) {
				$scope.alertStyle = 'alert-success';
				$scope.alertMessage = 'Successfully store new event!';
				$('#success-alert').fadeTo(2000, 500).slideUp(500, function () {
					$('#success-alert').alert('close');
				});
				// reset flag
				$scope.isEventSelected = false;
				// re fetch events
				$scope.getEvents();
			}, function (ignore) {
				$scope.alertStyle = 'alert-danger';
				$scope.alertMessage = 'Something when wrong submitting new event!';
			});
		};
		// GET tags
		$scope.getTags = function (value) {
			var a = value.split(',');
			editService.tags().query({n: a[a.length - 1]}, function (res) {
				return res;
			});
		}
		
		// GET events
		$scope.getEvents = function () {
			editService.eventNames().query({}, function (res) {
				$scope.events = res.events;
				for (var i in $scope.events) {
					var ref = $scope.events[i];
					ref.duration = moment(ref.duration).format('HH:mm');
				}
				// change the color palette after n-amount of time (can't do it in the same frame)
				$timeout(function () {
					$('input.minicolors').minicolors({theme: 'bootstrap'});
				}, 1);
			});
		};
		
		// setup tag input
		$('#tags').tagsinput();
		
		// Immediately call function
		$scope.getEvents();
	}
})();
