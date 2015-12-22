/** Includes
 */
var mg = require('mongoose');
var sc = mg.Schema;
var ut = require('../utils');
var sh = require('shortid');

/** declare Event Mongoose schema
 */
var EventItem = sc({
	// unique identifier
	sid: { type: String, default: sh.generate },
	// event it belongs to
	event: ut.refAndRequired('Event'),
	// creator
	user: ut.refAndRequired('User'),
	// date that this event was created
	creationTime: { type: Date, default: Date.now },
	// date that this event was created
	startTime: { type: Date, default: Date.now },
	// date that this event was created
	endTime: { type: Date },
	// how long the event lasted (in ms)
	duration: { type: Number, min: 0, default: 0 },
	// Flag true if event takes up the entire day
	allDay: { type: Boolean, default: false }
});

/** Export
 */
module.exports = mg.model('EventItem', EventItem);
