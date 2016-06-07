//Gruntfile
module.exports = function(grunt) {
	//Initializing the configuration object
	grunt.initConfig({
		// Read package information
		pkg: grunt.file.readJSON('package.json'),
		
		// Task configuration
		concat: {
			//...
			options: {
				separator: ';',
			},
			js: {
				src: [
					'./bower_components/jquery/dist/jquery.js', // needs to be included before bootstrap and angularjs
					'./bower_components/angular/angular.js',
					'./bower_components/angular-route/angular-route.js',
					'./bower_components/angular-sanitize/angular-sanitize.js',
					'./bower_components/angular-resource/angular-resource.js',
					'./bower_components/bootstrap/dist/js/bootstrap.js', // needs to be included before ui-bootstrap and angular-bootstrap-calendar-tpls
					
					'./bower_components/bootstrap-material-design/dist/js/ripples.js',
					'./bower_components/bootstrap-material-design/dist/js/material.js',

					'./bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
					'./bower_components/moment/moment.js', // needs to be included before angular-bootstrap-calendar-tpls
					
					'./bower_components/angular-ui-calendar/src/calendar.js',
					'./bower_components/fullcalendar/dist/fullcalendar.js',
					'./bower_components/fullcalendar/dist/gcal.js',

					'./private/js/jquery.minicolors.js',

					'./bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
					'./bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput-angular.js',
					
					'./bower_components/chartist/dist/chartist.js',
					'./bower_components/angular-chartist.js/dist/angular-chartist.js',
					
					'./bower_components/Flowtype.js/flowtype.js',
					'./bower_components/angular-flowtype/angular-flowtype.js',
	
					'./bower_components/mprogress/build/js/mprogress.js',
	
					'./private/js/mousetrap.js',
					'./private/js/jquery.texttailor.js'
				],
				dest: './public/js/<%= pkg.name %>.js'
			},
			css: {
				src: [
					'./bower_components/font-awesome/css/font-awesome.css', // needs to be included before bootstrap
					'./bower_components/bootstrap/dist/css/bootstrap.css', // needs to be included before fullcalendar

					'./bower_components/bootstrap-material-design/dist/css/bootstrap-material-design.css',
					'./bower_components/bootstrap-material-design/dist/css/ripples.css',
					'./bower_components/angular-bootstrap/ui-bootstrap-csp.css',

					'./bower_components/fullcalendar/dist/fullcalendar.css',
					'./private/css/_materialFullCalendar.scss',
					'./private/css/jquery.minicolors.css',
					'./bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.css',
					'./bower_components/chartist/dist/chartist.min.css',
					'./bower_components/mprogress/build/css/mprogress.css',
				],
				dest: './public/css/<%= pkg.name %>.css'
			}
		},
		cssmin: {
			// Minimize CSS file
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1,
				keepSpecialComments: 0
			},
			dist: {
				src: ['./public/css/<%= pkg.name %>.css'],
				dest: './public/css/<%= pkg.name %>.min.css'
			}
		},
		uglify: {
			// Minimize Javascript file
			options: {
				mangle: false  // Use if you want the names of your functions and variables unchanged
			},
			build: {
				src: ['./public/js/<%= pkg.name %>.js'],
				dest: './public/js/<%= pkg.name %>.min.js'
			}
		},
		copy: {
			dist: {
				files: [
					// includes files within path and its sub-directories
					{
						expand: true,
						flatten: true,
						src: [
							'./bower_components/font-awesome/fonts/*',
							'./bower_components/bootstrap/dist/fonts/*',
						], 
						dest: './public/fonts'
					},
					{
						expand: true,
						flatten: true,
						src: [
						], 
						dest: './public/js'
					},
					{
						expand: true,
						flatten: true,
						src: [
							'./private/img/jquery.minicolors.png',
						], 
						dest: './public'
					}
				],
			},
		},
		watch: {
			//...
			scripts: {
				files: ['public/js/*.js', 'public/css/*.css'],
				tasks: ['default'],
				options: {
				}
			}
		}
	});
	
	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Task definition
	grunt.registerTask('default', ['concat','cssmin','uglify','copy']);
};
