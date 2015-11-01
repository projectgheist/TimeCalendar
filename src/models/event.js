/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid'),
	mm = require('moment');
	
/** declare Event Mongoose schema
 */
var Event = mg.Schema({
	// unique identifier
	shortid: { type: String, index: { unique: true }, default: sh.generate },
	// name/title
	name: String,
	// description
	description: String,
	// creator
	user: ut.ref('User'),
	// Type of event to determine the color, etc.
	eventtype: ut.ref('EventType'),
	// date that this event was created
    creationTime: { type: Date, default: Date.now },
	// date that this event was created
    startTime: { type: Date, default: Date.now },
	// date that this event was created
    endTime: { type: Date, default: Date.now },
	// Flag true if event takes up the entire day
    allDay: { type: Boolean, default: false },
});

/** Returns the difference in milliseconds
 */
Event.virtual('duration').get(function() {
    return mm(endTime).diff(startTime);
});

/**
 */
module.exports = mg.model('Event', Event);