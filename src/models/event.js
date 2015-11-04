/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid');
	
/** declare Event Mongoose schema
 */
var Event = mg.Schema({
	// unique identifier
	shortid: { type: String, default: sh.generate },
	// name/title
	name: { type: String, trim: true, required: true },
	// description
	description: String,
	// creator
	user: ut.ref('User'),
	// color of the text
	fontTextColor: { type: String, default: '' },
	// color of the text
	fontBgColor: { type: String, default: '' },
});

/**
 */
Event.index({user: 1, shortid: 1}, {unique: true});

/**
 */
module.exports = mg.model('Event', Event);