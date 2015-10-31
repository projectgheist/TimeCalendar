/** Includes
 */
var mg = require('mongoose'),
    ut = require('../utils');
    
var User = mg.Schema({
	// Unique identifier
	openID: { type: String, required: true, index: { unique: true } },
	// eg. google, facebook, ...
	provider: String,
	// Email address
	email: String,
	// Name
	name: String,
	// Date the user last used the service
    lastLogin: { type: Date, default: Date.now },
	// Date the user first logged into the service
	signupTime: { type: Date, default: Date.now }
});

module.exports = mg.model('User', User);