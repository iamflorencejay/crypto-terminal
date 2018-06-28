'use strict';

var _ = require('underscore');
var puppeteer = require('puppeteer');

var gruntConfig = {
	connect: require('../grunt/connect'),
};

var manager = module.exports = {

	browser: null,
	page: null,

	prepareBrowser: function(options, done) {

		if (_.isFunction(options)) {
			done = options;
			options = null;
		}

		options = _.defaults({}, options || {}, {
			headless: false,
			slowMo: 0,
			timeout: 10000
		});

		puppeteer.launch(options).then(function(browser) {
			manager.browser = browser;
			done(null, browser);
		}).catch(done);
	},

	navigate: function(uri, done) {

		if (!manager.page) {
			return done(new Error('Must load a page before navigating.'));
		}

		var host = gruntConfig.connect.test.options.hostname;
		var port = gruntConfig.connect.test.options.port;
		var baseUrl = 'http://' + host + ':' + port;
		var pageUrl = baseUrl + uri;
		manager.page.goto(pageUrl).then(function() {
			done();
		}).catch(done);
	},

	preparePage: function(done) {

		if (!manager.browser) {
			return done(new Error('Must prepare browser before opening a page.'));
		}

		manager.browser.newPage().then(function(newPage) {
			manager.page = newPage;
			done(null, newPage);
		}).catch(done);
	},

	evaluateInPageContext: function(fn, done) {

		manager.page.evaluate(fn).then(function() {
			done();
		}).catch(done);
	},

	onAppLoaded: function(done) {

		done = _.once(done);
		manager.navigate('/', function(error) {
			if (error) return done(error);
			manager.page.waitFor('html.loaded').then(function() {
				done();
			}).catch(done);
		});
	},

	getPageLocationHash: function() {

		if (!manager.page) {
			throw new Error('No page is loaded.');
		}

		var pageUrl = manager.page.url();
		var parts = pageUrl.indexOf('#') !== -1 ? pageUrl.split('#') : [];
		return parts[1] || '';
	},
};

before(function(done) {
	manager.prepareBrowser(done);
});

after(function(done) {
	if (!manager.page) return done();
	manager.page.close().then(function() {
		done();
	}).catch(done);
});

after(function(done) {
	if (!manager.browser) return done();
	manager.browser.close().then(function() {
		done();
	}).catch(done);
});
