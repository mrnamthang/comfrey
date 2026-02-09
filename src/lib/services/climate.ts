/**
 * Open-Meteo API integration + climate classification.
 */

import type { ClimateType, Hemisphere } from '$lib/types';

export async function fetchClimate(
	lat: number,
	lng: number
): Promise<{
	avgTempColdestMonth: number;
	avgTempWarmestMonth: number;
	annualRainfall: number;
	frostFreeDays: number;
	avgWindSpeed: number;
	dominantWindDir: number;
	monsoonMonths?: [number, number];
}> {
	// Compute date range: from 1 year ago to yesterday
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);

	const oneYearAgo = new Date(yesterday);
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
	oneYearAgo.setDate(oneYearAgo.getDate() + 1);

	const formatDate = (d: Date): string => d.toISOString().slice(0, 10);

	const params = new URLSearchParams({
		latitude: lat.toString(),
		longitude: lng.toString(),
		daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
		timezone: 'auto',
		start_date: formatDate(oneYearAgo),
		end_date: formatDate(yesterday)
	});

	const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;

	// 10-second timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10_000);

	let response: Response;
	try {
		response = await fetch(url, { signal: controller.signal });
	} catch (err: unknown) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			throw new Error('Climate data request timed out. Please try again.');
		}
		throw new Error('Unable to fetch climate data. Please check your internet connection and try again.');
	} finally {
		clearTimeout(timeoutId);
	}

	if (!response.ok) {
		throw new Error(
			`Failed to fetch climate data (status ${response.status}). Please try again later.`
		);
	}

	let data: {
		daily: {
			time: string[];
			temperature_2m_max: (number | null)[];
			temperature_2m_min: (number | null)[];
			precipitation_sum: (number | null)[];
			wind_speed_10m_max: (number | null)[];
			wind_direction_10m_dominant: (number | null)[];
		};
	};

	try {
		data = await response.json();
	} catch {
		throw new Error('Received invalid climate data from the server. Please try again.');
	}

	const { daily } = data;

	if (!daily || !daily.time || daily.time.length === 0) {
		throw new Error('No climate data available for this location. Please try a different location.');
	}

	const times = daily.time;
	const tMax = daily.temperature_2m_max;
	const tMin = daily.temperature_2m_min;
	const precip = daily.precipitation_sum;
	const windSpeed = daily.wind_speed_10m_max;
	const windDir = daily.wind_direction_10m_dominant;

	// Group daily average temperatures by month (1-12)
	const monthTemps: Map<number, number[]> = new Map();
	// Group monthly precipitation totals
	const monthPrecip: Map<number, number> = new Map();

	let annualRainfall = 0;
	let frostFreeDays = 0;
	let windSpeedSum = 0;
	let windSpeedCount = 0;

	// Bucketize wind directions into 8 compass directions and count occurrences
	const windDirBuckets: Map<number, number> = new Map();

	for (let i = 0; i < times.length; i++) {
		const dateStr = times[i];
		// Extract month (1-12) from "YYYY-MM-DD"
		const month = parseInt(dateStr.slice(5, 7), 10);

		// Daily average temperature
		const maxT = tMax[i];
		const minT = tMin[i];
		if (maxT != null && minT != null) {
			const avgTemp = (maxT + minT) / 2;
			if (!monthTemps.has(month)) {
				monthTemps.set(month, []);
			}
			monthTemps.get(month)!.push(avgTemp);
		}

		// Frost-free days: min temp > 0
		if (minT != null && minT > 0) {
			frostFreeDays++;
		}

		// Precipitation
		const p = precip[i];
		if (p != null) {
			annualRainfall += p;
			monthPrecip.set(month, (monthPrecip.get(month) ?? 0) + p);
		}

		// Wind speed
		const ws = windSpeed[i];
		if (ws != null) {
			windSpeedSum += ws;
			windSpeedCount++;
		}

		// Wind direction: bucket into 8 compass directions (0, 45, 90, ... 315)
		const wd = windDir[i];
		if (wd != null) {
			// Each bucket covers 45 degrees, centered on the compass point
			const bucket = Math.round(wd / 45) % 8;
			const bucketDeg = bucket * 45;
			windDirBuckets.set(bucketDeg, (windDirBuckets.get(bucketDeg) ?? 0) + 1);
		}
	}

	// Calculate coldest and warmest month averages
	let coldestMonthAvg = Infinity;
	let warmestMonthAvg = -Infinity;

	for (const [, temps] of monthTemps) {
		const monthAvg = temps.reduce((a, b) => a + b, 0) / temps.length;
		if (monthAvg < coldestMonthAvg) coldestMonthAvg = monthAvg;
		if (monthAvg > warmestMonthAvg) warmestMonthAvg = monthAvg;
	}

	// Average wind speed
	const avgWindSpeed = windSpeedCount > 0 ? windSpeedSum / windSpeedCount : 0;

	// Dominant wind direction (mode)
	let dominantWindDir = 0;
	let maxWindDirCount = 0;
	for (const [dir, count] of windDirBuckets) {
		if (count > maxWindDirCount) {
			maxWindDirCount = count;
			dominantWindDir = dir;
		}
	}

	// Detect monsoon months: find a contiguous 2-month window where precipitation
	// is significantly higher than the annual monthly average.
	// Monsoon is defined as 2 consecutive months where each month's precipitation
	// exceeds 2x the average monthly precipitation.
	let monsoonMonths: [number, number] | undefined;
	if (monthPrecip.size >= 2) {
		const avgMonthlyPrecip = annualRainfall / monthPrecip.size;
		const threshold = avgMonthlyPrecip * 2;

		let maxPrecipPair = 0;
		for (let m = 1; m <= 12; m++) {
			const nextM = m === 12 ? 1 : m + 1;
			const p1 = monthPrecip.get(m) ?? 0;
			const p2 = monthPrecip.get(nextM) ?? 0;
			if (p1 >= threshold && p2 >= threshold) {
				const pairTotal = p1 + p2;
				if (pairTotal > maxPrecipPair) {
					maxPrecipPair = pairTotal;
					monsoonMonths = [m, nextM];
				}
			}
		}
	}

	const result: {
		avgTempColdestMonth: number;
		avgTempWarmestMonth: number;
		annualRainfall: number;
		frostFreeDays: number;
		avgWindSpeed: number;
		dominantWindDir: number;
		monsoonMonths?: [number, number];
	} = {
		avgTempColdestMonth: Math.round(coldestMonthAvg * 10) / 10,
		avgTempWarmestMonth: Math.round(warmestMonthAvg * 10) / 10,
		annualRainfall: Math.round(annualRainfall * 10) / 10,
		frostFreeDays,
		avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
		dominantWindDir
	};

	if (monsoonMonths) {
		result.monsoonMonths = monsoonMonths;
	}

	return result;
}

export function deriveClimateType(
	avgTempColdestMonth: number,
	avgTempWarmestMonth: number,
	annualRainfall: number,
	latitude: number
): { type: ClimateType; hemisphere: Hemisphere } {
	const hemisphere: Hemisphere = latitude >= 0 ? 'northern' : 'southern';

	if (annualRainfall < 250) {
		return { type: 'arid', hemisphere };
	}
	// Hot-arid: low rainfall AND warm annual average (catches desert climates
	// with cool winters like Alice Springs where coldest month is 12°C but avg is 24°C)
	const avgAnnualTemp = (avgTempColdestMonth + avgTempWarmestMonth) / 2;
	if (annualRainfall < 500 && avgAnnualTemp >= 18) {
		return { type: 'arid', hemisphere };
	}

	if (avgTempColdestMonth >= 18) {
		return { type: 'tropical', hemisphere };
	}
	if (avgTempColdestMonth >= 10 && avgTempWarmestMonth >= 22) {
		return { type: 'subtropical', hemisphere };
	}
	return { type: 'temperate', hemisphere };
}
