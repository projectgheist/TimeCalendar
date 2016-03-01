/** Module dependencies
 */
var ap = require('../app');
var db = require('../storage');
var ut = require('../utils');
var mg = require('mongoose');
var mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/profiles\/?/);

route
	/** Retrieve profile */
	.get(function * (next) {
		// get arguments
		var params = this.request.query || this.request.body;
		// make sure that parameters are present
		if (ut.isEmpty(params) || !params.id) {
			this.body = {message: 'GET Profile: Valid parameters required'};
			this.status = 400;
		} else {
			var orParam = [{ sid: params.id }];
			// !Hacky way to make sure that the objectid is valid, should be replaced with a better check
			if (params.id.length > 12 && mg.Types.ObjectId.isValid(params.id)) {
				orParam.push({ _id: params.id });
			}
			// retrieve user
			var dbUser = yield db.User.find({
				$or: orParam
			});
			// make sure that user is valid
			if (dbUser && dbUser.length) {
				var user = dbUser[0];
				var searchTime = (params.st ? mm(parseInt(params.st, 0)) : mm().startOf('week')).toISOString();
				var withinTime = (params.et ? mm(parseInt(params.et, 0)) : mm().endOf('week')).toISOString();
				
				// retrieve all event items
				var events = yield db.all(db.EventItem, {
					sort: {
						endTime: -1 // newest first
					},
					query: {
						// Needs to be from this user
						user: user,
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
						path: 'tags'
					}
				});
				
				// formulate break down of events per day
				var dayTimes = yield db.EventItem.aggregate([
					{
						$match: {
							// All events from a specific user
							user: user._id,
							// Needs to be in time range
							$or: [
								{ startTime: { $gte: new Date(searchTime), $lt: new Date(withinTime) } },
								{ endTime: { $gt: new Date(searchTime), $lte: new Date(withinTime) } }
							]
						}
					}, {
						$group: {
							// !required: Use all found event items
							_id: {
								$dayOfWeek: '$startTime'
							},
							count: {
								$sum: '$duration'
							}
						}
					}, {
						$sort: {
							_id: 1
						}
					}
				], function (ignore, res) {
					return res;
				});
				
				// format events into calendar events
				var outputEvents = [];
				for (var i in events) {
					// local reference
					var ref = events[i];
					// find duration of event
					var d = ref.duration || mm().diff(ref.startTime);
					// add formatted event to array
					outputEvents.push({
						id: ref.sid,
						title: ref.event.name,
						allDay: ref.allDay,
						start: ref.startTime.toISOString(),
						end: (ref.endTime || mm(ref.startTime).add(d).startOf('minute')).toISOString(),
						duration: d,
						color: ref.event.fontBgColor || '#000',
						textColor: ref.event.fontTextColor || '#fff'
					});
				}

				// return found data
				this.body = {
					user: {
						name: user.name,
						id: user.sid
					},
					events: outputEvents,
					week: dayTimes
				};
				this.status = 200;
			} else {
				this.body = {message: 'GET Profile: Invalid user id'};
				this.status = 400;
			}
		}
		yield next;
	});
