/** Module dependencies
 */
var ap = require('./app'),
	cf = require('../config'),
	pp = require('koa-passport'),
	gs = require('passport-google-oauth').OAuth2Strategy,
	db = require('./storage');

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

pp.use(new gs({
		clientID: 		cf.Google().ClientID,
		clientSecret: 	cf.Google().ClientSecret,
		callbackURL: 	cf.Url() + '/auth/google/callback'
	},
	function(token, tokenSecret, profile, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			return db.findOrCreate(db.User, {
				openID: profile.id
			})
			.then(function(user) {
				// store retrieved info
				user.provider 	= profile.provider;
				user.email		= profile.emails[0].value;
				user.name		= profile.displayName;
				// store in db
				return user.save();
			})
			.then(function(user) {
				return done(null, user);
			});
		});
	}
));

/** Export as module */
module.exports = pp;