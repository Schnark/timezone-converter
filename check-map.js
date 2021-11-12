/*global moment*/
(function () {
"use strict";

var logElement = document.getElementById('log');

function warn (html) {
	logElement.innerHTML += '<li>' + html + '</li>';
}

function loadMap (callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'res/tzmap.svg', true);
	xhr.onload = function () {
		callback(xhr.responseXML);
	};
	xhr.send();
}

function getOffset (d) {
	var s = '', h, m;
	if (d === 0) {
		return '';
	}
	if (d < 0) {
		s = '-';
		d = -d;
	}
	h = Math.floor(d / 60);
	m = d % 60;
	if (m === 0) {
		return s + h;
	}
	return s + h + '_' + m;
}

function getClass (zone) {
	var d1, d2, y = (new Date()).getFullYear() + 2;
	d1 = zone.utcOffset(new Date(y + '-01-01'));
	d2 = zone.utcOffset(new Date(y + '-06-01'));
	return 'gmt' + getOffset(Math.max(d1, d2)) + (d1 !== d2 ? ' dst' : '');
}

function isDeprecated (zone) { //that's not an exact definition of deprecated, but a good approximation
	var notDeprecated = [
		'Etc/UTC',
		'Etc/GMT+12',
		'Etc/GMT+11',
		'Etc/GMT+10',
		'Etc/GMT+9',
		'Etc/GMT+8',
		'Etc/GMT+7',
		'Etc/GMT+6',
		'Etc/GMT+5',
		'Etc/GMT+4',
		'Etc/GMT+3',
		'Etc/GMT+2',
		'Etc/GMT+1',
		'Etc/GMT',
		'Etc/GMT-1',
		'Etc/GMT-2',
		'Etc/GMT-3',
		'Etc/GMT-4',
		'Etc/GMT-5',
		'Etc/GMT-6',
		'Etc/GMT-7',
		'Etc/GMT-8',
		'Etc/GMT-9',
		'Etc/GMT-10',
		'Etc/GMT-11',
		'Etc/GMT-12',
		'Etc/GMT-13',
		'Etc/GMT-14'
	];
	return notDeprecated.indexOf(zone.name) === -1 && zone.countries().length === 0;
}

function checkZone (zoneName, cls) {
	var zone = moment.tz.zone(zoneName), clsExpected;
	if (!zone) {
		warn('<code>' + zoneName + '</code> does not exist!');
		return;
	}
	clsExpected = getClass(zone);
	if (clsExpected !== cls) {
		warn('Class for <code>' + zoneName + '</code> is <code>"' + cls + '"</code> ' +
			'instead of expected <code>"' + clsExpected + '"</code>!');
	}
	if (isDeprecated(zone)) {
		warn('<code>' + zoneName + '</code> is deprecated!');
	}
}

function isSameZone (name1, name2) {
	var zone1 = moment.tz.zone(name1), zone2 = moment.tz.zone(name2);
	return zone1.countries().join('|') === zone2.countries().join('|') &&
		zone1.untils.join('|') === zone2.untils.join('|') &&
		zone1.offsets.join('|') === zone2.offsets.join('|');
}

function checkMissingZones (usedZones) {
	var omitted = [
		//too small
		'Africa/Ceuta',
		'America/Anguilla',
		'America/Antigua',
		'America/Aruba',
		'America/Cayman',
		'America/Curacao',
		'America/Grand_Turk',
		'America/Kralendijk',
		'America/Lower_Princes',
		'America/Marigot',
		'America/Miquelon',
		'America/Montserrat',
		'America/Noronha',
		'America/St_Barthelemy',
		'America/St_Kitts',
		'America/St_Thomas',
		'America/Tortola',
		'Arctic/Longyearbyen',
		'Asia/Bahrain',
		'Asia/Hong_Kong',
		'Asia/Macau',
		'Asia/Singapore',
		'Atlantic/Bermuda',
		'Atlantic/Faroe',
		'Atlantic/South_Georgia',
		'Atlantic/St_Helena',
		'Australia/Lord_Howe',
		'Europe/Andorra',
		'Europe/Busingen',
		'Europe/Gibraltar',
		'Europe/Guernsey',
		'Europe/Isle_of_Man',
		'Europe/Jersey',
		'Europe/Luxembourg',
		'Europe/Mariehamn',
		'Europe/Monaco',
		'Europe/San_Marino',
		'Europe/Vaduz',
		'Europe/Vatican',
		'Indian/Chagos',
		'Indian/Christmas',
		'Indian/Cocos',
		'Pacific/Apia',
		'Pacific/Chatham',
		'Pacific/Chuuk',
		'Pacific/Easter',
		'Pacific/Enderbury',
		'Pacific/Fakaofo',
		'Pacific/Fiji', //actually large enough, but too far east
		'Pacific/Funafuti',
		'Pacific/Gambier',
		'Pacific/Guam',
		'Pacific/Kiritimati',
		'Pacific/Kosrae',
		'Pacific/Kwajalein',
		'Pacific/Majuro',
		'Pacific/Marquesas',
		'Pacific/Midway',
		'Pacific/Nauru',
		'Pacific/Niue',
		'Pacific/Norfolk',
		'Pacific/Pago_Pago',
		'Pacific/Palau',
		'Pacific/Pitcairn',
		'Pacific/Pohnpei',
		'Pacific/Rarotonga',
		'Pacific/Saipan',
		'Pacific/Tahiti',
		'Pacific/Tarawa',
		'Pacific/Tongatapu',
		'Pacific/Wake',
		'Pacific/Wallis',
		//Antarctica
		'Antarctica/Casey',
		'Antarctica/Davis',
		'Antarctica/DumontDUrville',
		'Antarctica/Macquarie',
		'Antarctica/Mawson',
		'Antarctica/McMurdo',
		'Antarctica/Palmer',
		'Antarctica/Rothera',
		'Antarctica/Syowa',
		'Antarctica/Troll',
		'Antarctica/Vostok',
		//Zone changes for some regions (too lazy to split the map, most areas are small, anyway)
		//some changed several times, only last change is noted
		//move them to "links" as soon as they fall out of the 10 year range
		//Russia 2011
		'Asia/Novokuznetsk', //Asia/Novosibirsk
		//Russia 2014
		'Asia/Khandyga', //Asia/Chita
		'Asia/Krasnoyarsk', //Asia/Novosibirsk
		'Asia/Srednekolymsk', //Asia/Magadan
		'Asia/Yakutsk', //Asia/Chita
		'Europe/Kirov', //Europe/Moscow
		//Russia 2016
		'Asia/Barnaul', //Asia/Novosibirsk
		'Asia/Sakhalin', //Asia/Magadan
		'Asia/Tomsk', //Asia/Novosibirsk
		'Europe/Astrakhan', //Europe/Samara
		'Europe/Saratov', //Europe/Samara
		'Europe/Ulyanovsk', //Europe/Samara
		//Kazakhstan 2018
		'Asia/Qyzylorda', //Asia/Aqtobe
		//United States 2019
		'America/Metlakatla', //America/Anchorage
		//other
		'Asia/Urumqi' //used together with Asia/Shanghai
	], links = {
		'America/Araguaina': 'America/Fortaleza',
		'America/Argentina/Catamarca': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Cordoba': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Jujuy': 'America/Argentina/Buenos_Aires',
		'America/Argentina/La_Rioja': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Mendoza': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Rio_Gallegos': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Salta': 'America/Argentina/Buenos_Aires',
		'America/Argentina/San_Juan': 'America/Argentina/Buenos_Aires',
		'America/Argentina/San_Luis': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Tucuman': 'America/Argentina/Buenos_Aires',
		'America/Argentina/Ushuaia': 'America/Argentina/Buenos_Aires',
		'America/Bahia': 'America/Fortaleza',
		'America/Bahia_Banderas': 'America/Mexico_City',
		'America/Belem': 'America/Fortaleza',
		'America/Boa_Vista': 'America/Manaus',
		'America/Boise': 'America/Denver',
		'America/Cambridge_Bay': 'America/Edmonton',
		'America/Creston': 'America/Fort_Nelson',
		'America/Cuiaba': 'America/Campo_Grande',
		'America/Dawson': 'America/Whitehorse',
		'America/Dawson_Creek': 'America/Fort_Nelson',
		'America/Detroit': 'America/New_York',
		'America/Eirunepe': 'America/Rio_Branco',
		'America/Glace_Bay': 'America/Halifax',
		'America/Goose_Bay': 'America/Halifax',
		'America/Indiana/Indianapolis': 'America/New_York',
		'America/Indiana/Knox': 'America/Chicago',
		'America/Indiana/Marengo': 'America/New_York',
		'America/Indiana/Petersburg': 'America/New_York',
		'America/Indiana/Tell_City': 'America/Chicago',
		'America/Indiana/Vevay': 'America/New_York',
		'America/Indiana/Vincennes': 'America/New_York',
		'America/Indiana/Winamac': 'America/New_York',
		'America/Inuvik': 'America/Edmonton',
		'America/Iqaluit': 'America/Toronto',
		'America/Juneau': 'America/Anchorage',
		'America/Kentucky/Louisville': 'America/New_York',
		'America/Kentucky/Monticello': 'America/New_York',
		'America/Maceio': 'America/Fortaleza',
		'America/Mazatlan': 'America/Chihuahua',
		'America/Menominee': 'America/Chicago',
		'America/Merida': 'America/Mexico_City',
		'America/Moncton': 'America/Halifax',
		'America/Monterrey': 'America/Mexico_City',
		'America/Nipigon': 'America/Toronto',
		'America/Nome': 'America/Anchorage',
		'America/North_Dakota/Beulah': 'America/Chicago',
		'America/North_Dakota/Center': 'America/Chicago',
		'America/North_Dakota/New_Salem': 'America/Chicago',
		'America/Pangnirtung': 'America/Toronto',
		'America/Porto_Velho': 'America/Manaus',
		'America/Rainy_River': 'America/Winnipeg',
		'America/Rankin_Inlet': 'America/Winnipeg',
		'America/Recife': 'America/Fortaleza',
		'America/Resolute': 'America/Winnipeg',
		'America/Santarem': 'America/Fortaleza',
		'America/Sitka': 'America/Anchorage',
		'America/Swift_Current': 'America/Regina',
		'America/Thunder_Bay': 'America/Toronto',
		'America/Yakutat': 'America/Anchorage',
		'America/Yellowknife': 'America/Edmonton',
		'Asia/Anadyr': 'Asia/Kamchatka',
		'Asia/Aqtau': 'Asia/Aqtobe',
		'Asia/Atyrau': 'Asia/Aqtobe',
		'Asia/Choibalsan': 'Asia/Ulaanbaatar',
		'Asia/Hebron': 'Asia/Gaza',
		'Asia/Kuching': 'Asia/Kuala_Lumpur',
		'Asia/Oral': 'Asia/Aqtobe',
		'Asia/Pontianak': 'Asia/Jakarta',
		'Asia/Qostanay': 'Asia/Almaty',
		'Asia/Samarkand': 'Asia/Tashkent',
		'Asia/Ust-Nera': 'Asia/Vladivostok',
		'Australia/Broken_Hill': 'Australia/Adelaide',
		'Australia/Hobart': 'Australia/Sydney',
		'Australia/Lindeman': 'Australia/Brisbane',
		'Australia/Melbourne': 'Australia/Sydney',
		'Europe/Uzhgorod': 'Europe/Kiev',
		'Europe/Zaporozhye': 'Europe/Kiev'
	};
	moment.tz.names().filter(function (name) {
		return !usedZones[name];
	}).filter(function (name) {
		return omitted.indexOf(name) === -1 && !links[name] && !isDeprecated(moment.tz.zone(name));
	}).forEach(function (name) {
		warn('<code>' + name + '</code> is not used in the map!');
	});
	omitted.filter(function (name) {
		return isDeprecated(moment.tz.zone(name));
	}).forEach(function (name) {
		warn('<code>' + name + '</code> is listed as omitted though it is deprecated!');
	});
	Object.keys(links).forEach(function (name) {
		if (!usedZones[links[name]]) {
			warn('<code>' + links[name] + '</code> ' +
				'(used as substitute for <code>' + name + '</code>) is not used in the map!');
		}
		if (!isSameZone(name, links[name])) {
			warn('<code>' + name + '</code> and <code>' + links[name] + '</code> differ!');
		}
		if (isDeprecated(moment.tz.zone(name))) {
			warn('<code>' + name + '</code> has a link entry though it is deprecated!');
		}
	});
}

function checkClasses (usedClasses, style) {
	var definedClasses = [], re = /\s\.(gmt[^ {]*)/g, result;
	while ((result = re.exec(style))) {
		definedClasses.push(result[1].replace('.', ' '));
	}
	usedClasses.forEach(function (cls) {
		if (definedClasses.indexOf(cls) === -1) {
			warn('Undefined class <code>' + cls + '</code>!');
		}
	});
	definedClasses.forEach(function (cls) {
		if (usedClasses.indexOf(cls) === -1) {
			warn('Unused class <code>' + cls + '</code>!');
		}
	});
}

function checkMap (xml) {
	var ids = xml.querySelectorAll('path'), i, zone, cls, usedZones = {}, usedClasses = {};
	for (i = 0; i < ids.length; i++) {
		zone = ids[i].id;
		cls = ids[i].getAttribute('class');
		checkZone(zone, cls);
		usedZones[zone] = true;
		usedClasses[cls] = true;
	}
	checkMissingZones(usedZones);
	checkClasses(Object.keys(usedClasses), xml.getElementsByTagName('style')[0].textContent);
	if (isSameZone('America/Whitehorse', 'America/Fort_Nelson')) {
		warn('Merge <code>America/Whitehorse</code> and <code>America/Fort_Nelson</code>!');
	}
	if (isSameZone('America/Manaus', 'America/Campo_Grande')) {
		warn('Merge <code>America/Manaus</code> and <code>America/Campo_Grande</code>!');
	}
	if (isSameZone('America/Fortaleza', 'America/Sao_Paulo')) {
		warn('Merge <code>America/Fortaleza</code> and <code>America/Sao_Paulo</code>!');
	}
	if (isSameZone('America/Mexico_City', 'America/Matamoros')) {
		warn('Merge <code>America/Mexico_City</code> and <code>America/Matamoros</code>!');
	}
	if (isSameZone('America/Chihuahua', 'America/Ojinaga')) {
		warn('Merge <code>America/Chihuahua</code> and <code>America/Ojinaga</code>!');
	}
	if (isSameZone('Europe/Volgograd', 'Europe/Moscow')) {
		warn('Merge <code>Europe/Volgograd</code> and <code>Europe/Moscow</code>!');
	}
	warn('Version: ' + moment.tz.version + '-' + moment.tz.dataVersion);
}

loadMap(checkMap);

})();