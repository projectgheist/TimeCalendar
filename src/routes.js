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
