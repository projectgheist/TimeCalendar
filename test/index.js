/* global describe, it */

/** Includes
 */
var ap = require('../src/app');
var pp = require('../src/auth');
require('../src/routes');
require('../src/storage');
require('../src/api/events');
var rq = require('supertest').agent(ap.listen());
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
				var ctx = this;
				if (this.request.body) {
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
				} else {
					ctx.body = { success: false };
					ctx.status = 400;
					yield next;
				}
			});
		done();
	});

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
			.end(function (ignore, res) {
				done();
			});
	});

	var itemId;
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
			.end(function (ignore, res) {
				itemId = res.body;
				done();
			});
	});

	it('POST stop event', function (done) {
		rq
			.post('/api/0/events')
			.send(itemId)
			.expect(200)
			.end(done);
	});

	it('Mock sign out', function (done) {
		rq
			.get('/logout')
			.expect(302)
			.end(done);
	});
});
