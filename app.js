/** Module dependencies
 */
var ko = require('koa'),
	cf = require('./config'),
	kj = require('koa-jade'),
	ap = module.exports = ko();

/** turn off console.log
 */
if (ap.env === 'production') {
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
console.log(['Server running at port ',cf.Port()].join(''));

/** GET / POST Pages
 */
//ap.use(require('./src/auth')); 
require('./src/routes'); 

/** Include routes
 */
require('./src/api/events');
require('./src/api/eventtypes');