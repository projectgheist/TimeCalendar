/** Module dependencies
 */
var ap = require('./app');
var cf = require('../config');

/** Routing (!Needs to be after Bodyparser) */
ap.use(require('koa-routing')(ap));

/** home route */
ap
	.route('/')
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.render(
				'dashboard',
				{
					'config': cf.site
				},
				true
			);
		} else {
			this.render(
				'index',
				{
					'config': cf.site
				},
				true
			);
		}
		yield next;
	});

/** login route */
ap
	.route(/\/login\/?/)
	.get(function * (next) {
		this.redirect('/');
	});

/** logout route */
ap
	.route(/\/logout\/?/)
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.logout();
		}
		this.redirect('/');
	});

/** users overview route */
ap
	.route(/\/overview\/?/)
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.render(
				'overview',
				{
					'config': cf.site
				},
				true
			);
			yield next;
		} else {
			this.redirect('/');
		}
	});

/** views route */
ap
	.route(/\/views((\/\w+)+)?\/?/)
	.get(function * (next) {
		if (this.request.params.length && this.request.params[0]) {
			// remove leading '/'
			var name = this.request.params[0].replace(/^\//gi, '');
			this.render(
				name,
				{
					'config': cf.site
				},
				true
			);
		} else {
			this.status = 401;
		}
		yield next;
	});

var edit = ap.route(/\/edit\/?/);

/** edit event names route */
edit
	.nested(/\/eventnames\/?/)
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.render(
				'eventnames',
				{
					'config': cf.site
				},
				true
			);
			yield next;
		} else {
			this.redirect('/');
		}
	});

/** edit events route */
edit
	.nested(/\/events\/?/)
	.get(function * (next) {
		this.redirect('/');
	});
