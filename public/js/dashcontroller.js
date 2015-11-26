(function () {
	'use strict';

	angular
		.module('webapp')
		.controller('dashController', dashController)
		.service('dashService', dashService);

	dashService.$inject = [
		'$resource'
	];

	function dashService ($resource) {
		return {
			eventItems: eventItems,
			events: events
		};
		function eventItems () {
			return $resource('/api/0/events', {
				id: '@id',
				name: '@name',
				desc: '@desc',
				type: '@type',
				fontTextColor: '@fontTextColor',
				fontBgColor: '@fontBgColor',
				st: '@st', // start time
				td: '@td', // time duration
				et: '@et'
			}, {
				query: {
					method: 'GET',
					isArray: false
				}
			});
		}
		function events () {
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

	dashController.$inject = [
		'$rootScope',
		'$scope',
		'$http',
		'$location',
		'$route',
		'$routeParams',
		'$anchorScroll',
		'$sce',
		'$interval',
		'$timeout',
		'$window',
		'dashService'
	];

	function dashController ($rootScope, $scope, $http, $location, $route, $routeParams, $anchorScroll, $sce, $interval, $timeout, $window, dashService) {
		// !Prevents the page from scrolling to the id
		$('.nav-tabs a').click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});

		// declare events variable
		$scope.eventSources = [];
		
		// day or week calendar view
		$scope.isWeekView = ($location.$$path === '/overview' ? true : false);

		// config object for calendar
		$scope.uiConfig = {
			calendar: {
				height: 450,
				// Flag true when an allDay event is present
				allDaySlot: false,
				editable: true,
				// how far down the scroll pane is initially scrolled down
				scrollTime: moment().format('HH') + ':00:00',
				// initial view when the calendar loads
				defaultView: ($scope.isWeekView ? 'agendaWeek' : 'agendaDay'),
				header: {
					left: '', // 'month basicWeek basicDay agendaWeek agendaDay',
					center: 'title',
					right: '', // 'today prev,next'
				},
				buttonText: {
					today: 'Today',
					month: 'Month',
					week: 'Week',
					day: 'Day'
				},
				// Start of the working day (@todo: to be overridden when an earlier event op the day is detected)
				minTime: ($scope.isWeekView ? '00:00:00' : '08:00:00'),
				// End of the working day (@todo: to be overridden when a later event op the day is detected)
				maxTime: ($scope.isWeekView ? '23:59:59' : '19:00:00'),
				// How much time a row occupies
				slotDuration: ($scope.isWeekView ? '01:00:00' : '00:30:00'),
				// Intervals between labels on the left side
				slotLabelInterval: ($scope.isWeekView ? '03:00:00' : '01:00:00'),
				// Format of the label on the left side
				slotLabelFormat: 'h(:mm) a',
				/*
				// Hide buttons/titles
				header: false,
				*/
				columnFormat: {
					week: 'ddd' // Only show day of the week names
				},
				// When an event is selected
				eventClick: onEventClick,
				eventDrop: onEventModify,
				eventResize: onEventModify
			}
		};

		function onEventClick (event, jsEvent, view) {
			console.log('onEventClick');
			console.log(event);
		}

		function onEventModify (event, delta, revertFunc, jsEvent, ui, vie) {
			// Modify the event
			console.log(event);
		};

		// Set default colors
		$scope.textcolor = '#fff';
		$scope.bgcolor = '#009688';

		//
		$scope.updateStartDate = function () {
			$scope.startDate = new Date();
			$scope.startDateFormat = moment($scope.startDate).format('MMM DD, HH:mm');
		};

		// Do immediately
		$scope.updateStartDate();

		// !disable the add to startdate
		$scope.addstartdate = false;

		// Disable the stopdate by default, indicates a currently running event
		$scope.stopdate = 0;

		// disable the subtract from stopdate
		$scope.subtractstopdate = false;

		// These variables MUST be set as a minimum for the calendar to work
		$scope.calendarview = 'day';
		$scope.calendarday = new Date();
		$scope.autoOpen = true;

		// POST new event
		$scope.submitEventItem = function () {
			dashService.eventItems().save({
				name: $scope.eventName,
				desc: $scope.eventDesc,
				fontTextColor: $('#textcolor').minicolors('value'),
				fontBgColor: $('#bgcolor').minicolors('value'),
				st: $scope.startDate,
				td: 0
			}, function (res) {
				$scope.alertStyle = 'alert-success';
				$scope.alertMessage = 'Successfully store new event!';
				$('#success-alert').fadeTo(2000, 500).slideUp(500, function () {
					$('#success-alert').alert('close');
				});
				// re fetch events
				$scope.getEventItems();
			}, function (ignore) {
				$scope.alertStyle = 'alert-danger';
				$scope.alertMessage = 'Something when wrong submitting new event!';
			});
		};

		// Retrieve event types 
		$scope.onTypeAheadSelect = function (item, model, label) {
			$('#textcolor').minicolors('value', item.fontTextColor);
			$('#bgcolor').minicolors('value', item.fontBgColor);
		};

		// Post a stop all current running events
		$scope.stopAllEvents = function () {
			dashService.eventItems().save({'e': 'a'}, function (res) {
				
			});
		};

		// Stop a single event with an unique identifier
		$scope.stopEvent = function (eventItemId) {
			dashService.eventItems().save({'id': eventItemId}, function (res) {
				$scope.alertStyle = 'alert-success';
				$scope.alertMessage = 'Successfully store new event!';
				$('#success-alert').fadeTo(2000, 500).slideUp(500, function () {
					$('#success-alert').alert('close');
				});
				// re fetch events
				$scope.getEventItems();
			}, function (ignore) {
				$scope.alertStyle = 'alert-danger';
				$scope.alertMessage = 'Something when wrong submitting new event!';
			});
		};

		// Retrieve event types 
		$scope.getEvents = function (val) {
			return dashService.events().query({name: val}).$promise.then(function (res) {
				return res.events;
			});
		};

		//
		$scope.setNewEvent = function (val) {
			$scope.eventName = val.title;
			$('#textcolor').minicolors('value', val.textColor);
			$('#bgcolor').minicolors('value', val.color);
		};

		//
		$scope.setRunningEvents = function () {
			//
			$scope.updateStartDate();
			//
			if ($scope.eventSources.length) {
				var ref = $scope.eventSources[0];
				// loop all running events
				for (var i in ref) {
					if (typeof ref[i] === 'object') {
						// set end time to now (it's still running)
						ref[i].end = Date.now();
						// calculate new duration time
						ref[i].duration = moment(moment().diff(moment(ref[i].start))).format('HH:mm');
					}
				}
			}
		};

		// Do every 15 seconds
		$interval($scope.setRunningEvents, 1000 * 15);

		// Retrieve event types 
		$scope.getEventItems = function () {
			var params = {};
			if ($scope.isWeekView) {
				params.st = moment().startOf('week').toString();
			}
			dashService.eventItems().get(params, function (res) {
				// store the events to the calendar
				$scope.eventSources = res.array;
				//
				$scope.eventGroups = res.groups;
				// format duration of grouped events
				for (var i in $scope.eventGroups) {
					var ref = $scope.eventGroups[i];
					ref.duration = moment(ref.duration).format('HH:mm');
				}
				// has current running events?
				if ($scope.eventSources.length && $scope.eventSources[0].length) {
					// set new day start time
					var minDate = moment($scope.uiConfig.calendar.minTime, 'HH:mm');
					if (moment(minDate).diff(moment(), 'minutes') > 0) {
						var newMinTime = moment().subtract(1, 'hour').format('HH') + ':00:00';
						// !Special case: Midnight
						if (newMinTime === '23:00:00') {
							newMinTime = '00:00:00';
						}
						$scope.uiConfig.calendar.minTime = newMinTime;
					}
					// set new day end time
					var maxDate = moment($scope.uiConfig.calendar.maxTime, 'HH:mm');
					if (moment().diff(maxDate, 'minutes') > 0) {
						var newMaxTime = moment().add(1, 'hour').format('HH') + ':00:00';
						// !Special case: Midnight
						if (newMaxTime === '00:00:00') {
							newMaxTime = '23:59:59';
						}
						$scope.uiConfig.calendar.maxTime = newMaxTime;
					}
				}
				// Update events
				$scope.setRunningEvents();

				// format duration of todays previous events
				if ($scope.eventSources.length) {
					var ref = $scope.eventSources[1];
					// loop all running events
					for (var i in ref) {
						if (typeof ref[i] === 'object') {
							// format duration time
							ref[i].duration = moment(ref[i].duration).format('HH:mm');
						}
					}
				}
			}, function (ignore) {});
		};

		//
		$scope.changeEvent = function () {
			dashService.eventItems().save({
				name: $scope.eventName,
				desc: $scope.eventDesc,
				fontTextColor: $('#textcolor').minicolors('value'),
				fontBgColor: $('#bgcolor').minicolors('value'),
			}, function (res) {
				$scope.alertStyle = 'alert-success';
				$scope.alertMessage = 'Successfully store new event!';
				$('#success-alert').fadeTo(2000, 500).slideUp(500, function () {
					$('#success-alert').alert('close');
				});
				// re fetch events
				$scope.getEventItems();
			}, function (ignore) {
				$scope.alertStyle = 'alert-danger';
				$scope.alertMessage = 'Something when wrong submitting new event!';
			});
		};
		
		// Immediately call function
		$scope.getEventItems();
	}
})();
