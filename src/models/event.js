/** Includes
 */
var mg = require('mongoose'),
	sc = mg.Schema,
    ut = require('../utils'),
	sh = require('shortid');
	
/** declare Event Mongoose schema
 */
var Event = sc({
	// unique identifier
	sid: { type: String, default: sh.generate },
	// name/title
	name: { type: String, trim: true, required: true },
	// description
	description: { type: String, trim: true },
	// creator
	user: { type: sc.Types.ObjectId, ref: ut.ref('User'), required: true },
	// Array of EventItems associated with this event
	items: [ut.ref('EventItem')],
	// color of the text
	fontTextColor: { type: String, default: '' },
	// color of the text
	fontBgColor: { type: String, default: '' },
});

/**
 */
Event.index({user: 1, name: 1}, {});

/**
 */
module.exports = mg.model('Event', Event);