/* global describe, it */

/** Includes
 */
var ap = require('../src/app');
var sr = ap.listen();
var rq = require('supertest');
var mm = require('moment');

/** Make sure that the utilities code compiles
 */
describe('Utilities', function () {
	it('Check compile', function (done) {
		require('../src/utils');
		done();
	});
});

/** Start the server on a specific port
 */
describe('Startup', function () {
	it('Start database', function (done) {
		require('../src/storage');
		done();
	});
});

/** Make sure that the routing code compiles
 */
describe('Routing', function () {
	it('Check compile', function (done) {
		require('../src/routes');
		done();
	});
});

/** Make sure that the routing code compiles
 */
describe('API', function () {
	it('Check /api/0/events.js compile', function (done) {
		require('../src/api/events');
		done();
	});
});

describe('Events API (no user|no events)', function () {
	it('GET events', function (done) {
		rq(sr)
			.get('/api/0/events')
			.expect(401)
			.end(done);
	});

	it('GET events by query', function (done) {
		rq(sr)
			.get('/api/0/events/list')
			.expect(401)
			.end(done);
	});

	it('POST start event', function (done) {
		rq(sr)
			.post('/api/0/events')
			.send({
				name: 'TestEvent',
				fontTextColor: '#fff',
				fontBgColor: '#009688',
				st: mm(),
				user: 'someting'
			})
			.expect(401)
			.end(done);
	});

	it('POST stop event', function (done) {
		rq(sr)
			.post('/api/0/events')
			.send({
				id: 'sid'
			})
			.expect(401)
			.end(done);
	});
});

/** Make sure that authentication code compiles
 */
describe('Auth', function () {
	it('Create mock strategy', function (done) {
		var pp = require('../src/auth');
		ap
			.route('/login')
			.post(function * (next) {
				var ctx = this;
				yield pp.authenticate('local', function * (ignore, user, info) {
					yield ctx.login(user);
					ctx.session.user = user;
					ctx.body = { success: true };
					ctx.status = 200;
				})
				.call(this, next);
			});
		done();
	});

	it('Mock sign in', function (done) {
		rq(sr)
			.post('/login')
			.send({
				// !Required
				username: 'test',
				password: 'test'
			})
			.expect(200)
			.end(done);
	});

	/* @todo
		var eventId;
		it('POST start event', function (done) {
			rq(sr)
				.post('/api/0/events')
				.send({
						name: 'TestEvent',
						fontTextColor: '#fff',
						fontBgColor: '#009688',
						st: mm()
				})
				.set('cookie', cookie)
				.expect(200)
				.end(done);
		});

		it('GET events', function (done) {
			rq(sr)
				.get('/api/0/events')
				.set('cookie', cookie)
				.expect(200)
				.end(done);
		});

		it('POST stop event', function (done) {
			this.timeout(5000);
			rq.post({
				url: [url,'/api/0/events'].join(''),
				qs: {
					id: eventId
				}
			}, function (error, response, body) {
					console.log(body)
				if (!error && response.statusCode == 200) {
					done();
				}
			})
		});
	*/

	it('Mock sign out', function (done) {
		rq(sr)
			.get('/logout')
			.expect(302)
			.end(done);
	});
});
