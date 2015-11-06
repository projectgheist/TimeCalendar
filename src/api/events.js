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
		var grouped = yield db.EventItem
			.aggregate([
				{
					$group: {
						_id: '$event', // !required
						count: {$sum: 1},
						duration: {$sum: '$duration'},
					}
				},
				{
					$sort: {
						duration: -1 // descending
					}
				}
			], function(err,res) {
				return res;
			});
		var populated = yield db.Event.find({
			'_id': {
				$in: grouped.map(function(val) { return val._id; })
			}
		}, function(err, res) {
			return res;
		});
		for (var i in grouped) {
			for (var j in populated) {
				var ref = populated[j];
				if (String(ref._id) === String(grouped[i]._id)) {
					grouped[i].event = ref;
					delete grouped[i]._id;
					break;
				}
			}
		}
		this.body = {'array': [{'events':running},{'events':completed}], groups: grouped};
		this.status = 200;
		yield next;
	})
	/** Add a new event item */
	.post(function * (next) {
		var params = this.request.query;
		if (!params.id) {
			// Find or create new event
			var dbEvent = yield db
				.findOrCreate(db.Event, {
					name: params.name,
				});
			dbEvent.description = params.desc;
			dbEvent.fontTextColor = params.fontTextColor;
			dbEvent.fontBgColor = params.fontBgColor;
			// Contains a start time?
			if (params.st) {
				// Create new element for event
				var item = yield db
					.findOrCreate(db.EventItem, {
						startTime: mm(params.st).add(1, 'minute').startOf('minute'),
						duration: params.td,
						event: dbEvent,
						allDay: false
					});
				// Add item to event
				dbEvent.items.addToSet(item);
				// Save needs to be called after creating new items
				// else the defaults will be executed on every fetch
				yield item.save();
			}
			// Save event
			yield dbEvent.save();
		} else {
			// Find event item
			var items = yield db.EventItem.find({
					sid: params.id
				})
				.populate('event');
			// Found event item?
			if (items.length) {
				var ref = items[0];
				// floor to the nearest minute
				ref.endTime = mm().startOf('minute');
				ref.duration = mm(ref.endTime).diff(ref.startTime);
				yield ref.save();
			}
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