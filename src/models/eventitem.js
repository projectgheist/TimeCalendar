/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid'),
	mm = require('moment');
	
/** declare Event Mongoose schema
 */
var EventItem = mg.Schema({
	// unique identifier
	shortid: { type: String, index: { unique: true }, default: sh.generate },
	// event it belongs to
	event: ut.ref('Event'),
	// creator
	user: ut.ref('User'),
	// date that this event was created
    creationTime: { type: Date, default: Date.now },
	// date that this event was created
    startTime: { type: Date, default: Date.now },
	// date that this event was created
    endTime: { type: Date, default: 0 },
	// Flag true if event takes up the entire day
    allDay: { type: Boolean, default: false },
});

/** Returns the difference in milliseconds
 */
EventItem.virtual('duration').get(function() {
    return mm(endTime).diff(startTime);
});

/**
 */
module.exports = mg.model('EventItem', EventItem);