<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import type { Element } from '$lib/types';
	import { getElementType } from '$lib/catalog/elements';

	interface Props {
		map: maplibregl.Map;
		elements: Element[];
		selectedId?: string | null;
		onElementClick?: (id: string) => void;
	}

	let { map, elements, selectedId = null, onElementClick }: Props = $props();

	const SOURCE_ID = 'elements-source';
	const LAYER_ID = 'elements-layer';
	const SELECTED_LAYER_ID = 'elements-selected-layer';

	$effect(() => {
		const geojson: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: elements
				.filter((el) => el.geometry.type === 'Point')
				.map((el) => ({
					type: 'Feature' as const,
					id: el.id,
					properties: {
						id: el.id,
						typeId: el.typeId,
						label: el.properties.label ?? getElementType(el.typeId)?.name ?? el.typeId,
						selected: el.id === selectedId ? 1 : 0
					},
					geometry: el.geometry
				}))
		};

		// Add or update source
		const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
		if (source) {
			source.setData(geojson as any);
		} else {
			map.addSource(SOURCE_ID, { type: 'geojson', data: geojson as any });

			// Unselected elements: colored circles
			map.addLayer({
				id: LAYER_ID,
				type: 'circle',
				source: SOURCE_ID,
				filter: ['==', ['get', 'selected'], 0],
				paint: {
					'circle-radius': 10,
					'circle-color': '#15803d',
					'circle-stroke-width': 2,
					'circle-stroke-color': '#ffffff'
				}
			});

			// Selected element: larger circle with blue ring
			map.addLayer({
				id: SELECTED_LAYER_ID,
				type: 'circle',
				source: SOURCE_ID,
				filter: ['==', ['get', 'selected'], 1],
				paint: {
					'circle-radius': 14,
					'circle-color': '#15803d',
					'circle-stroke-width': 3,
					'circle-stroke-color': '#3b82f6'
				}
			});

			// Labels
			map.addLayer({
				id: 'elements-labels',
				type: 'symbol',
				source: SOURCE_ID,
				layout: {
					'text-field': ['get', 'label'],
					'text-size': 11,
					'text-offset': [0, 1.8],
					'text-anchor': 'top'
				},
				paint: {
					'text-color': '#1c1917',
					'text-halo-color': '#ffffff',
					'text-halo-width': 1.5
				}
			});

			// Click handler
			map.on('click', LAYER_ID, (e: maplibregl.MapLayerMouseEvent) => {
				const features = e.features;
				if (features && features.length > 0) {
					const id = features[0].properties?.id;
					if (id && onElementClick) {
						onElementClick(id);
					}
				}
			});
			map.on('click', SELECTED_LAYER_ID, (e: maplibregl.MapLayerMouseEvent) => {
				const features = e.features;
				if (features && features.length > 0) {
					const id = features[0].properties?.id;
					if (id && onElementClick) {
						onElementClick(id);
					}
				}
			});

			// Cursor
			map.on('mouseenter', LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
			map.on('mouseleave', LAYER_ID, () => { map.getCanvas().style.cursor = ''; });
			map.on('mouseenter', SELECTED_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
			map.on('mouseleave', SELECTED_LAYER_ID, () => { map.getCanvas().style.cursor = ''; });
		}

		return () => {
			if (map.getLayer('elements-labels')) map.removeLayer('elements-labels');
			if (map.getLayer(SELECTED_LAYER_ID)) map.removeLayer(SELECTED_LAYER_ID);
			if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
			if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
		};
	});
</script>
