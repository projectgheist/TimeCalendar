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
		var events = yield db.all(db.EventItem,{sort:{endTime:-1}}).populate('event'),
			running = [],
			completed = [];
		for (var i in events) {
			var ref = events[i],
				n = {
					id: ref.sid,
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
		if (!params.id) {
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
			var items = yield db.EventItem.find({
					sid: params.id
				})
				.populate('event');
			if (items.length) {
				var ref = items[0];
				ref.duration = mm().diff(ref.startTime);
				ref.endTime = mm(ref.startTime).add(ref.duration, 'ms');
				yield ref.save();
			}
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
			// Save needs to be called after creating new items
			// else the defaults will be executed on every fetch
			yield item.save();
		}
		this.body = {status:'OK'};
		this.status = 200;
		yield next;
	});
route.nested('/list')
	.get(function * (next) {
		var params = this.request.query,
			opts = {};
		if (params.name) {
			opts.query = { 'name': new RegExp('.*'+params.name+'.*','i') };
		}
		var events = yield db.all(db.Event,opts);
		this.body = {'status':200,'events':events};
		this.status = 200;
		yield next;
	});