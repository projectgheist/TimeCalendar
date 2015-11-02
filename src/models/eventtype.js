/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils');
	
/** declare EventType Mongoose schema
 */
var EventType = mg.Schema({
	// name/title
	name: { type: String, required: true, index: { unique: true } },
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