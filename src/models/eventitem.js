/** Includes
 */
var mg = require('mongoose'),
	sc = mg.Schema,
    ut = require('../utils'),
	sh = require('shortid'),
	mm = require('moment');
	
/** declare Event Mongoose schema
 */
var EventItem = sc({
	// unique identifier
	sid: { type: String, default: sh.generate },
	// event it belongs to
	event: { type: sc.Types.ObjectId, ref: ut.ref('Event'), required: true },
	// creator
	user: ut.ref('User'),
	// date that this event was created
    creationTime: { type: Date, default: Date.now },
	// date that this event was created
    startTime: { type: Date, default: Date.now },
	// date that this event was created
    endTime: { type: Date },
	// how long the event lasted
    duration: { type: Number, min: 0, default: 0 },
	// Flag true if event takes up the entire day
    allDay: { type: Boolean, default: false },
});

/**
 */
EventItem.index({user: 1, sid: 1}, {unique: true});

/**
 */
module.exports = mg.model('EventItem', EventItem);