<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import * as turf from '@turf/turf';
	import { editor } from '$lib/stores/editor.svelte';

	interface Props {
		map: maplibregl.Map;
	}

	let { map }: Props = $props();

	const SOURCE_ID = 'measure-source';
	const LINE_LAYER_ID = 'measure-line';
	const POINTS_LAYER_ID = 'measure-points';
	let created = false;

	function buildGeoJSON() {
		const pts = editor.measurePoints;
		const features: GeoJSON.Feature[] = [];

		if (pts.length >= 2) {
			features.push({
				type: 'Feature',
				properties: {},
				geometry: { type: 'LineString', coordinates: pts }
			});
		}

		for (const pt of pts) {
			features.push({
				type: 'Feature',
				properties: {},
				geometry: { type: 'Point', coordinates: pt }
			});
		}

		return { type: 'FeatureCollection' as const, features };
	}

	function totalDistance(): string {
		const pts = editor.measurePoints;
		if (pts.length < 2) return '';
		let total = 0;
		for (let i = 1; i < pts.length; i++) {
			total += turf.distance(turf.point(pts[i - 1]), turf.point(pts[i]), { units: 'meters' });
		}
		if (total < 1000) return `${Math.round(total)} m`;
		return `${(total / 1000).toFixed(2)} km`;
	}

	$effect(() => {
		void editor.measurePoints;

		if (!created) {
			map.addSource(SOURCE_ID, { type: 'geojson', data: buildGeoJSON() as any });
			map.addLayer({
				id: LINE_LAYER_ID,
				type: 'line',
				source: SOURCE_ID,
				paint: { 'line-color': '#f59e0b', 'line-width': 3, 'line-dasharray': [3, 2] }
			});
			map.addLayer({
				id: POINTS_LAYER_ID,
				type: 'circle',
				source: SOURCE_ID,
				filter: ['==', '$type', 'Point'],
				paint: { 'circle-radius': 5, 'circle-color': '#f59e0b', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
			});
			created = true;
		} else {
			const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
			if (src) src.setData(buildGeoJSON() as any);
		}

		return () => {
			try {
				if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
				if (map.getLayer(POINTS_LAYER_ID)) map.removeLayer(POINTS_LAYER_ID);
				if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
			} catch { /* map destroyed */ }
			created = false;
		};
	});
</script>

{#if editor.measurePoints.length >= 2}
	<div class="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-white">
		Distance: {totalDistance()} ({editor.measurePoints.length} points)
	</div>
{/if}
