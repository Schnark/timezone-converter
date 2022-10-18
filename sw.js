/*global caches, fetch, Promise */
(function (worker) {
"use strict";

var PREFIX = 'timezone-converter',
	VERSION = '1.15',
	FILES = [
		'index.html',
		'res/app.css',
		'res/app.js',
		'res/tzmap.svg',
		'res/lib/moment.min.js',
		'res/lib/moment-timezone-with-data-10-year-range.min.js',
		'res/lib/panzoom.min.js'
	];

worker.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(PREFIX + ':' + VERSION).then(function (cache) {
			return cache.addAll(FILES);
		})
	);
});

worker.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
				if (key.indexOf(PREFIX + ':') === 0 && key !== PREFIX + ':' + VERSION) {
					return caches.delete(key);
				}
			}));
		})
	);
});

worker.addEventListener('fetch', function (e) {
	e.respondWith(caches.match(e.request, {ignoreSearch: true})
		.then(function (response) {
			return response || fetch(e.request);
		})
	);
});

})(this);