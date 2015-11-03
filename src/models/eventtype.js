/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid');
	
/** declare EventType Mongoose schema
 */
var EventType = mg.Schema({
	// unique identifier
	shortid: { type: String, index: { unique: true }, default: sh.generate },
	// name/title
	name: { type: String, unique: true, trim: true, required: true },
	// description
	description: { type: String, trim: true, default: '' },
	// color of the text
	fontTextColor: { type: String, default: '' },
	// color of the text
	fontBgColor: { type: String, default: '' },
	// creator
	user: ut.ref('User'),
});

/**
 */
module.exports = mg.model('EventType', EventType);