/**
 * SunCalc wrapper for sun position/path calculations.
 */

import SunCalc from 'suncalc';
import type { SunPosition } from '$lib/types';

/** Convert radians to degrees. */
function toDeg(rad: number): number {
	return (rad * 180) / Math.PI;
}

/** Normalize an angle to the 0-360 range. */
function normalizeDeg(deg: number): number {
	return ((deg % 360) + 360) % 360;
}

/** Format a Date as "HH:MM". */
function formatTime(date: Date): string {
	const h = date.getHours().toString().padStart(2, '0');
	const m = date.getMinutes().toString().padStart(2, '0');
	return `${h}:${m}`;
}

/** Calculate hours of daylight between sunrise and sunset. */
function daylengthHours(sunrise: Date, sunset: Date): number {
	return (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
}

/** Build a SunPosition for a given date and location. */
function computePosition(date: Date, lat: number, lng: number): SunPosition {
	const times = SunCalc.getTimes(date, lat, lng);
	const noon = times.solarNoon;

	// Get the sun's position at solar noon (highest point of the day).
	const pos = SunCalc.getPosition(noon, lat, lng);

	// SunCalc azimuth: radians from south, clockwise.
	// Convert to compass bearing: degrees from north, clockwise.
	const azimuth = normalizeDeg(toDeg(pos.azimuth) + 180);
	const altitude = toDeg(pos.altitude);

	const sunrise = times.sunrise;
	const sunset = times.sunset;

	return {
		altitude,
		azimuth,
		sunrise: formatTime(sunrise),
		sunset: formatTime(sunset),
		daylength: daylengthHours(sunrise, sunset)
	};
}

export function computeSunPath(
	lat: number,
	lng: number
): {
	summerSolstice: SunPosition;
	winterSolstice: SunPosition;
	equinox: SunPosition;
	daylength: { longest: number; shortest: number };
} {
	const year = 2026;
	const isNorthern = lat >= 0;

	// Key astronomical dates for the year.
	const juneSolstice = new Date(year, 5, 21, 12, 0, 0); // June 21
	const decemberSolstice = new Date(year, 11, 21, 12, 0, 0); // December 21
	const marchEquinox = new Date(year, 2, 20, 12, 0, 0); // March 20

	const summerDate = isNorthern ? juneSolstice : decemberSolstice;
	const winterDate = isNorthern ? decemberSolstice : juneSolstice;

	const summerSolstice = computePosition(summerDate, lat, lng);
	const winterSolstice = computePosition(winterDate, lat, lng);
	const equinox = computePosition(marchEquinox, lat, lng);

	return {
		summerSolstice,
		winterSolstice,
		equinox,
		daylength: {
			longest: summerSolstice.daylength,
			shortest: winterSolstice.daylength
		}
	};
}
