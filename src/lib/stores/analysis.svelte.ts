import type { AsyncState, SiteAnalysis } from '$lib/types';
import { fetchClimate, deriveClimateType } from '$lib/services/climate';
import { computeSunPath } from '$lib/services/sun';
import { fetchElevation } from '$lib/services/elevation';

class AnalysisStore {
	state = $state<AsyncState<SiteAnalysis>>({ status: 'idle', data: null, error: null });

	async analyze(lat: number, lng: number): Promise<void> {
		this.state = { status: 'loading', data: null, error: null };

		const results = await Promise.allSettled([
			fetchClimate(lat, lng),
			Promise.resolve(computeSunPath(lat, lng)),
			fetchElevation(lat, lng)
		]);

		const [climateResult, sunResult, elevationResult] = results;

		// Climate is required — if it fails, we can't proceed
		if (climateResult.status === 'rejected') {
			this.state = {
				status: 'error',
				data: null,
				error: "We couldn't analyze this site right now. Check your internet connection and try again."
			};
			return;
		}

		const climate = climateResult.value;
		const { type, hemisphere } = deriveClimateType(
			climate.avgTempColdestMonth,
			climate.avgTempWarmestMonth,
			climate.annualRainfall,
			lat
		);

		// Sun is client-side, should always succeed
		const sun = sunResult.status === 'fulfilled' ? sunResult.value : null;

		// Elevation may fail — that's OK
		const elevation = elevationResult.status === 'fulfilled' ? elevationResult.value : null;

		const analysisData: SiteAnalysis = {
			climate: {
				zone: '', // USDA zone — deferred for now
				type,
				hemisphere,
				avgRainfall: climate.annualRainfall,
				avgTemp: {
					summer: climate.avgTempWarmestMonth,
					winter: climate.avgTempColdestMonth
				},
				frostFreeDays: climate.frostFreeDays,
				monsoonMonths: climate.monsoonMonths
			},
			sun: sun
				? {
						summerSolstice: sun.summerSolstice,
						winterSolstice: sun.winterSolstice,
						equinox: sun.equinox,
						daylength: sun.daylength
					}
				: {
						summerSolstice: { altitude: 0, azimuth: 0, sunrise: '--:--', sunset: '--:--', daylength: 0 },
						winterSolstice: { altitude: 0, azimuth: 0, sunrise: '--:--', sunset: '--:--', daylength: 0 },
						equinox: { altitude: 0, azimuth: 0, sunrise: '--:--', sunset: '--:--', daylength: 0 },
						daylength: { longest: 0, shortest: 0 }
					},
			wind: {
				prevailing: climate.dominantWindDir,
				avgSpeed: climate.avgWindSpeed,
				label: formatWindLabel(climate.dominantWindDir, climate.avgWindSpeed)
			},
			elevation: elevation
				? {
						min: elevation.min,
						max: elevation.max,
						slope: elevation.slope,
						aspect: elevation.aspect,
						aspectLabel: formatAspectLabel(elevation.aspect)
					}
				: {
						min: 0,
						max: 0,
						slope: 0,
						aspect: 0,
						aspectLabel: 'Elevation data unavailable'
					}
		};

		this.state = { status: 'success', data: analysisData, error: null };
	}
}

function formatWindLabel(degrees: number, speed: number): string {
	const dirs = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
	const index = Math.round(degrees / 45) % 8;
	const strength = speed >= 20 ? 'Strong' : speed >= 10 ? 'Moderate' : 'Light';
	return `${strength} ${dirs[index]} wind`;
}

function formatAspectLabel(degrees: number): string {
	const dirs = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'];
	const index = Math.round(degrees / 45) % 8;
	return `${dirs[index]} facing`;
}

export const analysis = new AnalysisStore();
