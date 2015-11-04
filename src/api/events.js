/** Module dependencies
 */
var ap = require('../../app'),
	ut = require('../utils'),
	db = require('../storage'),
	mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/events\/?/);
route
	/** Retrieve all events */
	.get(function * (next) {
		var events = yield db.all(db.EventItem,{}).populate('event'),
			running = [],
			completed = [];
		for (var i in events) {
			var ref = events[i],	
				n = {
					title: ref.event.name,
					start: ref.startTime,
					end: ref.endTime,
					duration: ref.duration,
					allDay: ref.allDay,
					color: ref.event.fontBgColor || '#000',
					textColor: ref.event.fontTextColor || '#fff'
				};
			if (ref.endTime) {
				completed.push(n);
			} else {
				running.push(n);
			}
		}
		this.body = {'array': [{'events':running},{'events':completed}]};
		this.status = 200;
		yield next;
	})
	/** Add a new event item */
	.post(function * (next) {
		var params = this.request.query;
		// Find of create event
		var dbEvent = yield db
			.findOrCreate(db.Event, {
				name: params.name,
			});
		dbEvent.description = params.desc;
		dbEvent.fontTextColor = params.fontTextColor;
		dbEvent.fontBgColor = params.fontBgColor;
		yield dbEvent.save();
		
		// Create new element for event
		yield db
			.findOrCreate(db.EventItem, {
				startTime: params.st,
				endTime: params.et,
				event: dbEvent,
				allDay: false
			});
		this.body = {status:'OK'};
		this.status = 200;
		yield next;
	});