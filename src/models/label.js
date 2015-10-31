/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils'),
	sh = require('shortid');
	
/** declare Event Mongoose schema
 */
var Label = mg.Schema({
	// name/title
	name: { type: String, required: true, index: { unique: true } },
	// description
	description: String,
	// color
	color: String,
	// creator
	user: ut.ref('User'),
});

/**
 */
module.exports = mg.model('Label', Label);