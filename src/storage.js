/** Includes
 */
var mg = require('mongoose');
var ut = require('./utils');
var cf = require('../config');

/** !Needs to be done before promisifyAll
 * export the models
 */
exports.Event = require('./models/event');
exports.EventItem = require('./models/eventitem');
exports.User = require('./models/user');
exports.Tag = require('./models/tag');

// if database is already connected return
if (!mg.connection || !mg.connection.db) {
	// try to connect to db
	mg.connect(ut.getDBConnectionURL(cf.db()), {});
	// declare connection variable
	var db = mg.connection;
	// Add promise support to Mongoose
	require('mongoomise').promisifyAll(db, require('rsvp'));
	// error event
	db.on('error', function (ignore) {});
	// connection established event
	db.once('open', function () {});
}

/** function all
 */
exports.all = function (model, options) {
	// use parameter or create empty object
	options || (options = {});
	// create query
	var q = model.find(options.query || {});
	// sort
	if (options.sort) {
		q.sort(options.sort);
	}
	// limit
	q.limit(options.limit || false);
	return q;
};

/** function findOrCreate
 * use an empty callback function as a fourth parameter
 */
exports.findOrCreate = function (model, item, debug) {
	return exports.updateOrCreate(model, item, item, debug);
};

/** function updateOrCreate
 */
exports.updateOrCreate = function (model, item, update, debug) {
	// upsert: bool - creates the object if it doesn't exist. Defaults to false.
	var q = model.findOneAndUpdate(item, update, {upsert: true, 'new': true});
	if (debug) console.log(q);
	return q;
};
