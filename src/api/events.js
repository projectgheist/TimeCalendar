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
		self.body = 'OK';
		self.status = 200;
		yield next;
	})
	/** Retrieve all events */
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
	/** Add a new event */
	.nested(/\/add\/?/)
		.post(function * (next) {
			var self = this,	
				params = this.request.query;
			// Find of create event type
			var eventType;
			yield db
				.findOrCreate(db.EventType, {
					name: params.type,
				})
				.then(function(type) {
					eventType = type;
				});
			// Find of create event
			yield db
				.findOrCreate(db.Event, {
					name: params.name,
					description: params.desc,
					type: eventType,
				})
				.then(function(event) {
					self.body = event;
					self.status = 200;
				});
			yield next;
		});