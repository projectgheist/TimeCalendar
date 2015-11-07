var as = require('assert'),
	rq = require('request'),
	mm = require('moment'),
	ap,
	cf,
	url;

/** Make sure that the utilities code compiles
 */
describe('Utilities', function() {
	it('Check compile', function (done) {
		require('../src/utils');
		done();
	});
});

/** Start the server on a specific port
 */
describe('Startup', function() {
	it('Check config file', function (done) {
		cf = require('../config');
		done();
	});
	
	it('Start server', function (done) {
		ap = require('../src/app');
		ap.listen(cf.Port());
		url = ['http://localhost:',cf.Port()].join('');
		done();
	});
	
	it('Start database', function (done) {
		require('../src/storage');
		done();
	});
});

/** Make sure that the routing code compiles
 */
describe('Routing', function() {
	it('Check compile', function (done) {
		require('../src/routes');
		done();
	});
});

/** Make sure that the routing code compiles
 */
describe('Events API', function() {
	it('Check compile', function (done) {
		require('../src/api/events');
		done();
	});
	
	it('GET events (no user|no events)', function (done) {
		rq([url,'/api/0/events'].join(''), function (error, response, body) {
			if (!error && response.statusCode == 200) {
				done();
			}
		})
	});
	
	it('GET events by query (no user|no events)', function (done) {
		rq([url,'/api/0/events/list'].join(''), function (error, response, body) {
			if (!error && response.statusCode == 200) {
				done();
			}
		})
	});

	it('POST event (no user|no events)', function (done) {
		rq.post({ 
			url: [url,'/api/0/events'].join(''), 
			form: {
				name:'TestEvent',
				fontTextColor: '#fff',
				fontBgColor: '#009688',
				st: mm()
			} 
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				done();
			}
		})
	});
});

// start database