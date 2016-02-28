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
				// retrieve all event items
				var events = yield db.all(db.EventItem, {
					sort: {
						endTime: -1 // newest first
					},
					query: {
						$and: [ {
							user: user
						}, {
							$or: [ {
								startTime: {
									$gt: mm(parseInt(params.st, 0)).toDate()
								}
							}, {
								endTime: {
									$lte: mm(parseInt(params.et, 0)).toDate()
								}
							}]
						} ]
					}
				})
				.populate({
					path: 'event',
					populate: {
						path: 'tags'
					}
				});
				
				// format events into calendar events
				var outputEvents = [];
				for (var i in events) {
					var ref = events[i];
					outputEvents.push({
						id: ref.sid,
						title: ref.event.name,
						allDay: ref.allDay,
						start: ref.startTime,
						end: ref.endTime,
						duration: ref.duration,
						color: ref.event.fontBgColor || '#000',
						textColor: ref.event.fontTextColor || '#fff'
					});
				}

				// return found data
				this.body = {
					user: user,
					events: outputEvents
				};
				this.status = 200;
			} else {
				this.body = {message: 'GET Profile: Invalid user id'};
				this.status = 400;
			}
		}
		yield next;
	});
