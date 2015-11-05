/** Module dependencies
 */
var ap = require('../../app'),
	ut = require('../utils'),
	db = require('../storage'),
	mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/events\/?/);
route
	/** Retrieve all event items */
	.get(function * (next) {
		var events = yield db.all(db.EventItem,{}).populate('event'),
			running = [],
			completed = [];
		for (var i in events) {
			var ref = events[i],
				n = {
					id: ref.shortid,
					title: ref.event.name,
					start: ref.startTime,
					end: ref.endTime,
					duration: ref.duration,
					allDay: ref.allDay,
					color: ref.event.fontBgColor || '#000',
					textColor: ref.event.fontTextColor || '#fff'
				};
			if (ref.duration > 0) {
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
		if (!params.shortid) {
			// Find of create event
			var dbEvent = yield db
				.findOrCreate(db.Event, {
					name: params.name,
				});
			dbEvent.description = params.desc;
			dbEvent.fontTextColor = params.fontTextColor;
			dbEvent.fontBgColor = params.fontBgColor;
			yield dbEvent.save();
		} else {
			console.log(params.shortid)
			var item = yield db.EventItem.findOne({
				})
				.populate('event');
			console.log(item)
			item.duration = mm().diff(item.startTime);
			yield item.save();
		}
		// Contains a start time?
		if (params.st) {
			// Create new element for event
			var item = yield db
				.findOrCreate(db.EventItem, {
					startTime: params.st,
					duration: params.td,
					event: dbEvent,
					allDay: false
				});
			console.log(item)
		}
		this.body = {status:'OK'};
		this.status = 200;
		yield next;
	});
route.nested('/list')
	.get(function * (next) {
		var events = yield db.all(db.Event,{});
		this.body = {'status':200,'events':events};
		this.status = 200;
		yield next;
	});