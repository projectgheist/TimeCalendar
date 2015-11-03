/** Module dependencies
 */
var ap = require('../../app'),
	ut = require('../utils'),
	db = require('../storage');

/** Event route */
var route = ap.route(/\/api\/0\/events\/?/);
route
	/** Retrieve all events */
	.get(function * (next) {
		console.log(this.request.query)
		var events = yield db.all(db.Event,{}).populate('type');
		this.body = events;
		this.status = 200;
		yield next;
	})
	/** Add a new event */
	.post(function * (next) {
		var params = this.request.query;
		// Find of create event type
		var eventType = yield db.findOrCreate(db.EventType, {
				name: params.type,
			});
		// Find of create event
		var event = yield db
			.findOrCreate(db.Event, {
				name: params.name,
			});
		event.description = params.desc;
		event.type = eventType;
		yield event.save();
		
		// Create new element for event
		/*
		var element = yield db
			.findOrCreate(db.EventItem, {
				startTime: params.name,
				endTime:
			});
*/
		self.body = event;
		self.status = 200;
		yield next;
	});