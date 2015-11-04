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
			events: events,
		};
		function events() {
			return $resource('/api/0/events', {
					name:'@name',
					desc:'@desc',
					type:'@type',
					fontTextColor:'@fontTextColor',
					fontBgColor:'@fontBgColor',
					st:'@st',
					et:'@et'
				}, { 
					query:{ method: 'GET', isArray: false } 
				});
		}
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
		'$interval',
		'$timeout', 
		'$window', 
		'dashService'
	];

	function dashController($rootScope, $scope, $http, $location, $route, $routeParams, $anchorScroll, $sce, $interval, $timeout, $window, dashService) {
		// !Prevents the page from scrolling to the id
		$('.nav-tabs a').click(function (e) {
			e.preventDefault()
			$(this).tab('show');
		});
		
		$scope.eventSources = [];
		
	    // config object for calendar
		$scope.uiConfig = {
			calendar:{
				height: 450,
				// Flagged true when an allDay event is present
				allDaySlot: false,
				editable: true,
				// initial view when the calendar loads
				defaultView: 'agendaDay',
				header:{
					left: '', // 'month basicWeek basicDay agendaWeek agendaDay',
					center: 'title',
					right: '', // 'today prev,next'
				},
				buttonText: {
					today:    'Today',
					month:    'Month',
					week:     'Week',
					day:      'Day'
				},
				dayClick: $scope.alertEventOnClick,
				eventDrop: $scope.alertEventOnClick,
				eventResize: $scope.alertEventOnClick
			}
		};

		$scope.alertEventOnClick = function() {
			console.log('alertEventOnClick');
		};
		
		$scope.alertOnDrop = function() {
			console.log('alertOnDrop');
		};
		
		$scope.alertOnResize = function(event, delta, revertFunc) {
			console.log('alertOnResize');
			console.log(event)
		};
		
		// Set default colors
		$scope.textcolor = '#fff';
		$scope.bgcolor = '#009688';
	
		//
		$scope.updateStartDate = function() {
			$scope.startDate = new Date();
			$scope.startDateFormat = moment($scope.startDate).format('MMM DD, HH:mm');
		};
		
		// Do every 15 seconds
		$interval($scope.updateStartDate, 1000 * 15);
		
		// Do immediately
		$scope.updateStartDate();
		
		// !disable the add to startdate
		$scope.addstartdate = false;
		
		// Disable the stopdate by default, indicates a currently running event
		$scope.stopdate = 0;
		
		// disable the subtract from stopdate
		$scope.subtractstopdate = false;
		
		//These variables MUST be set as a minimum for the calendar to work
		$scope.calendarview = 'day';
		$scope.calendarday = new Date();
		$scope.autoOpen = true;
		
		// POST new event
		$scope.submitEvent = function() {
			dashService.events().save({
				name:$scope.eventName,
				desc:$scope.eventDesc,
				fontTextColor:$scope.textcolor,
				fontBgColor:$scope.bgcolor,
				st:$scope.startDate,
				et:moment($scope.startdate).add(1, 'hours').toDate()
			},function(r) {
				if (r && r.status === 'OK') {
					$scope.alertStyle = 'alert-success';
					$scope.alertMessage = 'Successfully store new event!';
					$('#success-alert').fadeTo(2000, 500).slideUp(500, function(){
						$('#success-alert').alert('close');
					});
					$scope.getEvents();
				} else {
					$scope.alertStyle = 'alert-danger';
					$scope.alertMessage = 'Something when wrong submitting new event!';
				}
			});
		};

		// Retrieve event types 
		$scope.getEvents = function() {
			dashService.events().query(function(r) {
				$scope.eventSources = r.array;
			});
		};
		
		// Immediately call function
		$scope.getEvents();
	}
})();