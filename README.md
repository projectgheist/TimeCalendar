# [TimeCalendar](https://github.com/projectgheist/timecalendar)

[![Dependency Status](https://david-dm.org/projectgheist/timecalendar.svg)](https://david-dm.org/projectgheist/timecalendar)
[![devDependency Status](https://david-dm.org/projectgheist/timecalendar/dev-status.svg)](https://david-dm.org/projectgheist/timecalendar#info=devDependencies)
[![Build Status](https://travis-ci.org/projectgheist/TimeCalendar.svg?branch=master)](https://travis-ci.org/projectgheist/TimeCalendar) 
[![codecov.io](https://codecov.io/github/projectgheist/TimeCalendar/coverage.svg?branch=master)](https://codecov.io/github/projectgheist/TimeCalendar?branch=master)
[![Coverage Status](https://coveralls.io/repos/projectgheist/TimeCalendar/badge.svg?branch=master&service=github)](https://coveralls.io/github/projectgheist/TimeCalendar?branch=master)
[![Inline docs](http://inch-ci.org/github/projectgheist/TimeCalendar.svg?branch=master)](http://inch-ci.org/github/projectgheist/TimeCalendar)
[![js-happiness-style](https://img.shields.io/badge/code%20style-happiness-brightgreen.svg)](https://github.com/JedWatson/happiness)

Warning: This is work in progress and not usable/stable yet!

Uses [AngularJS](http://angularjs.org/), [Twitter Bootstrap](http://getbootstrap.com) and [Bootstrap Material Design Theme](https://github.com/FezVrasta/bootstrap-material-design) for the front-end interface, but this is optional.

## Requirements:
* [Node.JS](http://nodejs.org/)
* [MongoDB](http://www.mongodb.org/)

## Quick start

Two quick start options are available:
* [Download the latest release](https://github.com/projectgheist/timecalendar/archive/master.zip)
* Clone the repo: `git clone https://github.com/projectgheist/timecalendar.git`

### Installation
* Install dependencies with 'npm install'
* Start your MongoDB server with `mongod`
* Start the server with `npm start`
* Browse to `localhost:3000`

Note: You can change the port, ip, database connection settings, ... inside the config file.

### Hosting

Supports 'Plug and play' code for the following hosts:

* [Openshift](https://www.openshift.com/)
* [Appfog](https://www.appfog.com/)
	* Requires an additional setup step:  Add an environment variable `AF_APP_URL` that contains the website root URL to the project.

Note: Both require you to add a MongoDB service to the application during setup

## Library dependencies:

### Front-end

* [Angular.JS](http://angularjs.org/)
* [Bootstrap](http://getbootstrap.com)
* [Bootstrap Material Design Theme](https://github.com/FezVrasta/bootstrap-material-design)
* [JQuery](http://jquery.com/)
	* [JQuery ScrollTo](https://github.com/balupton/jquery-scrollto)

### Back-end

* [Jade](https://github.com/visionmedia/jade)
* [Mongoose](http://mongoosejs.com/)
* [Passportjs](http://passportjs.org/)
* [ShortID](https://github.com/dylang/shortid)
* [Validator](https://github.com/chriso/validator.js)
* [Momentjs](http://momentjs.com/)

## Copyright and license
MIT
