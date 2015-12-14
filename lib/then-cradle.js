/*jslint browser: true, regexp: true */
/*global require, module */

var Q = require('q');

module.exports = {
	view: function (db, view_name, opts) {
		'use strict';
		var deferred = Q.defer();

		db.view(view_name, opts, function (error, doc) {
			if (error) {
				deferred.reject(new Error(error));
			} else {
				deferred.resolve(doc);
			}
		});

		return deferred.promise;
	},
	get: function (db, doc_name) {
		'use strict';
		var deferred = Q.defer();

		db.get(doc_name, function (error, doc) {
			if (error) {
				deferred.reject(new Error(error));
			} else {
				deferred.resolve(doc);
			}
		});

		return deferred.promise;
	},
	merge: function (db, doc_name, data) {
		'use strict';
		var deferred = Q.defer();

		db.merge(doc_name, data, function (error, res) {
			if (error) {
				deferred.reject(new Error(error));
			} else {
				deferred.resolve(res);
			}
		});

		return deferred.promise;
	},
	save: function (db, data) {
		'use strict';
		var deferred = Q.defer();

		db.save(data, function (error, res) {
			if (error) {
				deferred.reject(new Error(error));
			} else {
				deferred.resolve(res);
			}
		});

		return deferred.promise;
	},
	remove: function (db, doc_name, doc_rev) {
		'use strict';
		var deferred = Q.defer();

		db.remove(doc_name, doc_rev, function (error, res) {
			if (error) {
				deferred.reject(new Error(error));
			} else {
				deferred.resolve(res);
			}
		});

		return deferred.promise;
	}
};