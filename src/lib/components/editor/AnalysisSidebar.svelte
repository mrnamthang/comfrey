<script lang="ts">
	import type { SiteAnalysis } from '$lib/types';

	interface Props {
		analysis: SiteAnalysis;
		elevationUnavailable?: boolean;
	}

	let { analysis, elevationUnavailable = false }: Props = $props();

	function climateLabel(type: string): string {
		const labels: Record<string, string> = {
			tropical: 'Tropical',
			subtropical: 'Subtropical',
			temperate: 'Temperate',
			arid: 'Arid / Dry'
		};
		return labels[type] ?? type;
	}

	function frostLabel(days: number): string {
		if (days >= 365) return 'Year-round growing';
		if (days >= 270) return `${Math.round(days / 30)}-month growing season`;
		if (days >= 180) return `${Math.round(days / 30)}-month growing season`;
		return `Short growing season (${Math.round(days / 30)} months)`;
	}

	function tempLabel(temp: number): string {
		if (temp >= 30) return 'Very hot';
		if (temp >= 25) return 'Hot';
		if (temp >= 18) return 'Warm';
		if (temp >= 10) return 'Cool';
		return 'Cold';
	}

	function slopeLabel(degrees: number): string {
		if (degrees < 2) return 'Flat';
		if (degrees < 8) return 'Gentle slope';
		if (degrees < 15) return 'Moderate slope';
		return 'Steep slope';
	}
</script>

<div class="space-y-6">
	<!-- Climate -->
	<section>
		<h3 class="text-sm font-semibold uppercase tracking-wide text-stone-400">Climate</h3>
		<div class="mt-2 space-y-2">
			<div class="rounded-lg bg-stone-50 p-3">
				<p class="text-sm font-medium text-stone-900">{climateLabel(analysis.climate.type)}</p>
				<p class="mt-0.5 text-xs text-stone-500">
					{analysis.climate.hemisphere === 'northern' ? 'Northern' : 'Southern'} hemisphere
				</p>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="rounded-lg bg-stone-50 p-3">
					<p class="text-xs text-stone-400">Summers</p>
					<p class="text-sm font-medium text-stone-900">
						{tempLabel(analysis.climate.avgTemp.summer)} ({analysis.climate.avgTemp.summer.toFixed(0)}°C)
					</p>
				</div>
				<div class="rounded-lg bg-stone-50 p-3">
					<p class="text-xs text-stone-400">Winters</p>
					<p class="text-sm font-medium text-stone-900">
						{tempLabel(analysis.climate.avgTemp.winter)} ({analysis.climate.avgTemp.winter.toFixed(0)}°C)
					</p>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="rounded-lg bg-stone-50 p-3">
					<p class="text-xs text-stone-400">Rainfall</p>
					<p class="text-sm font-medium text-stone-900">{Math.round(analysis.climate.avgRainfall)} mm/year</p>
				</div>
				<div class="rounded-lg bg-stone-50 p-3">
					<p class="text-xs text-stone-400">Growing Season</p>
					<p class="text-sm font-medium text-stone-900">{frostLabel(analysis.climate.frostFreeDays)}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Sun -->
	<section>
		<h3 class="text-sm font-semibold uppercase tracking-wide text-stone-400">Sun</h3>
		<div class="mt-2 space-y-2">
			<div class="grid grid-cols-2 gap-2">
				<div class="rounded-lg bg-stone-50 p-3">
					<p class="text-xs text-stone-400">Longest Day</p>
					<p class="text-sm font-medium text-stone-900">{analysis.sun.daylength.longest.toFixed(1)}h</p>
					<p class="text-xs text-stone-400">
						{analysis.sun.summerSolstice.sunrise} – {analysis.sun.summerSolstice.sunset}
					</p>
				</div>
				<div class="rounded-lg bg-stone-50 p-3">
					<p class="text-xs text-stone-400">Shortest Day</p>
					<p class="text-sm font-medium text-stone-900">{analysis.sun.daylength.shortest.toFixed(1)}h</p>
					<p class="text-xs text-stone-400">
						{analysis.sun.winterSolstice.sunrise} – {analysis.sun.winterSolstice.sunset}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Wind -->
	<section>
		<h3 class="text-sm font-semibold uppercase tracking-wide text-stone-400">Wind</h3>
		<div class="mt-2">
			<div class="rounded-lg bg-stone-50 p-3">
				<p class="text-sm font-medium text-stone-900">{analysis.wind.label}</p>
				<p class="mt-0.5 text-xs text-stone-500">
					Average {analysis.wind.avgSpeed.toFixed(0)} km/h
				</p>
			</div>
		</div>
	</section>

	<!-- Elevation -->
	<section>
		<h3 class="text-sm font-semibold uppercase tracking-wide text-stone-400">Elevation</h3>
		<div class="mt-2">
			{#if elevationUnavailable}
				<div class="rounded-lg bg-amber-50 p-3">
					<p class="text-sm text-amber-700">Elevation data unavailable for this location.</p>
				</div>
			{:else}
				<div class="space-y-2">
					<div class="grid grid-cols-2 gap-2">
						<div class="rounded-lg bg-stone-50 p-3">
							<p class="text-xs text-stone-400">Terrain</p>
							<p class="text-sm font-medium text-stone-900">{slopeLabel(analysis.elevation.slope)}</p>
							<p class="text-xs text-stone-500">{analysis.elevation.slope.toFixed(1)}°</p>
						</div>
						<div class="rounded-lg bg-stone-50 p-3">
							<p class="text-xs text-stone-400">Facing</p>
							<p class="text-sm font-medium text-stone-900">{analysis.elevation.aspectLabel}</p>
						</div>
					</div>
					<div class="rounded-lg bg-stone-50 p-3">
						<p class="text-xs text-stone-400">Elevation Range</p>
						<p class="text-sm font-medium text-stone-900">
							{analysis.elevation.min.toFixed(0)}m – {analysis.elevation.max.toFixed(0)}m
						</p>
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>
