/** Module dependencies
 */
var ap = require('./app');
var cf = require('../config');

/** Routing (!Needs to be after Bodyparser) */
ap.use(require('koa-routing')(ap));

/** */
function getUser (user) {
	if (user) {
		return {
			name: user.name,
			id: user.sid
		};
	}
	return undefined;
}

/** home route */
ap
	.route('/')
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			this.render(
				'dashboard',
				{
					'config': cf.site,
					'user': getUser(this.req.user)
				},
				true
			);
		} else {
			// render splash page
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
					'config': cf.site,
					'user': getUser(this.req.user)
				},
				true
			);
			yield next;
		} else {
			this.redirect('/');
		}
	});

/** profile route */
ap
	.route(/\/profile((\/\w+)+)?\/?/)
	.get(function * (next) {
		// return render-able
		this.render(
			'profile',
			{
				'config': cf.site,
				'user': getUser(this.req.user)
			},
			true
		);
		yield next;
	});

/** views route */
ap
	.route(/\/views((\/\w+)+)?\/?/)
	.get(function * (next) {
		if (this.request.params.length && this.request.params[0]) {
			// remove leading '/'
			var name = this.request.params[0].replace(/^\//gi, '');
			// return render-able
			this.render(
				name,
				{
					'config': cf.site,
					'user': getUser(this.req.user)
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
					'config': cf.site,
					'user': getUser(this.req.user)
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
