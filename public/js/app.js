(function() {
	'use strict';

	/**
	 * Global variables
	 */

	/**
	 * On page load ready, only load images that are currently visible in the view area
	 */
	jQuery(document).ready(function($) {
		$('input.minicolors').minicolors({theme: 'bootstrap'});
	});

	/** function clamp
	 */
	function clamp(val,min,max) {
		return Math.min(Math.max(val, min), max);
	}

	angular
		.module('webapp', [
			'ngRoute',
			'ngSanitize',
			'ngResource',
			// Include Angular Flowtype
			'ngFlowtype',
			// Include Angular Bootstrap UI
			'ui.bootstrap',
			// Include Angular UI Calendar
			'ui.calendar',
			'AppService'
		])
		.config(appConfig)
		.directive('withripple', ['$rootScope','$window','$location',withripple]);

	/**
	 */
	function appConfig($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);
		/*
		$routeProvider
		.when('/manage', {
			templateUrl: function(urlattr) {
				return 'views/pages/manage';
			},
			controller: 'overviewController'
		})
		.when('/:type/:value', {
			templateUrl: function(urlattr) {
				if (urlattr.type === 'feed') {
					return 'views/pages/posts';
				} else if (urlattr.type === 'post') {
					return 'views/pages/single';
				} else {
					return 'views/pages/dashboard';
				}
			}
		})
		.otherwise({
			templateUrl: function(urlattr) {
				return 'views/pages/dashboard';
			},
			controller: 'dashboardController'
		});
		*/
	};
	
	/**
	*/
	function withripple(rootScope, window, location) {
		return {
			restrict: 'C', // class
			link: function(scope, element, attrs) {
				element.bind('click', function() {
					if (location.path() !== element.attr('data-target')) {
						if (element.attr('data-target').indexOf('https://') !== 0) {
							rootScope.$apply(function() {
								location.path(element.attr('data-target'));
							});
						} else {
							window.open(element.attr('data-target'));
						}
					}
				});
			}
		};
	};

	/**
	*/
	function onLastRepeat() {
		return function(scope, element, attrs) {
			if (scope.$last) {
				setTimeout(function() {
					scope.$emit('onRepeatLast', element, attrs);
				}, 1);
			}
		}
	};

	/**
	*/
	function ngRipple() {
		return {
			restrict: 'A', // attribute
			link: function(scope, element, attrs) {
				// Trigger when number of children changes, including by directives like ng-repeat
				scope.$watch(function() {
					return element.children().length === parseInt(attrs['ngRipple']);
				}, function() {
					// initialize material ripple
					$.material.init();
				});
			}
		};
	}
	
	/**
	*/
	function ngTextfit() {
		return {
			restrict: 'A', // attribute
			link: function(scope, element, attrs) {
				scope.$watch(function () {
					return scope.isNavVisible();
				}, function() {
					setTimeout(function() { // requires a 1ms delay for some reason
						var b = ((attrs.ngTextfit.length === 0) || (attrs.ngTextfit === 'true'));
						element.textTailor({
							fit: b, // fit the text to the parent's height and width
							ellipsis: true,
							minFont: 16,
							justify: b 	// adds css -> text-align: justify
						});
					}, 1);
				});
			}
		};
	}

	/**
	 * Other
	 */
	var AppService = angular.module('AppService', []);

	/**
	 * App configuration
	 */
})();