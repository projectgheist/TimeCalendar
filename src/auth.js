/** Module dependencies
 */
var ap = require('./app'),
	cf = require('../config'),
	pp = require('koa-passport'),
	db = require('./storage');

/** Sessions */
ap.keys = ['your-session-secret']
ap.use(require('koa-generic-session')());

/** Setup of Passport.js */
ap.use(pp.initialize());
ap.use(pp.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
pp.serializeUser(function(user, done) {
	done(null, user);
});

pp.deserializeUser(function(obj, done) {
	done(null, obj);
});

/** Export as module */
module.exports = pp;