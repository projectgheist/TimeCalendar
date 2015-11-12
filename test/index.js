/* global describe, it */

/** Includes
 */
var ap = require('../src/app');
var sr = ap.listen();
var rq = require('supertest');
var mm = require('moment');

describe('Startup', function () {
	/** Make sure that the routing code compiles
	 */
	it('Routing - Check compile', function (done) {
		require('../src/routes');
		console.log(ap);
		done();
	});

	/** Start the server on a specific port
	 */
	it('Start database', function (done) {
		require('../src/storage');
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
				st: mm()
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
				console.log(this.request.query);
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

	// Create the agent
	var agent = rq.agent(sr);

	it('Mock sign in', function (done) {
		agent
			.post('/login')
			.send({
				// !Required
				username: 'test',
				password: 'test'
			})
			.expect(200)
			.end(done);
	});

	it('GET events', function (done) {
		agent
			.get('/api/0/events')
			.expect(200)
			.end(done);
	});

	it('GET events', function (done) {
		agent
			.get('/api/0/events')
			.expect(200)
			.end(done);
	});

	it('POST start event', function (done) {
		agent
			.post('/api/0/events')
			.send({
				name: 'TestEvent',
				fontTextColor: '#fff',
				fontBgColor: '#009688',
				st: mm()
			})
			.expect(200)
			.end(done);
	});

	/* @todo
		it('POST stop event', function (done) {
			agent
				.post({
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
