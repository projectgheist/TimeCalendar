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
	name: { type: String, required: true },
	// description
	description: String,
	// color of the text
	fontTextColor: String,
	// color of the text
	fontBgColor: String,
	// creator
	user: ut.ref('User'),
});

/**
 */
module.exports = mg.model('EventType', EventType);