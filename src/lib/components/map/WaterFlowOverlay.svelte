<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import { fetchElevationGrid, computeFlowDirections, type FlowArrow, type ElevationGrid } from '$lib/services/terrain';

	interface Props {
		map: maplibregl.Map;
		center: [number, number];
		visible: boolean;
	}

	let { map, center, visible }: Props = $props();

	const SOURCE_ID = 'water-flow-source';
	const LINE_LAYER_ID = 'water-flow-lines';
	let created = false;
	let loading = $state(false);
	let arrows = $state<FlowArrow[]>([]);
	let grid = $state<ElevationGrid | null>(null);
	let loadedCenter = $state<string>('');

	function buildGeoJSON() {
		const features: GeoJSON.Feature[] = arrows.map((arrow) => ({
			type: 'Feature',
			properties: {
				accumulation: arrow.accumulation,
				width: Math.min(1 + Math.log2(arrow.accumulation), 6)
			},
			geometry: {
				type: 'LineString',
				coordinates: [arrow.from, arrow.to]
			}
		}));
		return { type: 'FeatureCollection' as const, features };
	}

	async function loadFlowData() {
		const key = center.join(',');
		if (key === loadedCenter) return;

		loading = true;
		try {
			grid = await fetchElevationGrid(center, 200, 20);
			arrows = computeFlowDirections(grid);
			loadedCenter = key;
		} catch (err) {
			console.error('Failed to load elevation data:', err);
			arrows = [];
		}
		loading = false;
	}

	$effect(() => {
		void visible;

		if (!visible) {
			cleanup();
			return;
		}

		loadFlowData();

		return () => cleanup();
	});

	$effect(() => {
		void arrows;

		if (!visible || arrows.length === 0) return;

		const data = buildGeoJSON();

		if (!created) {
			map.addSource(SOURCE_ID, { type: 'geojson', data: data as any });
			map.addLayer({
				id: LINE_LAYER_ID,
				type: 'line',
				source: SOURCE_ID,
				paint: {
					'line-color': '#3b82f6',
					'line-width': ['get', 'width'],
					'line-opacity': 0.6
				}
			});
			created = true;
		} else {
			const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
			if (src) src.setData(data as any);
		}
	});

	function cleanup() {
		try {
			if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
			if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
		} catch { /* map destroyed */ }
		created = false;
	}

	export function getGrid(): ElevationGrid | null {
		return grid;
	}
</script>

{#if visible && loading}
	<div class="pointer-events-none absolute right-4 top-4 rounded-lg bg-blue-500/90 px-3 py-1.5 text-xs font-medium text-white">
		Loading elevation data...
	</div>
{/if}
