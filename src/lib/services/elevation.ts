/**
 * Elevation data via Open-Meteo Elevation API.
 * Samples 5 points (center + 4 cardinal directions) to derive
 * min/max elevation, slope, and aspect.
 */

export async function fetchElevation(
	lat: number,
	lng: number
): Promise<{
	min: number;
	max: number;
	slope: number;
	aspect: number;
}> {
	// ~50 meters in degrees of latitude
	const dLat = 0.00045;
	// ~50 meters in degrees of longitude, adjusted for latitude
	const dLng = 0.00045 / Math.cos((lat * Math.PI) / 180);

	// 5 sample points: center, north, south, east, west
	const points = [
		{ lat, lng }, // center
		{ lat: lat + dLat, lng }, // north
		{ lat: lat - dLat, lng }, // south
		{ lat, lng: lng + dLng }, // east
		{ lat, lng: lng - dLng } // west
	];

	const latitudes = points.map((p) => p.lat.toFixed(6)).join(',');
	const longitudes = points.map((p) => p.lng.toFixed(6)).join(',');

	const url = `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);

	try {
		const response = await fetch(url, { signal: controller.signal });

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data: { elevation: number[] } = await response.json();

		if (!data.elevation || data.elevation.length < 5) {
			throw new Error('Incomplete elevation data');
		}

		const [center, north, south, east, west] = data.elevation;

		const min = Math.min(center, north, south, east, west);
		const max = Math.max(center, north, south, east, west);

		// Elevation gradients between opposite cardinal points
		// Distance between opposite points is ~100m (2 * 50m)
		const run = 100; // meters
		const nsRise = north - south;
		const ewRise = east - west;

		// Slope: angle of steepest gradient
		const maxRise = Math.sqrt(nsRise * nsRise + ewRise * ewRise);
		const slope = (Math.atan(maxRise / run) * 180) / Math.PI;

		// Aspect: direction the slope faces (downhill direction), 0-360 degrees, 0 = north
		let aspect: number;
		const absNS = Math.abs(nsRise);
		const absEW = Math.abs(ewRise);

		if (absNS === 0 && absEW === 0) {
			// Flat terrain, aspect is arbitrary
			aspect = 0;
		} else if (absNS >= absEW) {
			// Steepest descent is along NS axis
			// If north is higher, slope faces south (downhill toward south)
			aspect = nsRise > 0 ? 180 : 0;
		} else {
			// Steepest descent is along EW axis
			// If east is higher, slope faces west (downhill toward west)
			aspect = ewRise > 0 ? 270 : 90;
		}

		return { min, max, slope, aspect };
	} catch {
		throw new Error('Elevation data unavailable for this location.');
	} finally {
		clearTimeout(timeout);
	}
}
