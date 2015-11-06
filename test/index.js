var as = require('assert'),
	ap = require('koa')(),
	cf = require('../config');

/** Start the server on a specific port
 */
describe('Startup', function() {
	it('Setup server', function (done) {
		ap.listen(cf.Port());
		done();
	});
	
	it('Setup database', function (done) {
		require('../src/storage');
		done();
	});
});

/** Make sure that the utilities code compiles
 */
describe('Utilities', function() {
	it('Check compile', function (done) {
		require('../src/utils');
		done();
	});
});

// start database