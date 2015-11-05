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
	shortid: { type: String, default: sh.generate },
	// event it belongs to
	event: ut.ref('Event'),
	// creator
	user: ut.ref('User'),
	// date that this event was created
    creationTime: { type: Date, default: Date.now },
	// date that this event was created
    startTime: { type: Date, default: Date.now },
	// how long the event lasted
    duration: { type: Number, min: 0, default: 0 },
	// Flag true if event takes up the entire day
    allDay: { type: Boolean, default: false },
});

/**
 */
EventItem.index({user: 1, shortid: 1}, {unique: true});

/** Returns the difference in milliseconds
 */
EventItem.virtual('endTime').get(function() {
    return (this.duration ? mm(this.startTime).add(this.startTime, 'ms') : 0);
});

/**
 */
module.exports = mg.model('EventItem', EventItem);