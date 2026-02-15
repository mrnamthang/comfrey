<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import type { SiteAnalysis } from '$lib/types';
	import * as turf from '@turf/turf';

	interface Props {
		map: maplibregl.Map;
		analysis: SiteAnalysis;
		center: [number, number];
		visible: boolean;
	}

	let { map, analysis, center, visible }: Props = $props();

	const SOURCE_ID = 'sector-source';
	const FILL_LAYER_ID = 'sector-fill';
	const LINE_LAYER_ID = 'sector-line';
	const LABEL_LAYER_ID = 'sector-label';
	let created = false;

	function buildSectors() {
		const features: GeoJSON.Feature[] = [];
		const radius = 0.15; // km - sector wedge radius

		// Sun sector: sweeps from sunrise azimuth to sunset azimuth
		const sunRise = analysis.sun.equinox.azimuth - 90; // approximate east
		const sunSet = analysis.sun.equinox.azimuth + 90; // approximate west
		const sunSector = turf.sector(turf.point(center), radius, sunRise, sunSet, { units: 'kilometers', steps: 32 });
		sunSector.properties = { sector: 'Sun', color: '#fbbf24', label: 'Sun Path' };
		features.push(sunSector);

		// Wind sector: prevailing wind direction ± 30°
		const windDir = analysis.wind.prevailing;
		const windSector = turf.sector(turf.point(center), radius, windDir - 30, windDir + 30, { units: 'kilometers', steps: 32 });
		windSector.properties = { sector: 'Wind', color: '#60a5fa', label: `Wind (${analysis.wind.label})` };
		features.push(windSector);

		// Water/slope sector: aspect direction ± 45° (downhill water flow)
		const aspect = analysis.elevation.aspect;
		const waterSector = turf.sector(turf.point(center), radius, aspect - 45, aspect + 45, { units: 'kilometers', steps: 32 });
		waterSector.properties = { sector: 'Water', color: '#34d399', label: `Water Flow (${analysis.elevation.aspectLabel})` };
		features.push(waterSector);

		return { type: 'FeatureCollection' as const, features };
	}

	$effect(() => {
		void visible;
		void analysis;

		if (!visible) {
			cleanup();
			return;
		}

		const data = buildSectors();

		if (!created) {
			map.addSource(SOURCE_ID, { type: 'geojson', data: data as any });
			map.addLayer({
				id: FILL_LAYER_ID,
				type: 'fill',
				source: SOURCE_ID,
				paint: {
					'fill-color': ['get', 'color'],
					'fill-opacity': 0.15
				}
			});
			map.addLayer({
				id: LINE_LAYER_ID,
				type: 'line',
				source: SOURCE_ID,
				paint: {
					'line-color': ['get', 'color'],
					'line-width': 2,
					'line-opacity': 0.6
				}
			});
			map.addLayer({
				id: LABEL_LAYER_ID,
				type: 'symbol',
				source: SOURCE_ID,
				layout: {
					'text-field': ['get', 'label'],
					'text-size': 12,
					'text-allow-overlap': true
				},
				paint: {
					'text-color': '#1c1917',
					'text-halo-color': '#ffffff',
					'text-halo-width': 1.5
				}
			});
			created = true;
		} else {
			const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
			if (src) src.setData(data as any);
		}

		return () => cleanup();
	});

	function cleanup() {
		try {
			if (map.getLayer(LABEL_LAYER_ID)) map.removeLayer(LABEL_LAYER_ID);
			if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
			if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
			if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
		} catch { /* map destroyed */ }
		created = false;
	}
</script>
