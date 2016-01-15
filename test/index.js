/* global describe, it */

/** Includes
 */
var cf = require('../config');
var ap = require('../src/app');
var pp = require('../src/auth');
var db = require('../src/storage');
require('../src/routes');
require('../src/api/events');
var rq = require('supertest').agent(ap.listen());
var mm = require('moment');

/** Create mock passportjs strategy
 */
var Strategy = require('passport-local').Strategy;
pp.use(
	new Strategy(
		function (username, password, done) {
			return db
				.findOrCreate(db.User, { openID: 1, provider: 'local', name: 'test' })
				.then(function (user) {
					return done(null, user);
				});
		}
	)
);

describe('Initialize', function () {
	it('Server started at ' + cf.Url(), function (done) {
		done();
	});
});

describe('Events API (no user)', function () {
	it('Route - Home', function (done) {
		rq
			.get('/')
			.expect(200)
			.end(done);
	});

	it('Route - Overview', function (done) {
		rq
			.get('/overview')
			.expect(302)
			.end(done);
	});
	
	it('Route - Profile', function (done) {
		rq
			.get('/profile')
			.expect(200)
			.end(done);
	});

	it('Route - Login', function (done) {
		rq
			.get('/login')
			.expect(302)
			.end(done);
	});

	it('Route - Edit event names', function (done) {
		rq
			.get('/edit/eventnames')
			.expect(302)
			.end(done);
	});

	it('Route - Edit events', function (done) {
		rq
			.get('/edit/events')
			.expect(302)
			.end(done);
	});

	it('Route - Views (no params)', function (done) {
		rq
			.get('/views')
			.expect(401)
			.end(done);
	});

	it('Route - Views', function (done) {
		rq
			.get('/views/overview')
			.expect(200)
			.end(done);
	});

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

	it('GET tags', function (done) {
		rq
			.get('/api/0/events')
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

	it('Route - Home', function (done) {
		rq
			.get('/')
			.expect(200)
			.end(done);
	});

	it('Route - Edit event names', function (done) {
		rq
			.get('/edit/eventnames')
			.expect(200)
			.end(done);
	});

	it('Route - Overview', function (done) {
		rq
			.get('/overview')
			.expect(200)
			.end(done);
	});

	it('GET events (no events)', function (done) {
		rq
			.get('/api/0/events')
			.expect(200)
			.end(done);
	});

	it('GET events by query', function (done) {
		rq
			.get('/api/0/events/list')
			.expect(200)
			.end(done);
	});

	it('POST start event (no params)', function (done) {
		rq
			.post('/api/0/events')
			.send({})
			.expect(400)
			.end(done);
	});

	it('POST create event', function (done) {
		rq
			.post('/api/0/events')
			.send({
				name: 'CreateEvent',
				fontTextColor: '#fff',
				fontBgColor: '#009688'
			})
			.expect(200)
			.end(done);
	});

	var item;
	it('POST start event', function (done) {
		rq
			.post('/api/0/events')
			.send({
				name: 'TestEvent',
				fontTextColor: '#fff',
				fontBgColor: '#009688',
				st: mm(),
				tags: ['Public']
			})
			.expect(200)
			.end(function (ignore, res) {
				if (res.body && res.body.sid) {
					item = res.body;
					done();
				}
			});
	});

	it('POST start another event', function (done) {
		rq
			.post('/api/0/events')
			.send({
				name: 'SecondEvent',
				fontTextColor: '#fff',
				fontBgColor: '#009688',
				st: mm()
			})
			.expect(200)
			.end(function (ignore, res) {
				if (res.body && res.body.sid) {
					done();
				}
			});
	});

	it('GET events (running events)', function (done) {
		rq
			.get('/api/0/events')
			.expect(200)
			.end(function (ignore, res) {
				if (res.body.array && res.body.array[0].length) {
					done();
				}
			});
	});

	it('GET events by query', function (done) {
		rq
			.get('/api/0/events/list')
			.expect(200)
			.end(function (ignore, res) {
				if (res.body.events && res.body.events.length) {
					done();
				}
			});
	});

	it('POST stop event', function (done) {
		rq
			.post('/api/0/events')
			.send({
				id: item.sid
			})
			.expect(200)
			.end(function (ignore, res) {
				if (res.body && res.body.sid) {
					done();
				}
			});
	});

	it('POST stop all events', function (done) {
		rq
			.post('/api/0/events')
			.send({
				e: 'a'
			})
			.expect(200)
			.end(function (ignore, res) {
				if (res.body && res.body.items.length) {
					done();
				}
			});
	});

	it('POST edit event name', function (done) {
		rq
			.post('/api/0/events')
			.send({
				id: item.event.sid,
				name: 'EditTestEvent',
				fontTextColor: '#000',
				fontBgColor: '#009688',
				tags: 'QA'
			})
			.expect(200)
			.end(done);
	});

	it('GET events by query', function (done) {
		rq
			.get('/api/0/events/list')
			.send({
				name: 'DontSelectAnyEvents'
			})
			.expect(200)
			.end(done);
	});

	it('GET events (completed events)', function (done) {
		rq
			.get('/api/0/events')
			.expect(200)
			.end(function (ignore, res) {
				if (res.body.array && res.body.array[1].length) {
					done();
				}
			});
	});

	it('GET tags', function (done) {
		rq
			.get('/api/0/events')
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
