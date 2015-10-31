/** Module dependencies
 */
var ko = require('koa'),
	cf = require('./config'),
	pp = require('passport'),
	kj = require('koa-jade'),
	ap = ko();

/** turn off console.log
 */
if (ap.env !== 'development') {
	console.log = function() {};
}

/** Enables Jade templating
 */
ap.use(new kj({
	// where Jade templates be stored
	viewPath: './views',
	// identify paths when using extends
	basedir: './views',
	// variables that will be passed to Jade templates
	locals: {},
	// make sure that templates aren't cached in development mode
	noCache: (ap.env === 'development')
}).middleware);

/** Enables the exposure of static Javascript, font and CSS files
 */
ap.use(require('koa-static')('./public', {}));

/** Start the server on a specific port
 */
ap.listen(cf.Port());

ap.use(function* () {
  this.render('index', {}, true);
});

/** startup/connect to database
 */
require('./src/storage').setup();

/** GET / POST Pages
 */
//ap.use(require('./src/auth')); 
//ap.use(require('./src/routes')); 

/** Include routes
 */
//ap.use(require('./src/api/events'));