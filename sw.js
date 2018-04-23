/*global caches, fetch, Promise */
(function (worker) {
"use strict";

var VERSION = 'v1.5',
	FILES = [
		'index.html',
		'res/app.css',
		'res/app.js',
		'res/tzmap.svg',
		'res/lib/moment.min.js',
		'res/lib/moment-timezone-with-data-2012-2022.min.js',
		'res/lib/panzoom.min.js'
	];

worker.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(VERSION).then(function (cache) {
			return cache.addAll(FILES);
		})
	);
});

worker.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
				if (key !== VERSION) {
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