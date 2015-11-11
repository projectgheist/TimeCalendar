/** Module dependencies
 */
var cf = require('../config'),
	kj = require('koa-jade'),
	ap = require('koa')();

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

/** Export
 */
module.exports = ap;