/** Initialize
 */
var ap = require('./src/app'); 

/** GET / POST Pages
 */
var pp = require('./src/auth'),
	gs = require('passport-google-oauth').OAuth2Strategy,
	cf = require('./config');
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

/** GET / POST Pages
 */
require('./src/routes');

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at '/auth/google/callback'
ap
	.route('/auth/google')
	.get(
		pp.authenticate(
			'google', 
			{ 
				scope: 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email' 
			})
	);

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
ap
	.route('/auth/google/callback')
	.get(
		pp.authenticate(
			'google', 
			{ 
				successRedirect: '/',
				failureRedirect: '/' 
			})
	);

/** Include routes
 */
require('./src/api/events');
require('./src/api/eventtypes');