/** Module dependencies
 */
var ap = require('./app'),
	cf = require('../config');
	
/** Authentication (!Needs to be before Router/Routing and after session and bodyparser) */
var pp = require('./auth');

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
		if (this.req.isAuthenticated()) {
			this.redirect('/');
		} else {
			this.render(	
				'login', 
				{
					'config': cf.site
				}, 
				true
			);
			yield next;
		}
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