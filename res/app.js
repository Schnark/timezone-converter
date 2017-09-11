/*global moment*/
(function () {
"use strict";
var dom = {}, shouldUpdateInput = true;

function getStoredZone () {
	try {
		return localStorage.getItem('timezone-converter-storage');
	} catch (e) {
	}
}

function setStoredZone () {
	try {
		return localStorage.setItem('timezone-converter-storage', dom.timeZone.value);
	} catch (e) {
	}
}

function fixLocal (lang, zone) {
	var tranlations = {
		'de|Europe/Paris': 'Europe/Berlin',
		'de-AT|Europe/Paris': 'Europe/Vienna'
	};
	return tranlations[lang + '|' + zone] ||
		tranlations[lang.replace(/-.*/, '') + '|' + zone] ||
		zone;
}

function getLocalZone () {
	return fixLocal(navigator.language || '', moment.tz.guess());
}

function fillTimezoneSelect (select, item) {
	var selectedItem = item || getLocalZone();
	select.innerHTML = moment.tz.names().map(function (tz) {
		return '<option' + (tz === selectedItem ? ' selected' : '') + '>' + tz + '</option>';
	}).join('');
}

function getInputTime () {
	if (dom.currentTime.checked) {
		return moment();
	}
	return moment.tz(dom.specificTimeDate.value + ' ' + dom.specificTimeTime.value, dom.specificTimeZone.value);
}

function formatTime (mom, tz) {
	return mom.clone().tz(tz).format('H:mm z [<small>](Z, YYYY-MM-DD)[</small>]');
}

function onTypeChange () {
	var disabled = dom.currentTime.checked, current;
	dom.specificTimeDate.disabled = disabled;
	dom.specificTimeTime.disabled = disabled;
	dom.specificTimeZone.disabled = disabled;
	if (!disabled && shouldUpdateInput) {
		current = moment();
		dom.specificTimeDate.value = current.format('YYYY-MM-DD');
		dom.specificTimeTime.value = current.format('H:mm');
	}
}

function updateOutput () {
	var mom = getInputTime();
	if (!mom.isValid()) {
		return;
	}
	dom.outputUtc.innerHTML = formatTime(mom, 'UTC');
	dom.outputLocal.innerHTML = formatTime(mom, getLocalZone());
	dom.outputZone.innerHTML = formatTime(mom, dom.timeZone.value);
}

function bind (elements, events, handler) {
	elements.forEach(function (element) {
		events.forEach(function (event) {
			element.addEventListener(event, handler);
		});
	});
}

function init () {
	dom.currentTime = document.getElementById('current-time');
	dom.specificTime = document.getElementById('specific-time');
	dom.specificTimeDate = document.getElementById('specific-time-date');
	dom.specificTimeTime = document.getElementById('specific-time-time');
	dom.specificTimeZone = document.getElementById('specific-time-zone');
	dom.localName = document.getElementById('local-name');
	dom.timeZone = document.getElementById('time-zone');
	dom.outputUtc = document.getElementById('output-utc');
	dom.outputLocal = document.getElementById('output-local');
	dom.outputZone = document.getElementById('output-zone');

	fillTimezoneSelect(dom.specificTimeZone);
	fillTimezoneSelect(dom.timeZone, getStoredZone());
	onTypeChange();

	bind(
		[dom.currentTime, dom.specificTime],
		['change'],
		function () {
			onTypeChange();
			updateOutput();
		}
	);
	bind(
		[dom.specificTimeDate, dom.specificTimeTime, dom.specificTimeZone],
		['change', 'input'],
		function () {
			shouldUpdateInput = false;
			updateOutput();
		}
	);
	bind(
		[dom.timeZone],
		['change'],
		function () {
			setStoredZone();
			updateOutput();
		}
	);
	//even with static time, output can change, when DST starts or ends
	setInterval(updateOutput, 5000);
	updateOutput();
	dom.localName.innerHTML = getLocalZone();
}

init();

})();