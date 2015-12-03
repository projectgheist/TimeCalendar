/** Module dependencies
 */
var ap = require('../app');
var db = require('../storage');
var ut = require('../utils');
var mg = require('mongoose');
var mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/events\/?/);
route
	/** Retrieve all event items */
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			var params = this.request.query || this.request.body;
			var searchTime = (params.st ? mm(parseInt(params.st)) : mm().startOf('day')).toDate();
			var events = yield db.all(db.EventItem, {
				sort: {
					endTime: -1
				},
				query: {
					$and: [ {
						user: mg.Types.ObjectId(this.req.user)
					}, {
						$or: [ {
							startTime: { // only today's items
								$gt: searchTime
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
				var d = ref.duration || mm().diff(ref.startTime);
				var n = {
					id: ref.sid,
					title: ref.event.name,
					start: ref.startTime,
					end: ref.endTime || mm(ref.startTime).add(d).startOf('minute'),
					duration: d,
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
			// find all event items with a start time of supplied
			var grouped = yield db.EventItem
				.aggregate([
					{
						$match: {
							startTime: { // only today's items
								$gt: searchTime
							},
							// All events from a specific user
							user: mg.Types.ObjectId(this.req.user)
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
			// find all events associated with the found event items
			var populated = yield db.Event.find({
				_id: {
					$in: grouped.map(function (val) {
						return val._id;
					})
				}
			}, function (ignore, res) {
				return res;
			});
			// populate the event items' event with events
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
			this.body = {'array': [running, completed], groups: grouped};
			this.status = 200;
		} else {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
route
	/** Add a new event item */
	.post(function * (next) {
		if (this.req.isAuthenticated()) {
			var params = this.request.body;
			if (params && !ut.isEmpty(params)) {
				// Need to find existing item?
				if (params.name) {
					var opts = {
						// All events from a specific user
						user: mg.Types.ObjectId(this.req.user)
					};
					if (params.id) {
						opts.sid = params.id;
					} else {
						opts.name = params.name;
					}
					// Find or create new event
					var dbEvent = yield db.findOrCreate(db.Event, opts);
					if (params.name) {
						dbEvent.name = params.name;
					}
					if (params.fontTextColor) {
						dbEvent.fontTextColor = params.fontTextColor;
					}
					if (params.fontBgColor) {
						dbEvent.fontBgColor = params.fontBgColor;
					}
					// Contains a start time?
					if (params.st) {
						// Create new element for event
						var item = new db.EventItem({
							event: dbEvent,
							// All event items from a specific user
							user: mg.Types.ObjectId(this.req.user),
							startTime: mm(params.st).startOf('minute'),
							duration: params.td,
							allDay: false
						});
						// Save needs to be called after creating new items
						// else the defaults will be executed on every fetch
						yield item.save();
						// Add item to event
						dbEvent.items.addToSet(item);
						// Return item id
						this.body = item;
					}
					// Save event
					yield dbEvent.save();
					this.status = 200;
				} else if (params.id) { // Stop event item
					// Find event item to stop
					var dbItem = yield db.findOrCreate(db.EventItem, {
						user: mg.Types.ObjectId(this.req.user),
						sid: params.id
					});
					// floor to the nearest minute
					dbItem.endTime = mm().add(1, 'minute').startOf('minute');
					// ! duration needs to be a value larger then 0
					dbItem.duration = mm(dbItem.endTime).diff(dbItem.startTime);
					// re-save
					yield dbItem.save();
					this.body = dbItem;
					this.status = 200;
				}
			}
			if (this.status !== 200) {
				this.body = {message: 'No valid parameters found'};
				this.status = 400;
			}
		} else {
			this.body = {message: 'POST Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
route.nested(/\/list\/?/)
	.get(function * (next) {
		if (this.req.isAuthenticated()) {
			var params = ut.isEmpty(this.request.query) ? this.request.body : this.request.query;
			// find all event items with a start time of supplied
			var grouped = yield db.EventItem
				.aggregate([
					{
						$match: {
							// All events from a specific user
							user: mg.Types.ObjectId(this.req.user)
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
			// find all events associated with the found event items
			var populated = yield db.Event.find({
				// find all events according to event items id's
				_id: {
					$in: grouped.map(function (val) {
						return val._id;
					})
				},
				// Search for a specific name
				name: new RegExp(['.*', (params.name || ''), '.*'].join(''), 'i')
			}, function (ignore, res) {
				return res;
			});
			// populate the event items' event with events
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
			// remove non-relevant entries
			if (params.name) {
				for (var i = grouped.length - 1; i >= 0; --i) {
					if (!grouped[i].hasOwnProperty('event') && grouped[i].hasOwnProperty('_id')) {
						grouped.splice(i, 1);
					}
				}
			}
			this.body = {'events': grouped};
			this.status = 200;
		} else {
			this.body = {message: 'GET Events/List: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
