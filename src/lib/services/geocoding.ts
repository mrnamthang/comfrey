/**
 * Nominatim (OpenStreetMap) Geocoding integration.
 * Converts addresses to coordinates and provides autocomplete.
 * Free, no API key needed.
 */

export interface GeocodingResult {
	place_name: string;
	center: [number, number];
}

/**
 * Search for addresses using the Nominatim API.
 * Returns up to 5 matching results, or an empty array on failure.
 */
export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
	try {
		const encoded = encodeURIComponent(query);
		const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&email=comfrey-app@users.noreply.github.com`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
			return [];
		}

		const data = await response.json();

		if (!Array.isArray(data)) {
			return [];
		}

		return data.map((item: { display_name: string; lon: string; lat: string }) => ({
			place_name: item.display_name,
			center: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number]
		}));
	} catch (error) {
		console.error('Geocoding search failed:', error);
		return [];
	}
}

/**
 * Reverse geocode coordinates to a place name using the Nominatim API.
 * Returns the place name string, or null on failure.
 */
export async function reverseGeocode(lng: number, lat: number): Promise<string | null> {
	try {
		const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&email=comfrey-app@users.noreply.github.com`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Reverse geocoding API error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();

		return data.display_name ?? null;
	} catch (error) {
		console.error('Reverse geocoding failed:', error);
		return null;
	}
}
