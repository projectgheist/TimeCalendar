/** Module dependencies
 */
var ap = require('./app'),
	cf = require('../config');
	
/** Sessions */
ap.keys = ['your-session-secret']
ap.use(require('koa-generic-session')());

/** Bodyparser */
ap.use(require('koa-bodyparser')());

/** Authentication (!Needs to be before Router/Routing and after session and bodyparser) */
var pp = require('./auth')

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

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at '/auth/google/callback'
ap
	.route('/auth/google')
	.get(
		pp.authenticate(
			'google', 
			{ 
				scope: 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email' 
			})
	);

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
ap
	.route('/auth/google/callback')
	.get(
		pp.authenticate(
			'google', 
			{ 
				successRedirect: '/',
				failureRedirect: '/' 
			})
	);

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
		}
	});

/** logout route */
ap
	.route(/\/logout\/?/)
	.get(function * (next) {
		this.logout();
		this.redirect('/'); 
	});