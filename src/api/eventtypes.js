/** Module dependencies
 */
var ap = require('../../app'),
	ut = require('../utils'),
	db = require('../storage');

/** Event route */
var route = ap.route(/\/api\/0\/events\/?/);
route
	.get(function * (next) {
		// Does nothing yet
		yield next;
	})
	.nested(/\/list\/?/)
		.get(function * (next) {
			console.log(this.request.query)
			var self = this;
			yield db
				.all(db.Event,{})
				.then(function(events) {
					self.body = events;
					self.status = 200;
				});
			yield next;
		});
route
	.nested(/\/add\/?/)
		.post(function * (next) {
			console.log(this.request.query)
			var self = this;
			/*
			yield db
				.findOrCreate(db.Events, {})
				.then(function(feed) {
					self.body = 'OK';
					self.status = 200;
				});
			*/
			yield next;
		});