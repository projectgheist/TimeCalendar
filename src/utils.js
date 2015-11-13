/** Includes
 */
var mg = require('mongoose');
var vd = require('validator');

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

/** function startsWith
 * Checks if a string starts with a certain char/string
 * @param val: char or string to search for in the input string
 * @param str: input string/array of strings
 * @param out: string value that starts with the defined val
*/
exports.startsWith = function (val, str, out) {
	// check if already an array, else make it an array
	if (!Array.isArray(str)) {
		str = [str];
	}
	// loop array of strings
	for (var i in str) {
		if (val.indexOf(str[i].toLowerCase()) === 0) {
			out = str[i];
			return true;
		}
	}
	return false;
};

/** function stringInsert
@param o: original string
@param i: string to insert
@param p: insert position
*/
exports.stringInsert = function (o, i, p) {
	return [o.slice(0, p), i, o.slice(p)].join('');
};

exports.stringReplace = function (val, str) {
	// check if already an array, else make it an array
	if (!Array.isArray(str)) {
		str = [str];
	}
	var re;
	for (var i in str) {
		re = new RegExp('(' + str[i] + ')(?:.*?)', 'i');
		val = val.replace(re, parseInt(i, 0) + 1);
	}
	return val;
};

exports.clamp = function (val, min, max) {
	return Math.min(Math.max(val, min), max);
};

exports.fullURL = function (req) {
	return req.protocol + '://' + req.headers.host + req.url;
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

// check if the string is a url
exports.isUrl = function (url) {
	return vd.isURL(url);
};

// checks if value is an array
exports.isArray = function (val) {
	return Array.isArray(val);
};

// returns a string that points to the database url
exports.getDBConnectionURL = function (obj, noPrefix) {
	var r = '';
	if (process.env.OPENSHIFT_MONGODB_DB_URL) {
		r = process.env.OPENSHIFT_MONGODB_DB_URL + obj.dbname;
	} else if (obj.url) {
		r = obj.url;
	} else if (obj.username && obj.password) {
		r = 'mongodb://' + obj.username + ':' + obj.password + '@' + obj.hostname + ':' + obj.port + '/' + obj.dbname;
	} else {
		r = 'mongodb://' + obj.hostname + ':' + obj.port + '/' + obj.dbname;
	}
	if (r) {
		r = r.substring(10, r.length);
	}
	return r;
};

/** function parseHtmlEntities
*/
exports.parseHtmlEntities = function (str) {
	if (!str) {
		return '';
	}
	return str
		.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
			var num = parseInt(numStr, 10);// read num as normal number
			return String.fromCharCode(num);
		})
		.trim();
};
