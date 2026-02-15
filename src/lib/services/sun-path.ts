/**
 * Sun path and shadow computation using SunCalc.
 */

import SunCalc from 'suncalc';

export interface SunArcPoint {
	hour: number;
	azimuth: number; // degrees from north
	altitude: number; // degrees above horizon
	lngLat: [number, number]; // projected position on map
}

/**
 * Compute sun positions throughout the day for a given date and location.
 * Returns an array of { azimuth, altitude, lngLat } for each hour the sun is up.
 */
export function computeSunArc(
	date: Date,
	center: [number, number],
	radiusKm: number = 0.12
): SunArcPoint[] {
	const [lng, lat] = center;
	const points: SunArcPoint[] = [];

	for (let h = 0; h < 24; h++) {
		const d = new Date(date);
		d.setHours(h, 0, 0, 0);
		const pos = SunCalc.getPosition(d, lat, lng);
		const altDeg = (pos.altitude * 180) / Math.PI;
		if (altDeg < 0) continue; // sun below horizon

		// SunCalc azimuth: 0=south, PI=north, positive=west
		// Convert to compass bearing: 0=north, clockwise
		let azDeg = ((pos.azimuth * 180) / Math.PI + 180) % 360;

		const azRad = (azDeg * Math.PI) / 180;
		const projectedLng = lng + (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(azRad);
		const projectedLat = lat + (radiusKm / 110.574) * Math.cos(azRad);

		points.push({
			hour: h,
			azimuth: azDeg,
			altitude: altDeg,
			lngLat: [projectedLng, projectedLat]
		});
	}

	return points;
}

/**
 * Compute shadow direction (opposite of sun azimuth) and length factor
 * for a given date/time and location.
 */
export function computeShadowDirection(
	date: Date,
	center: [number, number]
): { azimuth: number; altitude: number; shadowAzimuth: number; lengthFactor: number } | null {
	const [lng, lat] = center;
	const pos = SunCalc.getPosition(date, lat, lng);
	const altDeg = (pos.altitude * 180) / Math.PI;
	if (altDeg < 0) return null; // sun below horizon

	let azDeg = ((pos.azimuth * 180) / Math.PI + 180) % 360;
	const shadowAz = (azDeg + 180) % 360;
	// Shadow length inversely proportional to sun altitude
	const lengthFactor = altDeg > 0 ? 1 / Math.tan((altDeg * Math.PI) / 180) : 10;

	return {
		azimuth: azDeg,
		altitude: altDeg,
		shadowAzimuth: shadowAz,
		lengthFactor: Math.min(lengthFactor, 10) // cap length
	};
}
