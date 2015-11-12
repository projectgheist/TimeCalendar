/* global describe, it */

/** Includes
 */
var ap = require('../src/app');
var rq = require('supertest').agent(ap.listen());
var pp = require('../src/auth');
require('../src/routes');
require('../src/storage');
require('../src/api/events');
var mm = require('moment');

describe('Events API (no user)', function () {
	it('GET events', function (done) {
		rq
			.get('/api/0/events')
			.expect(401)
			.end(done);
	});

	it('GET events by query', function (done) {
		rq
			.get('/api/0/events/list')
			.expect(401)
			.end(done);
	});

	it('POST start event', function (done) {
		rq
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
		rq
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
describe('Events API (user)', function () {
	it('Create mock strategy', function (done) {
		ap
			.route('/login')
			.post(function * (next) {
				console.log(this.request);
				var ctx = this;
				yield pp.authenticate('local', function * (ignore, user, info) {
					if (user) {
						yield ctx.login(user);
						ctx.session.user = user;
						ctx.body = { success: true };
						ctx.status = 200;
					} else {
						ctx.body = { success: false };
						ctx.status = 400;
					}
				})
				.call(this, next);
			});
		done();
	});

	// Create the agent
	// var agent = rq.agent(sr);

	it('Mock sign in', function (done) {
		rq
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
		rq
			.get('/api/0/events')
			.expect(200)
			.end(done);
	});

	it('POST start event', function (done) {
		rq
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
		rq
			.get('/logout')
			.expect(302)
			.end(done);
	});
});
