/*
 * Copyright (c) 2015 Jonathan Perkin <jonathan@perkin.org.uk>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var binding = require('../build/Release/rpio');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function rpio()
{
	EventEmitter.call(this);
}
util.inherits(rpio, EventEmitter);

/*
 * Set up GPIO layout based on board revision.
 */
var layout = "none";
function setup_board()
{
	var cpuinfo, boardrev, match;

	cpuinfo = fs.readFileSync('/proc/cpuinfo', 'ascii', function(err) {
		if (err)
			throw err;
	});

	cpuinfo.toString().split(/\n/).forEach(function (line) {
		match = line.match(/^Revision.*(.{4})/);
		if (match) {
			boardrev = parseInt(match[1], 16);
			return;
		}
	});

	switch (boardrev) {
	case 2:
	case 3:
		layout = "v1";
		break;
	case 4:
	case 5:
	case 6:
	case 7:
	case 8:
	case 9:
	case 13:
	case 14:
	case 15:
		layout = "v2";
		break;
	case 16:
	case 4161:
		layout = "bplus";
		break;
	default:
		throw "Unable to determine board revision and layout";
		break;
	}
}

/*
 * Map RPi to BCM numbering
 */
var pinmap = {
	'v1': [
		null,	/* 3.3V */
		null,	/* 5V */
		0,
		null,	/* 5V */
		1,
		null,	/* GND */
		4,
		14,
		null,	/* GND */
		15,
		17,
		18,
		21,
		null,	/* GND */
		22,
		23,
		null,	/* 3.3V */
		24,
		10,
		null,	/* GND */
		9,
		25,
		11,
		8,
		null,	/* GND */
		7
	],
	'v2': [
		null,	/* 3.3V */
		null,	/* 5V */
		2,
		null,	/* 5V */
		3,
		null,	/* GND */
		4,
		14,
		null,	/* GND */
		15,
		17,
		18,
		27,
		null,	/* GND */
		22,
		23,
		null,	/* 3.3V */
		24,
		10,
		null,	/* GND */
		9,
		25,
		11,
		8,
		null,	/* GND */
		7
	],
	'bplus': [
		null,	/* 3.3V */
		null,	/* 5V */
		2,
		null,	/* 5V */
		3,
		null,	/* GND */
		4,
		14,
		null,	/* GND */
		15,
		17,
		18,
		27,
		null,	/* GND */
		22,
		23,
		null,	/* 3.3V */
		24,
		10,
		null,	/* GND */
		9,
		25,
		11,
		8,
		null,	/* GND */
		7,
		null,	/* DNC */
		null,	/* DNC */
		5,
		null,	/* GND */
		6,
		12,
		13,
		null,	/* GND */
		19,
		16,
		26,
		20,
		null,	/* GND */
		21
	],
	'none': []
}

function getPin(pin)
{
	pin--;

	if (!pinmap[layout][pin])
		throw "Invalid pin";

	return pinmap[layout][pin];
}

binding.init();
setup_board();

rpio.prototype.setInput = function(pin, cb)
{
	if (binding.pin_function(getPin(pin), 0) !== 0)
		throw "Unable to configure pin for input";

	if (cb)
		return cb();
}

rpio.prototype.setOutput = function(pin, cb)
{
	if (binding.pin_function(getPin(pin), 1) !== 0)
		throw "Unable to configure pin for output";

	if (cb)
		return cb();
}

rpio.prototype.read = function(pin)
{
	return binding.pin_read(getPin(pin));
}

rpio.prototype.write = function(pin, value)
{
	binding.pin_write(getPin(pin), parseInt(value));
}

rpio.prototype.LOW = 0x0;
rpio.prototype.HIGH = 0x1;

module.exports = new rpio;