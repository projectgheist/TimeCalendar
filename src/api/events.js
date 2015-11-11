/** Module dependencies
 */
var ap = require('../app');
var db = require('../storage');
var mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/events\/?/);
route
	/** Retrieve all event items */
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			var events = yield db.all(db.EventItem, {
				sort: {
					endTime: -1
				},
				query: {
					$and: [ {
						'user._id': this.req.user._id
					}, {
						$or: [ {
							startTime: { // only todays items
								$gt: mm().startOf('day')
							}
						}, {
							duration: { // still running items
								$lte: 0
							}
						} ]
					} ]
				}
			})
				.populate('event');
			var running = [];
			var completed = [];
			for (var i in events) {
				var ref = events[i];
				var n = {
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
						$match: {
							startTime: {
								$gt: mm().startOf('day')
							},
							'user._id': this.req.user._id
						}
					},
					{
						$group: {
							_id: '$event', // !required
							count: {$sum: 1},
							duration: {$sum: '$duration'}
						}
					},
					{
						$sort: {
							duration: -1 // descending
						}
					}
				], function (ignore, res) {
					return res;
				});
			var populated = yield db.Event.find({
				'_id': {
					$in: grouped.map(function (val) { return val._id; })
				}
			}, function (ignore, res) {
				return res;
			});
			for (var j in grouped) {
				for (var h in populated) {
					var event = populated[h];
					if (String(event._id) === String(grouped[j]._id)) {
						grouped[j].event = event;
						delete grouped[j]._id;
						break;
					}
				}
			}
			this.body = {'array': [{'events': running}, {'events': completed}], groups: grouped};
			this.status = 200;
		} else {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	})
	/** Add a new event item */
	.post(function * (next) {
		if (this.req.isAuthenticated()) {
			var params = this.request.query;
			if (params) {
				var dbEvent;
				// Need to find existing item?
				if (!params.id) {
					// Find or create new event
					dbEvent = yield db
						.findOrCreate(db.Event, {
							name: params.name,
							'user._id': this.req.user._id
						});
					dbEvent.description = params.desc;
					dbEvent.fontTextColor = params.fontTextColor;
					dbEvent.fontBgColor = params.fontBgColor;
					// Contains a start time?
					if (params.st) {
						// Create new element for event
						var item = yield db
							.findOrCreate(db.EventItem, {
								'user._id': this.req.user._id,
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
						user: this.req.user,
						sid: params.id
					})
						.populate('event');
					// Found event item?
					if (items.length) {
						var ref = items[0];
						// floor to the nearest minute
						ref.endTime = mm().startOf('minute');
						ref.duration = mm(ref.endTime).diff(ref.startTime);
						dbEvent = yield ref.save();
					}
				}
				this.body = {id: (dbEvent ? dbEvent.sid : '')};
				this.status = 200;
			} else {
				this.body = {message: 'No parameters found'};
				this.status = 400;
			}
		} else {
			this.body = {message: 'POST Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
route.nested('/list')
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			var params = this.request.query || {};
			var opts = {
				query: {
					'user._id': this.req.user._id
				}
			};
			// Search for a specific name
			if (params.name) {
				opts.query.name = new RegExp('.*' + params.name + '.*', 'i');
			}
			var events = yield db.all(db.Event, opts);
			this.body = {'events': events};
			this.status = 200;
		} else {
			this.body = {message: 'GET Events/List: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
