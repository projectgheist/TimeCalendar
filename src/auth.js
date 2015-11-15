/** Module dependencies
 */
var ap = require('./app');
var pp = require('koa-passport');

/** Sessions */
ap.keys = ['your-session-secret'];
ap.use(require('koa-session')(ap));

/** Enable body parsing */
ap.use(require('koa-bodyparser')());

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
pp.serializeUser(function (user, done) {
	done(null, user._id);
});

pp.deserializeUser(function (id, done) {
	done(null, id);
});

/** Export as module */
module.exports = pp;
