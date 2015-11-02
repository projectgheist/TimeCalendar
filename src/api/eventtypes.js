/** Module dependencies
 */
var ap = require('../../app'),
	db = require('../storage');

/** Event route */
var route = ap.route(/\/api\/0\/eventtypes\/?/);
route
	.get(function * (next) {
		var self = this;
		yield db
			.all(db.EventType,{})
			.then(function(types) {
				self.body = types;
				self.status = 200;
			});
		yield next;
	})
	.post(function * (next) {
		console.log(this.request.query)
		var self = this,
			params = this.request.query;
		yield db
			.findOrCreate(db.EventType, params)
			.then(function(type) {
				self.body = 'OK';
				self.status = 200;
			});
		yield next;
	})
	/*
	.del(function * (next) {
		console.log(this.request.query)
		var self = this;
		yield next;
	});
	*/