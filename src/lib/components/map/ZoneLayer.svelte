<script lang="ts">
	import type mapboxgl from 'mapbox-gl';
	import type { Zone } from '$lib/types';

	interface Props {
		map: mapboxgl.Map;
		zones: Zone[];
		visible?: boolean;
	}

	let { map, zones, visible = true }: Props = $props();

	const SOURCE_ID = 'zones-source';
	const FILL_LAYER_ID = 'zones-fill';
	const LINE_LAYER_ID = 'zones-line';
	const LABEL_LAYER_ID = 'zones-label';

	$effect(() => {
		const geojson: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: zones.map((z) => ({
				type: 'Feature' as const,
				properties: {
					level: z.level,
					color: z.color,
					description: z.description
				},
				geometry: z.geometry
			}))
		};

		const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
		if (source) {
			source.setData(geojson as any);
		} else {
			map.addSource(SOURCE_ID, { type: 'geojson', data: geojson as any });

			map.addLayer({
				id: FILL_LAYER_ID,
				type: 'fill',
				source: SOURCE_ID,
				paint: {
					'fill-color': ['get', 'color'],
					'fill-opacity': 0.6
				}
			});

			map.addLayer({
				id: LINE_LAYER_ID,
				type: 'line',
				source: SOURCE_ID,
				paint: {
					'line-color': ['get', 'color'],
					'line-width': 1.5,
					'line-opacity': 0.8
				}
			});

			map.addLayer({
				id: LABEL_LAYER_ID,
				type: 'symbol',
				source: SOURCE_ID,
				layout: {
					'text-field': ['concat', 'Zone ', ['to-string', ['get', 'level']]],
					'text-size': 10
				},
				paint: {
					'text-color': '#44403c',
					'text-halo-color': '#ffffff',
					'text-halo-width': 1
				}
			});
		}

		// Visibility toggle
		const vis = visible ? 'visible' : 'none';
		if (map.getLayer(FILL_LAYER_ID)) map.setLayoutProperty(FILL_LAYER_ID, 'visibility', vis);
		if (map.getLayer(LINE_LAYER_ID)) map.setLayoutProperty(LINE_LAYER_ID, 'visibility', vis);
		if (map.getLayer(LABEL_LAYER_ID)) map.setLayoutProperty(LABEL_LAYER_ID, 'visibility', vis);

		return () => {
			if (map.getLayer(LABEL_LAYER_ID)) map.removeLayer(LABEL_LAYER_ID);
			if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
			if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
			if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
		};
	});
</script>
