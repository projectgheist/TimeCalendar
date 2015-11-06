/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid');
	
/** declare Event Mongoose schema
 */
var Event = mg.Schema({
	// unique identifier
	sid: { type: String, default: sh.generate },
	// name/title
	name: { type: String, trim: true, required: true },
	// description
	description: { type: String, trim: true },
	// creator
	user: ut.ref('User'),
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