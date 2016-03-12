/** Module dependencies
 */
var ap = require('../app');
var db = require('../storage');
var mg = require('mongoose');
var mm = require('moment');

/** Event route */
var route = ap.route(/\/api\/0\/utils\/?/);

/** Retrieve all events */
route
	.nested(/\/export\/?/)
	.get(function * (next) {
		// is a valid user?
		if (this.req.isAuthenticated()) {
			// retrieve all event items
			var items = yield db.all(db.EventItem, {
				sort: {
					// sort by newest first
					endTime: -1
				},
				query: {
					// Needs to be from this user
					user: mg.Types.ObjectId(this.req.user._id)
				}
			})
			.populate({
				path: 'event',
				populate: {
					path: 'tags',
					model: 'Tag'
				}
			});
			// variable to return
			var output = [];
			// seperate events into completed and running categories
			for (var i in items) {
				// declare reference
				var ref = items[i];
				// find duration of event
				var d = ref.duration || mm().diff(ref.startTime);
				// format that the calendar uses
				output.push({
					title: ref.event.name,
					allDay: ref.allDay,
					start: ref.startTime.toISOString(),
					end: (ref.endTime || mm(ref.startTime).add(d).startOf('minute')).toISOString(),
					duration: d,
					color: ref.event.fontBgColor || '#000',
					textColor: ref.event.fontTextColor || '#fff',
					tags: ref.event.tags ? ref.event.tags.map(function (val) { return val.name; }) : []
				});
			}
			this.body = output;
			this.status = 200;
		} else {
			this.body = {message: 'GET Events: Authentication is required'};
			this.status = 401;
		}
		yield next;
	});
