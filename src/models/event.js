/** Includes
 */
var mg = require('mongoose');
var sc = mg.Schema;
var ut = require('../utils');
var sh = require('shortid');

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
	user: ut.refAndRequired('User'),
	// Array of EventItems associated with this event
	items: [ut.ref('EventItem')],
	// Array of Tags associated with this event
	tags: [ut.ref('Tag')],
	// color of the text
	fontTextColor: { type: String, default: '' },
	// color of the text
	fontBgColor: { type: String, default: '' }
});

/** Create unique indices
 */
Event.index({user: 1, name: 1}, {background: true});

/** Export
 */
module.exports = mg.model('Event', Event);
