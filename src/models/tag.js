/** Includes
 */
var mg = require('mongoose');
var sc = mg.Schema;
var ut = require('../utils');
var sh = require('shortid');

/** declare Event Mongoose schema
 */
var Tag = sc({
	// unique identifier
	sid: { type: String, default: sh.generate },
	// creator
	user: ut.refAndRequired('User'),
	// name/title
	name: { type: String, trim: true, required: true }
});

/** Export
 */
module.exports = mg.model('Tag', Tag);
