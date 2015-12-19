/*jslint browser: true, regexp: true */
/*global module, console, global, require, process */

var cradle = require('cradle');
var then_cradle = require('./then-cradle.js');
var lo = require('lodash');
var moment = require('moment');
var Q = require('q');

function couchConnect() {
	'use strict';

	var couch_opts = {
		cache: (process.env.COUCHDB_CACHE === undefined) ? false : (process.env.COUCHDB_CACHE === 'true') ? true : false,
		raw: false,
		auth: {
			username: process.env.COUCHDB_USERNAME,
			password: process.env.COUCHDB_PASSWORD
		}
	},
		couch = new (cradle.Connection)(process.env.COUCHDB_HOST, process.env.COUCHDB_PORT, couch_opts),
		db = couch.database(process.env.COUCHDB_DATABASE);

	return db;
}

var latestData = function () {
	'use strict';

	var result,
		db = couchConnect(),
		opts = {
			limit: 1,
			descending: true
		},
		deferred = Q.defer();


	then_cradle.view(db, 'temps/by_date', opts).then(function (data) {
		db = null;
		opts = null;

		result = {
			delay: moment().diff(moment(data[0].value.timestamp), 'minutes'),
			time: data[0].value.timestamp,
			temp: data[0].value.temp
		};

		deferred.resolve(result);

		data = null;
		result = null;
	}).catch(function (e) {
		deferred.reject(e);
	});

	return deferred.promise;
};

module.exports = {
	latest: function (req, res) {
		'use strict';

		res.setHeader('Content-Type', 'application/json');

		latestData()
			.then(function (data) {
				res.send(data);
			})
			.catch(function (e) {
				res.send({error: true, message: e.message});
			});

	},
	latestData: latestData,
	temps: function (req, res) {
		'use strict';

		var start_date, end_date, opts, result,
			db = couchConnect();

		if (req.query.startDate !== undefined) {
			start_date = moment(req.query.startDate, 'YYYY-MM-DD');
		}

		if (start_date === undefined || !start_date.isValid()) {
			start_date = moment().subtract(1, 'week');
		}

		if (req.query.endDate !== undefined) {
			end_date = moment(req.query.endDate, 'YYYY-MM-DD');
		}

		if (end_date === undefined || !end_date.isValid()) {
			end_date = moment();
		}

		opts = {
			startKey: [start_date.format('YYYY-MM-DD'), {}],
			endKey: [end_date.format('YYYY-MM-DD'), {}]
		};

		console.log(opts);

		then_cradle.view(db, 'temps/by_date', opts).then(function (data) {
			start_date = null;
			end_date = null;
			opts = null;
			db = null;

			result = [];
			lo.forEach(data, function (entry) {
				result.push({
					time: entry.value.timestamp,
					temp: entry.value.temp
				});
			});

			res.setHeader('Content-Type', 'application/json');
			res.send(result);

			data = null;
			result = null;
		}).catch(function (e) {
			console.log(e);

			res.setHeader('Content-Type', 'application/json');
			res.send({error: true, message: e.message});
		});
	}
};