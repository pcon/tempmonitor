/*jslint browser: true, regexp: true */
/*global require, process, console */

var express = require('express');
var fs = require('fs');
var swig = require('swig');

var api = require('./lib/api.js');

var TempMonitor = function () {
	'use strict';
	var self = this;

	self.setupVariables = function () {
		self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
		self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

		if (typeof self.ipaddress === "undefined") {
			console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
			self.ipaddress = "127.0.0.1";
		}
	};

	self.populateCache = function () {
		if (typeof self.zcache === "undefined") {
			self.zcache = { 'index.html': '' };
		}

		self.zcache['index.html'] = fs.readFileSync('html/index.html');
	};

	self.cache_get = function (key) {
		return self.zcache[key];
	};

	self.terminator = function (sig) {
		if (typeof sig === "string") {
			console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
			process.exit(1);
		}

		console.log('%s: Node server stopped.', Date(Date.now()));
	};

	self.setupTerminationHandlers = function () {
		process.on('exit', function () {
			self.terminator();
		});

		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach(function (element, index, array) {
			process.on(element, function () {
				self.terminator(element);
			});
		});
	};

	self.createRoutes = function () {
		self.routes = { };

		self.routes['/api/latest'] = api.latest;
		self.routes['/api/temps'] = api.temps;

		self.routes['/status'] = function (req, res) {
			var output, data;

			api.latestData()
				.then(function (data) {
					res.setHeader('Content-Type', 'text/html');
					output = swig.renderFile('html/status.html', data);
					res.send(output);
				});
		};

		self.routes['/'] = function (req, res) {
			res.setHeader('Content-Type', 'text/html');
			res.send(self.cache_get('index.html'));
		};
	};

	self.initializeServer = function () {
		var r;

		self.createRoutes();
		self.app = express();

		for (r in self.routes) {
			if (self.routes.hasOwnProperty(r)) {
				self.app.get(r, self.routes[r]);
			}
		}
	};

	self.initialize = function () {
		self.setupVariables();
		self.populateCache();
		self.setupTerminationHandlers();

		self.initializeServer();
	};

	self.start = function () {
		self.app.listen(self.port, self.ipaddress, function () {
			console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddress, self.port);
		});
	};
};

var zapp = new TempMonitor();
zapp.initialize();
zapp.start();