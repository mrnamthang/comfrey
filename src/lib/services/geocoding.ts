/**
 * Photon (Komoot) Geocoding integration.
 * Uses OpenStreetMap data. Free, no API key, CORS-friendly.
 * https://photon.komoot.io
 */

export interface GeocodingResult {
	place_name: string;
	center: [number, number];
}

/**
 * Search for addresses using the Photon API.
 * Returns up to 5 matching results, or an empty array on failure.
 */
export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
	try {
		const encoded = encodeURIComponent(query);
		const url = `https://photon.komoot.io/api/?q=${encoded}&limit=5`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
			return [];
		}

		const data = await response.json();

		if (!data.features || !Array.isArray(data.features)) {
			return [];
		}

		return data.features.map((f: {
			properties: { name?: string; street?: string; city?: string; state?: string; country?: string };
			geometry: { coordinates: [number, number] };
		}) => {
			const p = f.properties;
			const parts = [p.name, p.street, p.city, p.state, p.country].filter(Boolean);
			return {
				place_name: parts.join(', '),
				center: f.geometry.coordinates as [number, number]
			};
		});
	} catch (error) {
		console.error('Geocoding search failed:', error);
		return [];
	}
}

/**
 * Reverse geocode coordinates to a place name using the Photon API.
 * Returns the place name string, or null on failure.
 */
export async function reverseGeocode(lng: number, lat: number): Promise<string | null> {
	try {
		const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Reverse geocoding API error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();

		if (!data.features || data.features.length === 0) {
			return null;
		}

		const p = data.features[0].properties;
		const parts = [p.name, p.street, p.city, p.state, p.country].filter(Boolean);
		return parts.join(', ') || null;
	} catch (error) {
		console.error('Reverse geocoding failed:', error);
		return null;
	}
}
