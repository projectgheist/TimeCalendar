(function () {
	'use strict';

	/**
	 */
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
			events: events,
			profile: profile
		};
		function eventItems () {
			return $resource('/api/0/events', {
				e: '@e', // special tasks
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
		function profile () {
			return $resource('/api/0/profiles', {
				id: '@id',
				st: '@st', // start time
				et: '@et'  // end time
			}, {
				query: {
					method: 'GET',
					isArray: false
				}
			});
		}
	}

	/** Modules to use with the controller
	 */
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
		'dashService',
		'uiCalendarConfig'
	];

	/** The controller class to use
	 */
	function dashController ($rootScope, $scope, $http, $location, $route, $routeParams, $anchorScroll, $sce, $interval, $timeout, $window, dashService, uiCalendarConfig) {
		// !Prevents the page from scrolling to the id
		$('.nav-tabs a').click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});

		// declare events variable
		const EVENTS_COMPLETED = 0;
		const EVENTS_RUNNING = 1;
		$scope.eventSources = [[], []];
		$scope.eventGroups = [];
		$scope.alerts = [];
		$scope.isAlertEnabled = false;
		$scope.totalTime = 0;
		$scope.eventId = '';
		$scope.user = false;
	
		// declare chart variable
		$scope.chartistPie = {
			data: {
				series: []
			},
			events: {
				'created': function (obj) {
					changeChartColors();
				}
			}
		};
		
		// declare alphabet for sorting
		var alphabet = 'abcdefghijklmnopqrstvwxyz';
		
		// external profile
		$scope.isProfilePage = /\/profile\//gi.test($location.$$path);
		$scope.profileId = $scope.isProfilePage ? /\/profile\/(.*[^\/])?/gi.exec($location.$$path)[1] : '';

		// day or week calendar view
		$scope.isWeekView = ($location.$$path === '/overview' ? true : false) || $scope.isProfilePage;
		
		// config object for calendar
		$scope.uiConfig = {
			calendar: {
				// Height of the calendar canvas
				height: 450,
				// Flag true when an allDay event is present
				allDaySlot: false,
				// Flag true to make changes to the calendar
				editable: !$scope.isProfilePage,
				// how far down the scroll pane is initially scrolled down
				scrollTime: moment().format('HH') + ':00:00',
				// initial view when the calendar loads
				defaultView: ($scope.isWeekView ? 'agendaWeek' : 'agendaDay'),
				// Flag false to hide buttons/titles
				header: {
					left: 'prev', // 'month basicWeek basicDay agendaWeek agendaDay',
					center: 'title',
					right: 'next', // 'today prev,next'
				},
				// Comment if want to show column headings
				dayNames: ['', '', '', '', '', '', ''],
				// Set custom button names
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
				slotDuration: ($scope.isWeekView ? '00:30:00' : '00:10:00'),
				// Intervals between labels on the left side
				slotLabelInterval: '01:00:00',
				// Format of the label on the left side
				slotLabelFormat: 'h(:mm) a',
				// Display a marker indicating the current time
				nowIndicator: !$scope.isWeekView,
				columnFormat: {
					week: 'ddd' // Only show day of the week names
				},
				// When a day is clicked
				dayClick: onDayClick,
				// When an event is selected
				eventClick: onEventClick,
				// When an event is dropped after being dragged
				eventDrop: onEventModify,
				// When an event is resized
				eventResize: onEventModify
			}
		};
		
		// Declare elements that require a loading bar
		var loadingbarIds = [
			'#loadingChart',
			'#loadingCalendar',
			'#loadingDashboard',
			'#loadingProfile'
		];
		
		// Newly created loading bars for the above elements
		var loadingbars = [];
		
		// construct the loading bars
		for (var q in loadingbarIds) {
			// make sure that the id exists
			if ($(loadingbarIds[q]).length) {
				var newBar = new Mprogress({
					template: 3, 
					parent: loadingbarIds[q],
					start: true  // start it now
				});
				// add to array
				loadingbars.push(newBar);
			}
		}

		// set default variables for date picker
		$scope.datepicker = {
			opened: false
		};
		
		$scope.openDatepicker = function () {
			$scope.datepicker.opened = true;
		};

		/**
		 * Only gets called when event is clicked
		 */
		function onDayClick (date, jsEvent, view) {
			// in overview page?
			if ($scope.isWeekView) {
				// display edit event modal
				$('#ModalDialog').modal({
					show: true
				});
			} else {
				// check if valid event
				if ($scope.eventName) {
					// set to retrieved date from click event
					$scope.startDate = date;
					// make the event last 1 hour
					$scope.eventDuration = moment.duration(1, 'hours').valueOf();
					// submit the event
					$scope.submitEventItem();
					// reset the event name
					$scope.eventName = '';
				}
			}
		};
		
		/**
		 * Only gets called when event is clicked
		 */
		function onEventClick (event, jsEvent, view) {
			// set modal header text
			$('#modalTitle').text(event.title);
			// store event uid
			$scope.eventId = event.id;
			// store event name
			$scope.eventName = event.title;
			// set date
			$scope.newDate = moment(event.start).startOf('day').toDate();
			// how to format date
			$scope.newDateFormat = 'dd MMMM yyyy';
			// set start time
			$scope.newStartTime = event.start;
			// set end time
			$scope.newEndTime = event.end;
			// display edit event modal
			$('#ModalDialog').modal({
				show: true
			});
		}

		// Executed when an event is modified, dragged
		function onEventModify (event, delta, revertFunc, jsEvent, ui, vie) {
			// Modify the event
			dashService.eventItems().save({
				id: event.id,
				st: moment(event.start).valueOf(),
				et: moment(event.end).valueOf()
			}, function (res) {
				// show alert
				$scope.showAlert('alert-success', 'Succesfully modified event!');
				// re fetch events
				$scope.getEventItems();
			}, function (ignore) {
				// show alert
				$scope.showAlert('alert-danger', 'Failed to modify event!');
			});
		};

		// Set default colors
		$scope.eventDuration = false;
		$scope.textcolor = '#fff';
		$scope.materialColors = ['#F44336', '#009688', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#E91E63'];
		$scope.bgcolor = false;
		$scope.noEventSelected = true;

		// Set default start time and format for string
		$scope.updateStartDate = function () {
			$scope.startDate = moment();
			$scope.startDateFormat = $scope.startDate.format('MMM DD, HH:mm');
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
			// backgroundcolor defined?
			if (!$scope.bgcolor) {
				// change to a different color
				$scope.bgcolor = $scope.materialColors[Math.floor(Math.random() * $scope.materialColors.length)];
			}
			// save to database
			dashService.eventItems().save({
				name: $scope.eventName,
				desc: $scope.eventDesc,
				fontTextColor: $('#textcolor').minicolors('value'),
				fontBgColor: $('#bgcolor').minicolors('value'),
				// start time
				st: moment($scope.startDate).valueOf(),
				// total time
				td: $scope.eventDuration || 0
			}, function (res) {
				// show alert
				$scope.showAlert('alert-success', ['Successfully started new <b>', $scope.eventName,'</b> event!'].join(''));
				// Flag variable
				$scope.noEventSelected = false;
				// reset event duration
				$scope.eventDuration = false;
				// reset event name
				$scope.eventName = '';
				// reset event text color
				$scope.textcolor = false;
				// reset event background color
				$scope.bgcolor = false;
				// re-fetch events
				$scope.getEventItems();
			}, function (ignore) {
				// show alert
				$scope.showAlert('alert-danger', ['Something when wrong submitting <b>', $scope.eventName,'</b> event!'].join(''));
				// Flag variable
				$scope.noEventSelected = false;
				// reset event duration
				$scope.eventDuration = false;
			});
		};

		// POST modify event
		$scope.submitModify = function () {
			
		};
		
		// Retrieve event types 
		$scope.onTypeAheadSelect = function (item, model, label) {
			// set font color
			$scope.textcolor = item.fontTextColor;
			$('#textcolor').minicolors('value', item.fontTextColor);
			// set background color
			$scope.bgcolor = item.fontBgColor;
			$('#bgcolor').minicolors('value', item.fontBgColor);
			// Flag variable
			$scope.noEventSelected = false;
		};

		// Post a stop all current running events
		$scope.stopAllEvents = function () {
			dashService.eventItems().save({
				'e': 'a'
			}, function (res) {
				// show alert
				$scope.showAlert('alert-success', 'Successfully ended all events!');
				// re fetch events
				$scope.getEventItems();
			}, function (ignore) {
				// show alert
				$scope.showAlert('alert-danger', 'Failed to end all events!');
			});
		};
		
		// Delete event from database
		$scope.deleteEvent = function () {
			if (!$scope.eventId) {
				// show alert
				$scope.showAlert('alert-warning', ['Delete event: invalid parameters defined.'].join(''));
			} else {
				// hide edit event modal
				$('#ModalDialog').modal({
					show: false
				});
				dashService.eventItems().save({
					'e': 'd',
					'id': $scope.eventId
				}, function (res) {
					// re-fetch events
					$scope.getEventItems();
				}, function (ignore) {
					// show alert
					$scope.showAlert('alert-danger', 'Failed to delete event!');
				});
			}
		};

		// Stop a single event with an unique identifier
		$scope.stopEvent = function (eventItem) {
			dashService.eventItems().save({
				'id': eventItem.id
			}, function (res) {
				// show alert
				$scope.showAlert('alert-success', ['Successfully stopped <b>', eventItem.title,'</b> event!'].join(''));
				// re-fetch events
				$scope.getEventItems();
			}, function (ignore) {
				// show alert
				$scope.showAlert('alert-danger', 'Failed to end event!');
			});
		};

		// Retrieve event types 
		$scope.getEvents = function (val) {
			// reset selected event
			$scope.noEventSelected = true;
			// async query
			return dashService.events().query({name: val}).$promise
				.then(function (res) {
					// return data
					return res.events;
				});
		};

		// Create a new event
		$scope.setNewEvent = function (val) {
			// store event name
			$scope.eventName = val.title;
			// set font color
			$('#textcolor').minicolors('value', val.textColor);
			// set background color
			$('#bgcolor').minicolors('value', val.color);
		};
		
		function updateRunningEvents (events) {
			// loop all running events
			for (var i in events) {
				// item in array is object?
				if (typeof events[i] === 'object') {
					// set end time to now (it's still running)
					events[i].end = moment();
					// calculate new duration time
					events[i].duration = moment(moment().diff(moment(events[i].start))).format('HH:mm');
				}
			}
		}

		// Update the running events durations
		$scope.setRunningEvents = function () {
			// Update start time
			$scope.updateStartDate();
			// get calendar
			var calendar = uiCalendarConfig.calendars.myCalendar;
			// events present AND running events
			if (calendar && $scope.eventSources.length && $scope.eventSources[EVENTS_RUNNING].length) {
				// reference to running events array
				var ref = $scope.eventSources[EVENTS_RUNNING];
				// clear the previous events in the calendar
				calendar.fullCalendar('removeEventSource', ref);
				// update formatting
				updateRunningEvents(ref);
				// re-add the updated events
				calendar.fullCalendar('addEventSource', ref);
			}
		};

		// Do every 15 seconds
		$interval($scope.setRunningEvents, 1000 * 15);
		
		// Return addition of 2 variables
		var sum = function(a, b) { return a + b };

		// Format time duration to string
		function formatDuration (str) {
			// retrieve day count from total time
			var days = Math.floor(moment.duration(str).asDays());
			// format string
			return (days > 0 ? [days, 'd '].join('') : '') + moment(str).format('HH:mm');
		};
		
		/** Has running events? */
		$scope.hasRunningEvents = function () {
			return $scope.eventSources && $scope.eventSources.length && $scope.eventSources[EVENTS_RUNNING].length;
		};

		/** Has completed events? */
		$scope.hasCompletedEvents = function () {
			return $scope.eventSources && $scope.eventSources.length && $scope.eventSources[EVENTS_COMPLETED].length;
		};
		
		// Retrieve event types 
		$scope.getEventItems = function () {
			var params = {};
			// Decide start date dependant on calendar view
			if ($scope.isWeekView) {
				var momentTime = moment().startOf('week');
				params.st = momentTime.valueOf();
				params.et = momentTime.endOf('week').valueOf();
			} else {
				params.st = moment().startOf('day').valueOf();
				params.et = moment().endOf('day').valueOf();
			}

			// start loading bars
			for (var b in loadingbars) {
				loadingbars[b].start();
			}

			// async query database
			dashService.eventItems().get(params, function (res) {
				// events found?
				if (!res.array[0].length && !res.array[1].length) {
					// show alert
					$scope.showAlert('alert-warning', 'No events found!');
				}
				// store event group data
				$scope.eventGroups = res.groups;
				// store total time
				$scope.totalTime = formatDuration(res.time);
				// format duration of grouped events
				for (var i in $scope.eventGroups) {
					var ref = $scope.eventGroups[i];
					// store duration in minutes for sorting use in the chart
					ref.durationInMin = parseInt(moment.duration(ref.duration).asMinutes(), 0);
					// format duration to string
					ref.duration = formatDuration(ref.duration);
				}
				// declare chart data when in overview mode
				if ($scope.isWeekView) {
					$scope.chartistPie = {
						data: {
							// pass event to interpolation function to calculate percentages
							labels: $scope.eventGroups.map(function (val) {
								return val;
							}),
							// extract event durations
							series: $scope.eventGroups.map(function (val) {
								return val.durationInMin;
							})
						},
						options: {
							labelInterpolationFnc: function (value) {
								return Math.round(value.durationInMin / $scope.chartistPie.data.series.reduce(sum) * 100) + '%';
							}
						},
						responsiveOptions: [ [
							'screen and (min-width: 640px)', {
								chartPadding: 30,
								labelOffset: 100,
								labelDirection: 'explode',
								labelInterpolationFnc: function(value) {
									return value.event.title;
								}
							} ], [
								'screen and (min-width: 1024px)', {
								labelOffset: 80,
								chartPadding: 20
							} ]
						],
						events: {
							'created': function (obj) {
								changeChartColors();
							}
						}
					};
				}
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
				// declare local variables
				var runningEvents = (res.array.length >= EVENTS_RUNNING + 1) ? res.array[EVENTS_RUNNING] : [];
				var completedEvents = (res.array.length >= EVENTS_COMPLETED + 1) ? res.array[EVENTS_COMPLETED] : [];
				// format duration of today's running events
				updateRunningEvents(runningEvents);
				// remove from eventSources AND add new events
				$scope.eventSources.splice(EVENTS_RUNNING, 1, runningEvents);
				// loop all of today's previously completed events format duration
				for (var i in completedEvents) {
					if (typeof completedEvents[i] === 'object') {
						// format duration time
						completedEvents[i].duration = moment(completedEvents[i].duration).format('HH:mm');
					}
				}
				// remove from eventSources AND add new events
				$scope.eventSources.splice(EVENTS_COMPLETED, 1, completedEvents);
				// end loading bars
				for (var b in loadingbars) {
					loadingbars[b].end();
				}
			}, function (ignore) {
				// show alert
				$scope.showAlert('alert-danger', 'Failed to retrieve events!');
				// end loading bars
				for (var b in loadingbars) {
					loadingbars[b].end();
				}
			});
		};
		
		/** Retrieve the profile of a user and their events */
		$scope.getProfile = function () {
			// start loading bars
			for (var b in loadingbars) {
				loadingbars[b].start();
			}
			// calculate time
			var momentTime = moment().startOf('week');
			// async query database
			dashService.profile().get({
				id: $scope.profileId,
				st: momentTime.valueOf(),
				et: momentTime.endOf('week').valueOf()
			}, function (res) {
				// events found?
				if (!res.events || !res.events.length) {
					// show alert
					$scope.showAlert('alert-warning', 'No events found!');
				} else {
					// remove from eventSources AND add new events
					$scope.eventSources.splice(EVENTS_COMPLETED, 1, res.events);
				}
				// store user
				$scope.user = res.user;
				// flesh out week data
				var week = [];
				for (var i = 0; i < 7; ++i) {
					if (typeof res.week[i] === undefined || res.week[i] === undefined) {
						week.push(0);
					} else {
						week.push(moment.duration(res.week[i].count).asMinutes());
					}
				}
				// store bar chart data
				$scope.chartistBar = {
					data: {
						labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
						series: [week]
					},
					options: {
						seriesBarDistance: 10,
						axisY: {
							labelInterpolationFnc: function (value) {
								return moment(value).format('hh:mm');
							}
						}
					}
				};
				// end loading bars
				for (var b in loadingbars) {
					loadingbars[b].end();
				}
			}, function (ignore) {
				// end loading bars
				for (var b in loadingbars) {
					loadingbars[b].end();
				}
				// flag end of loading
				$scope.user = false;
				// show alert
				$scope.showAlert('alert-danger', 'Failed to retrieve profile!');
			});
		};
		
		/** Modifies the chart default colors to the actual event colors for better readability */
		function changeChartColors () {
			// loop event groups
			for (var i in $scope.eventGroups) {
				// create css class string
				var className = ['.ct-series-', alphabet.charAt(i), ' .ct-slice-pie'].join('');
				// set background color
				$(className).css('fill', $scope.eventGroups[i].event.color);
			}
		};
		
		/** Display an alert message on the page */
		$scope.showAlert = function (style, message) {
			// check if alert is already being rendered
			if ($scope.isAlertEnabled) {
				// store message
				$scope.alerts.push({
					alertStyle: style, // 'alert-success';
					alertMessage: message // 'Successfully store new event!';
				});
			} else {
				// set variables
				$scope.alertStyle = style;
				$scope.alertMessage = message;
				// reset slideup
				$('.alert').stop(true, true);
				// show
				$scope.isAlertEnabled = true;
			}
			// auto hide alert
			$timeout(function () {
				var displayTime = 1500;
				$('.alert').fadeTo(2000, displayTime).slideUp(500, function () {
					// reset value
					$scope.isAlertEnabled = false;
					// display the next alert in the list
					if ($scope.alerts.length) {
						// remove from array
						var ref = $scope.alerts.splice(0, 1)[0];
						// do above functionality again
						$scope.showAlert(ref.alertStyle, ref.alertMessage);
					}
				});
			}, 100);
		};

		// !Do things on page load
		if ($scope.isProfilePage) {
			$scope.getProfile();
		} else {
			$scope.getEventItems();
		}
	}
})();
