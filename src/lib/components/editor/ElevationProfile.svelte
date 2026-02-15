<script lang="ts">
	import { getElevationAtPoint, type ElevationGrid } from '$lib/services/terrain';

	interface Props {
		grid: ElevationGrid;
		linePoints: [number, number][]; // [lng, lat] pairs defining the cross-section line
	}

	let { grid, linePoints }: Props = $props();

	const SVG_WIDTH = 260;
	const SVG_HEIGHT = 120;
	const PADDING = { top: 15, right: 10, bottom: 25, left: 35 };

	let profileData = $derived(() => {
		if (linePoints.length < 2) return [];

		const numSamples = 40;
		const points: { distance: number; elevation: number }[] = [];
		let totalDist = 0;

		// Sample along the line
		for (let i = 0; i < numSamples; i++) {
			const t = i / (numSamples - 1);

			// Interpolate between consecutive line points
			let cumDist = 0;
			const segLengths: number[] = [];
			for (let j = 1; j < linePoints.length; j++) {
				const dx = (linePoints[j][0] - linePoints[j - 1][0]) * 111320 * Math.cos((linePoints[j][1] * Math.PI) / 180);
				const dy = (linePoints[j][1] - linePoints[j - 1][1]) * 110574;
				segLengths.push(Math.sqrt(dx * dx + dy * dy));
				cumDist += segLengths[j - 1];
			}
			if (i === 0) totalDist = cumDist;

			const targetDist = t * cumDist;
			let accum = 0;
			let lng = linePoints[0][0];
			let lat = linePoints[0][1];

			for (let j = 0; j < segLengths.length; j++) {
				if (accum + segLengths[j] >= targetDist) {
					const segT = segLengths[j] > 0 ? (targetDist - accum) / segLengths[j] : 0;
					lng = linePoints[j][0] + segT * (linePoints[j + 1][0] - linePoints[j][0]);
					lat = linePoints[j][1] + segT * (linePoints[j + 1][1] - linePoints[j][1]);
					break;
				}
				accum += segLengths[j];
			}

			const elev = getElevationAtPoint(grid, [lng, lat]);
			points.push({ distance: t * totalDist, elevation: elev });
		}

		return points;
	});

	let pathD = $derived(() => {
		const data = profileData();
		if (data.length === 0) return '';

		const plotW = SVG_WIDTH - PADDING.left - PADDING.right;
		const plotH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

		const maxDist = Math.max(...data.map((d) => d.distance), 1);
		const elevs = data.map((d) => d.elevation);
		const minElev = Math.min(...elevs);
		const maxElev = Math.max(...elevs);
		const elevRange = Math.max(maxElev - minElev, 1);

		const pts = data.map((d) => {
			const x = PADDING.left + (d.distance / maxDist) * plotW;
			const y = PADDING.top + plotH - ((d.elevation - minElev) / elevRange) * plotH;
			return `${x},${y}`;
		});

		// Fill area under curve
		const firstX = PADDING.left;
		const lastX = PADDING.left + plotW;
		const bottom = PADDING.top + plotH;

		return `M ${firstX},${bottom} L ${pts.join(' L ')} L ${lastX},${bottom} Z`;
	});

	let elevRange = $derived(() => {
		const data = profileData();
		if (data.length === 0) return { min: 0, max: 0, dist: 0 };
		const elevs = data.map((d) => d.elevation);
		return {
			min: Math.round(Math.min(...elevs)),
			max: Math.round(Math.max(...elevs)),
			dist: Math.round(Math.max(...data.map((d) => d.distance)))
		};
	});
</script>

{#if linePoints.length >= 2}
	<div class="rounded-lg bg-white p-2 shadow-sm border border-stone-200">
		<h4 class="text-xs font-semibold text-stone-500 mb-1">Elevation Profile</h4>
		<svg
			viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}"
			class="w-full"
			style="max-height: 140px;"
		>
			<!-- Grid lines -->
			<line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={SVG_HEIGHT - PADDING.bottom} stroke="#e7e5e4" stroke-width="1" />
			<line x1={PADDING.left} y1={SVG_HEIGHT - PADDING.bottom} x2={SVG_WIDTH - PADDING.right} y2={SVG_HEIGHT - PADDING.bottom} stroke="#e7e5e4" stroke-width="1" />

			<!-- Terrain fill -->
			{#if pathD()}
				<path d={pathD()} fill="#86efac" fill-opacity="0.4" stroke="#15803d" stroke-width="1.5" />
			{/if}

			<!-- Y-axis labels -->
			<text x={PADDING.left - 3} y={PADDING.top + 4} text-anchor="end" font-size="8" fill="#78716c">{elevRange().max}m</text>
			<text x={PADDING.left - 3} y={SVG_HEIGHT - PADDING.bottom} text-anchor="end" font-size="8" fill="#78716c">{elevRange().min}m</text>

			<!-- X-axis label -->
			<text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 5} text-anchor="middle" font-size="8" fill="#78716c">{elevRange().dist}m</text>
		</svg>
	</div>
{:else}
	<div class="rounded-lg bg-stone-50 p-3 text-center">
		<p class="text-xs text-stone-400">Use the Measure tool to draw a line, then toggle Water layer to load elevation data.</p>
	</div>
{/if}
