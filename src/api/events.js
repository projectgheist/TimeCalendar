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
		// is a valid user?
		if (this.req.isAuthenticated()) {
			// get arguments
			var params = this.request.query || this.request.body;
			// find start time in momentjs format
			var momentTime = (params.st ? mm(parseInt(params.st, 0)) : mm().startOf('day'));
			// convert time to datetime
			var searchTime = momentTime.toISOString();
			// find end time
			var withinTime = (params.et ? mm(parseInt(params.et, 0)) : momentTime.endOf('day')).toISOString();
			// retrieve all event items
			var events = yield db.all(db.EventItem, {
				sort: {
					endTime: -1
				},
				query: {
					// Needs to be from this user
					user: mg.Types.ObjectId(this.req.user._id),
					// Needs to be in time range
					$or: [
						{ startTime: { $gte: searchTime, $lt: withinTime } },
						{ endTime: { $gt: searchTime, $lte: withinTime } }
					]
				}
			})
			.populate({
				path: 'event',
				populate: {
					path: 'tags',
					model: 'Tag'
				}
			});

			// declare local variables
			var running = [];
			var completed = [];

			// seperate events into completed and running categories
			for (var i in events) {
				// declare reference
				var ref = events[i];
				// find duration of event
				var d = ref.duration || mm().diff(ref.startTime);
				// format that the calendar uses
				var n = {
					id: ref.sid,
					title: ref.event.name,
					allDay: ref.allDay,
					start: ref.startTime.toISOString(),
					end: (ref.endTime || mm(ref.startTime).add(d).startOf('minute')).toISOString(),
					duration: d,
					color: ref.event.fontBgColor || '#000',
					textColor: ref.event.fontTextColor || '#fff',
					tags: ref.event.tags || []
				};
				// push to specific array
				if (ref.duration > 0) {
					completed.push(n);
				} else {
					running.push(n);
				}
			}

			// declare local variables
			var totalTime = 0;
			var grouped = [];

			// find all event items with a start time of supplied
			grouped = yield db.EventItem
				.aggregate([
				{
					$match: {
						// All events from a specific user
						user: mg.Types.ObjectId(this.req.user._id),
						// Needs to be in time range
						$or: [
							{ startTime: { $gte: new Date(searchTime), $lt: new Date(withinTime) } },
							{ endTime: { $gt: new Date(searchTime), $lte: new Date(withinTime) } }
						]
					}
				}, {
					$project: {
						event: 1,
						duration: 1,
						minhour: {
							$min: {
								$hour: '$startTime'
							}
						},
						maxhour: {
							$max: {
								$hour: {
									$ifNull: ['$endTime', new Date(mm().startOf('day'))]
								}
							}
						}
					}
				}, {
					$group: {
						_id: '$event', // !required: Group by event type
						count: {$sum: 1},
						duration: {$sum: '$duration'},
						minhour: {
							$first: '$minhour'
						},
						maxhour: {
							$first: '$maxhour'
						}
					}
				}, {
					$sort: {
						duration: -1 // descending
					}
				}
			], function (ignore, res) {
				return res;
			});
			
			var tags = yield db.Event
				.aggregate([
				{
					$unwind: '$items'
				},
				{
					$match: {
						// All events from a specific user
						user: mg.Types.ObjectId(this.req.user._id),
						// Needs to be in time range
						$or: [
							{ 'items.startTime': { $gte: new Date(searchTime), $lt: new Date(withinTime) } },
							{ 'items.endTime': { $gt: new Date(searchTime), $lte: new Date(withinTime) } }
						]
					}
				},
				{
					$unwind: '$tags'
				},
				{
					$group: {
						// !required: Group by TAG
						_id: '$tags',
						count: {$sum: 1},
						duration: {$sum: '$items.duration'}
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
			}).populate('tags');

			// populate the event items' event with events
			for (var j in grouped) {
				for (var h in populated) {
					// local reference
					var event = populated[h];
					// is the same event?
					if (String(event._id) === String(grouped[j]._id)) {
						// convert event to the same format the calendar uses
						grouped[j].event = {
							title: event.name,
							color: event.fontBgColor || '#000',
							textColor: event.fontTextColor || '#fff',
							tags: event.tags || []
						};
						// remove the id for a more clean return property
						delete grouped[j]._id;
						// break out of for-loop
						break;
					}
				}
				// increment total time
				totalTime += grouped[j].duration;
			}

			// return found data
			this.body = {
				'array': [completed, running],
				groups: grouped,
				time: totalTime,
				st: searchTime,
				et: withinTime,
				count: events.length
			};
			this.status = 200;
		} else {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});

/** Stop an event item */
function StopEventItem (Item, Options) {
	// make sure that options variable exists
	Options || (Options = {});
	// set start time
	Item.startTime = new Date(Options.st ? mm(parseInt(Options.st, 0)) : Item.startTime);
	// set end time OR floor to the nearest minute
	Item.endTime = new Date(Options.et ? mm(parseInt(Options.et, 0)) : (Item.endTime || mm().add(1, 'minute').startOf('minute')));
	// !duration needs to be a value larger then 0
	Item.duration = mm(Item.endTime).diff(Item.startTime);
}

route
	/** Add a new event item */
	.post(function * (next) {
		// is a valid user?
		if (this.req.isAuthenticated()) {
			var params = this.request.body;
			// has valid parameters?
			if (params && !ut.isEmpty(params)) {
				if (params.e) { // execute an event?
					switch (params.e) {
					case 'd': // delete a specific event
						// Find event item to delete
						var deletedItem = yield db.findAndRemove(db.EventItem, {
							// All events from a specific user
							user: mg.Types.ObjectId(this.req.user._id),
							// uid of the event
							sid: params.id
						});
						// return valid result
						this.body = deletedItem;
						this.status = deletedItem ? 200 : 400;
						break;
					case 'a': // stop all running events
						// Find event item to stop
						var dbItems = yield db.all(db.EventItem,
							{
								query: {
									// All events from a specific user
									user: mg.Types.ObjectId(this.req.user._id),
									// Still running events
									duration: 0
								}
							},
							false
						);
						// loop all retrieved events
						for (var i in dbItems) {
							// set event as completed
							StopEventItem(dbItems[i], {});
							// store item in database
							yield dbItems[i].save();
						}
						// return valid result
						this.body = {items: dbItems};
						this.status = 200;
						break;
					}
				} else if (params.name) { // Need to find existing item?
					var opts = {
						// All events from a specific user
						user: mg.Types.ObjectId(this.req.user._id)
					};
					if (params.id) {
						opts.sid = params.id;
					} else {
						opts.name = params.name;
					}
					// Find or create new event
					var dbEvent = yield db.findOrCreate(db.Event, opts).populate('tags');
					if (params.name) {
						dbEvent.name = params.name;
					}
					if (params.fontTextColor) {
						dbEvent.fontTextColor = params.fontTextColor;
					}
					if (params.fontBgColor) {
						dbEvent.fontBgColor = params.fontBgColor;
					}
					if (params.tags) {
						// make it an array, if it isn't already
						if (!ut.isArray(params.tags)) {
							params.tags = [params.tags];
						}
						// find tags in database
						var newTags = [];
						// loop tags
						for (var k in params.tags) {
							// create query
							var tag = yield db.findOrCreate(db.Tag, {
								// All tags from a specific user
								user: mg.Types.ObjectId(this.req.user._id),
								// find by tag name
								name: params.tags[k]
							});
							// add to array
							newTags.push(tag);
						}
						// add database array
						dbEvent.tags = newTags;
					}
					// Contains a start time?
					if (params.st) {
						// Create new element for event
						var item = new db.EventItem({
							event: dbEvent,
							// All event items from a specific user
							user: mg.Types.ObjectId(this.req.user._id),
							startTime: mm(params.st).startOf('minute'),
							duration: params.td || 0,
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
						// All event items from a specific user
						user: mg.Types.ObjectId(this.req.user._id),
						// ID of event item to look for
						sid: params.id
					});
					// Stop event item
					StopEventItem(dbItem, params);
					// store item
					yield dbItem.save();
					// return valid result
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

/** Returns all event types */
route.nested(/\/list\/?/)
	.get(function * (next) {
		// is a valid user?
		if (this.req.isAuthenticated()) {
			var params = ut.isEmpty(this.request.query) ? this.request.body : this.request.query;
			// find all event items with a start time of supplied
			var grouped = yield db.EventItem
				.aggregate([
					{
						$match: {
							// All events from a specific user
							user: mg.Types.ObjectId(this.req.user._id)
						}
					}, {
						$group: {
							_id: '$event', // !required
							count: {$sum: 1},
							duration: {$sum: '$duration'}
						}
					}, {
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
			}).populate('tags');

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
