/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid');
	
/** declare Event Mongoose schema
 */
var Event = mg.Schema({
	// unique identifier
	shortid: { type: String, unique: true, default: sh.generate },
	// name/title
	name: { type: String, unique: true, required: true },
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
module.exports = mg.model('Event', Event);