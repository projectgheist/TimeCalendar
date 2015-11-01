/** Module dependencies
 */
var ap = require('../app'),
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
			return db
				.findOrCreate(db.User, {openID: profile.id})
				.then(function(user) {
					// store retrieved info
					user.provider 	= profile.provider;
					user.email		= profile.emails[0].value;
					user.name		= profile.displayName;
					// store in db
					user.save().then(function() {
						return done(null, user);
					});
				}, function(err) {
					return done(err);
				});
		});
	}
));

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at '/auth/google/callback'
ap
	.route('/auth/google')
	.get(function * () { 
		pp.authenticate(
			'google', 
			{ 
				scope: 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email' 
			});
	});

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
ap
	.route('/auth/google/callback')
	.get(function * () { 
		pp.authenticate(
			'google', 
			{ 
				successRedirect: '/dashboard',
				failureRedirect: '/' 
			});
	});

/** Export as module */
module.exports = pp;