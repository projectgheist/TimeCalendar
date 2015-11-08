/** Includes
 */
var mg = require('mongoose'),
	rs = require('rsvp'),
	ut = require('./utils'),
	cf = require('../config');

/** !Needs to be done before promisifyAll
 * export the models
 */
exports.Event = require('./models/event');
exports.EventType = require('./models/eventtype');
exports.EventItem = require('./models/eventitem');
exports.User = require('./models/user');

// if database is already connected return
if (!mg.connection || !mg.connection.db) {
	// declare connection options
	var options = { 
		server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
		replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
	};
	// try to connect to db
	mg.connect(ut.getDBConnectionURL(cf.db()), options);
	// declare connection variable
	var db = mg.connection;
	// Add promise support to Mongoose
	require('mongoomise').promisifyAll(db, rs);
	// error event
	db.on('error', function(err) {
	});
	// connection established event
	db.once('open', function() {
	});
}

/** function all
 */
exports.all = function(model, options) {
	// use parameter or create empty object
    options || (options = {});
	var q = model.find(options.query || {});
	if (options.sort) {
		q.sort(options.sort); 
	}
	if (options.limit) {
		q.limit(options.limit); 
	}
	return q;
};

/** function findOrCreate
 * use an empty callback function as a fourth parameter
 */
exports.findOrCreate = function(model, item, debug) {
    return exports.updateOrCreate(model, item, item, debug); 
};

/** function updateOrCreate
 */
exports.updateOrCreate = function(model, item, update, debug) {
	// upsert: bool - creates the object if it doesn't exist. Defaults to false.
	var q = model.findOneAndUpdate(item, update, {upsert: true, 'new': true});
	if (debug) console.log(q);
    return q;
};