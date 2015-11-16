/** Includes
 */
var mg = require('mongoose');

/** function isEmpty
*/
exports.isEmpty = function (obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
};

exports.ref = function (type) {
	return {
		type: mg.Schema.Types.ObjectId,
		ref: type
	};
};

// Creates a reference to the model and makes it a required input
exports.refAndRequired = function (type) {
	return {
		type: mg.Schema.Types.ObjectId,
		ref: type,
		required: true
	};
};

// returns a string that points to the database url
exports.getDBConnectionURL = function (obj, noPrefix) {
	var r = process.env.MONGODB_URL ? [process.env.MONGODB_URL, obj.dbname].join('') : obj.url;
	if (!r) {
		r = (obj.username && obj.password) ? [obj.username, ':', obj.password, '@'].join('') : '';
		r = [r, obj.hostname, ':', obj.port, '/', obj.dbname].join('');
	}
	// removes 'mongodb://' from string
	r = r.replace(/mongodb:\/\//gi, '');
	return r;
};
