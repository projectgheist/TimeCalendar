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
			types: types,
			events: events,
		};
		function types() {
			return $resource('/api/0/eventtypes', {name:'@name',description:'@description',fontTextColor:'@fontTextColor',fontBgColor:'@fontBgColor'}, { query:{ method: 'GET', isArray: true } });
		}
		function events() {
			return $resource('/api/0/events', {name:'@name',desc:'@desc',type:'@type'});
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
		
		var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();
		
		// event source that contains custom events on the scope
		$scope.calendarEvents = [
		  {title: 'All Day Event',start: new Date(y, m, 1),color: '#f00',textColor: 'yellow'},
		  {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
		  {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
		  {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
		  {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
		  {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29)}
		];
		
		$scope.calendarEventSources = [$scope.calendarEvents];
		
	    // config object for calendar
		$scope.uiConfig = {
			calendar:{
				height: 450,
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
				eventDrop: $scope.alertOnDrop,
				eventResize: $scope.alertOnResize
			}
		};
		
		//
		$scope.textcolor = '#ffa';
		$scope.bgcolor = '#ab';
	
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
		
		//
		$scope.stopdate = moment($scope.startdate).add(1, 'hours');
		
		// disable the subtract from stopdate
		$scope.subtractstopdate = false;
		
		//
		$scope.eventtypes = [{'name':'normal'},{'name':'info'}];
		$scope.eventType = $scope.eventtypes[0]
		
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
		
		// Retrieve event types 
		$scope.getEventTypes = function() {
			dashService.types().query(function(r) {	
				$scope.eventTypes = r;
			});
		};
		
		// Immediately call function
		$scope.getEventTypes();
		
		// Retrieve event types 
		$scope.getEvents = function() {
			dashService.events().query(function(r) {
				$scope.events = r;
			});
		};

		// POST new event
		$scope.submitEvent = function() {
			dashService.events().save({name:$scope.eventName,desc:$scope.eventDesc,type:$scope.eventType},function(r) {
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

		// POST new event type
		$scope.submitType = function() {
			dashService.types().save({
				name: $scope.typename,
				description: $scope.typedesc,
				fontTextColor: $scope.textcolor,
				fontBgColor: $scope.bgcolor,
			}, function(r) {
				if (r && r.status === 'OK') {
					$scope.alertStyle = 'alert-success';
					$scope.alertMessage = 'Successfully store new event type!';
					$('#success-alert').fadeTo(2000, 500).slideUp(500, function(){
						$('#success-alert').alert('close');
					});
					$scope.getEventTypes();
				} else {
					$scope.alertStyle = 'alert-danger';
					$scope.alertMessage = 'Something when wrong submitting new event type!';
				}
			});
		}
	}
})();