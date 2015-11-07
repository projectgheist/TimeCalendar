/** Module dependencies
 */
var ap = require('./app'),
	cf = require('../config');
	
/** Sessions */
ap.keys = ['your-session-secret']
ap.use(require('koa-generic-session')());

/** Bodyparser */
ap.use(require('koa-bodyparser')());

/** Routing (!Needs to be after Bodyparser) */
ap.use(require('koa-routing')(ap));

/** Authentication */
require('./auth')

/** home route */
ap
	.route('/')
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.redirect('/dashboard');
		} else {
			this.render(	
				'index', 
				{
					'config': cf.site
				}, 
				true
			);
			yield next;
		}
	});

/** login route */
ap
	.route(/\/login\/?/)
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.redirect('/dashboard');
		} else {
			this.redirect('/');
		}
	});

/** home route */
ap
	.route(/\/dashboard\/?/)
	.get(function * (next) {
		if (false && !this.req.isAuthenticated()) {
			this.redirect('/login');
		} else {
			this.render(	
				'dashboard', 
				{
					'config': cf.site
				}, 
				true
			);
			yield next;
		}
	});

/** logout route */
/*
ap.get("/logout", ensureAuth, function(req, res) {
	req.logout(); 
	res.redirect('/'); 
});
*/