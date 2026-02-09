/**
 * Mapbox Geocoding API integration.
 * Converts addresses to coordinates and provides autocomplete.
 */

import { env } from '$env/dynamic/public';

export interface GeocodingResult {
	place_name: string;
	center: [number, number];
}

/**
 * Search for addresses using the Mapbox Geocoding API v5.
 * Returns up to 5 matching results, or an empty array on failure.
 */
export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
	try {
		const token = env.PUBLIC_MAPBOX_TOKEN;
		const encoded = encodeURIComponent(query);
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&limit=5`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
			return [];
		}

		const data = await response.json();

		if (!data.features || !Array.isArray(data.features)) {
			return [];
		}

		return data.features.map((feature: { place_name: string; center: [number, number] }) => ({
			place_name: feature.place_name,
			center: feature.center
		}));
	} catch (error) {
		console.error('Geocoding search failed:', error);
		return [];
	}
}

/**
 * Reverse geocode coordinates to a place name using the Mapbox Geocoding API v5.
 * Returns the place name string, or null on failure.
 */
export async function reverseGeocode(lng: number, lat: number): Promise<string | null> {
	try {
		const token = env.PUBLIC_MAPBOX_TOKEN;
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Reverse geocoding API error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json();

		if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
			return null;
		}

		return data.features[0].place_name ?? null;
	} catch (error) {
		console.error('Reverse geocoding failed:', error);
		return null;
	}
}
