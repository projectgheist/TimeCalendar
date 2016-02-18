/** Module dependencies
 */
var ap = require('../app');
var db = require('../storage');
var ut = require('../utils');
// var mg = require('mongoose');
var mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/profiles\/?/);

route
	/** Retrieve profile */
	.get(function * (next) {
		// get arguments
		var params = this.request.query || this.request.body;
		// make sure that parameters are present
		if (ut.isEmpty(params)) {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
		// retrieve user
		var user = yield db.User.find({
			sid: params.id
		});
		// make sure that user is valid
		if (user) {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
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

		// return found data
		this.body = {
			user: user,
			events: events
		};
		this.status = 200;
	});
