/** Application port
 */
module.exports.Port = function () {
	return process.env.OPENSHIFT_NODEJS_PORT || // Openshift
		process.env.VCAP_APP_PORT || // Appfog
		(process.env.PORT || 3000); // Local
};

/** Application ip address
 */
module.exports.IpAddr = function () {
	return process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
};

/** Application dns location/url
 */
module.exports.Url = function () {
	return (process.env.OPENSHIFT_APP_DNS ? ['http://', process.env.OPENSHIFT_APP_DNS].join('') : false) || // Openshift
		process.env.AF_APP_URL || // Appfog
		[exports.IpAddr(), ':', exports.Port()].join(''); // Local
};

/** Mongo DB Credentials
 */
module.exports.db = function (dbName) {
	// default database name
	dbName || (dbName = 'db_timecalendar');
	return {
		hostname: process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost',
		port: process.env.OPENSHIFT_MONGODB_DB_PORT || '27017',
		dbname: process.env.OPENSHIFT_APP_NAME || dbName,
		username: process.env.OPENSHIFT_MONGODB_DB_USERNAME || '',
		password: process.env.OPENSHIFT_MONGODB_DB_PASSWORD || ''
	};
};
