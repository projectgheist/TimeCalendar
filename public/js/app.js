(function () {
	'use strict';

	/**
	 * Global variables
	 */

	/**
	 * On page load ready, only load images that are currently visible in the view area
	 */
	jQuery(document).ready(function ($) {
		$('.alert').alert('close');
		$('input.minicolors').minicolors({theme: 'bootstrap'});
	});

	/** function clamp
	 */
	function clamp (val, min, max) {
		return Math.min(Math.max(val, min), max);
	}

	angular
		.module('webapp', [
			'ngRoute',
			'ngSanitize',
			'ngResource',
			// Include Angular Bootstrap UI
			'ui.bootstrap',
			// Include Angular UI Calendar
			'ui.calendar'
		])
		.config(appConfig)
		.directive('withripple', ['$rootScope', '$window', '$location', withripple]);

	/**
	 */
	function appConfig ($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider
		.when('/overview', {
			templateUrl: function(urlattr) {
				return 'views/overview';
			},
			controller: 'dashboardController'
		})
		.when('/edit/:type', {
			templateUrl: function(urlattr) {
				return 'views/' + urlattr.type;
			},
			controller: 'editController'
		})
		.otherwise({
			templateUrl: function(urlattr) {
				return 'views/dashboard';
			},
			controller: 'dashboardController'
		});
	}

	/**
	*/
	function withripple (rootScope, window, location) {
		return {
			restrict: 'C', // class
			link: function (scope, element, attrs) {
				element.bind('click', function () {
					if (location.path() !== element.attr('data-target')) {
						if (element.attr('data-target').indexOf('https://') !== 0) {
							rootScope.$apply(function () {
								location.path(element.attr('data-target'));
							});
						} else {
							window.open(element.attr('data-target'));
						}
					}
				});
			}
		};
	}

	/**
	*/
	function onLastRepeat () {
		return function (scope, element, attrs) {
			if (scope.$last) {
				setTimeout(function () {
					scope.$emit('onRepeatLast', element, attrs);
				}, 1);
			}
		};
	}

	/**
	*/
	function ngRipple () {
		return {
			restrict: 'A', // attribute
			link: function (scope, element, attrs) {
				// Trigger when number of children changes, including by directives like ng-repeat
				scope.$watch(function () {
					return element.children().length === parseInt(attrs['ngRipple']);
				}, function () {
					// initialize material ripple
					$.material.init();
				});
			}
		};
	}

/**
 * App configuration
 */
})();
