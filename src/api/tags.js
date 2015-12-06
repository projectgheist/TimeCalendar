/** Module dependencies
 */
var ap = require('../app');
var db = require('../storage');
var mg = require('mongoose');

/** Event route */
var route = ap.route(/\/api\/0\/tags\/?/);
route
	/** Retrieve tags */
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			var params = this.request.query || this.request.body;
			var tags = yield db.all(db.Tag, {
				sort: {
					name: -1 // alphabetically
				},
				query: {
					$and: [ {
						user: mg.Types.ObjectId(this.req.user)
					}, {
						name: (params.n || '')
					} ]
				}
			});
			this.body = tags;
			this.status = 200;
		} else {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
