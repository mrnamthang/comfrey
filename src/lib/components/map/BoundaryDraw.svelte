<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import MapboxDraw from '@mapbox/mapbox-gl-draw';
	import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

	export interface DrawActions {
		startDrawing: () => void;
		resetBoundary: () => void;
	}

	interface Props {
		map: maplibregl.Map;
		initialBoundary?: GeoJSON.Polygon | null;
		onBoundaryChange: (polygon: GeoJSON.Polygon | null) => void;
		actions?: DrawActions;
	}

	let {
		map,
		initialBoundary = null,
		onBoundaryChange,
		actions = $bindable()
	}: Props = $props();

	$effect(() => {
		const d = new MapboxDraw({
			displayControlsDefault: false,
			controls: {},
			defaultMode: 'simple_select',
			styles: [
				{
					id: 'gl-draw-polygon-fill',
					type: 'fill',
					filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
					paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 }
				},
				{
					id: 'gl-draw-polygon-stroke',
					type: 'line',
					filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
					paint: { 'line-color': '#3b82f6', 'line-width': 2 }
				},
				{
					id: 'gl-draw-point',
					type: 'circle',
					filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
					paint: { 'circle-radius': 5, 'circle-color': '#3b82f6' }
				},
				{
					id: 'gl-draw-point-mid',
					type: 'circle',
					filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
					paint: { 'circle-radius': 3, 'circle-color': '#3b82f6' }
				},
				{
					id: 'gl-draw-line',
					type: 'line',
					filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
					paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-dasharray': [2, 2] }
				}
			]
		});

		map.addControl(d as unknown as maplibregl.IControl);

		// Load initial boundary if provided
		if (initialBoundary) {
			const featureIds = d.add({
				type: 'Feature',
				properties: {},
				geometry: initialBoundary
			});
			if (featureIds.length > 0) {
				d.changeMode('simple_select', { featureIds });
			}
		}

		function handleDrawEvent() {
			const data = d.getAll();
			if (data.features.length > 0 && data.features[0].geometry.type === 'Polygon') {
				onBoundaryChange(data.features[0].geometry as GeoJSON.Polygon);
			} else {
				onBoundaryChange(null);
			}
		}

		map.on('draw.create', handleDrawEvent);
		map.on('draw.update', handleDrawEvent);
		map.on('draw.delete', handleDrawEvent);

		// Expose actions to parent via bindable prop
		actions = {
			startDrawing() {
				d.deleteAll();
				d.changeMode('draw_polygon');
			},
			resetBoundary() {
				d.deleteAll();
				onBoundaryChange(null);
			}
		};

		return () => {
			try {
				map.off('draw.create', handleDrawEvent);
				map.off('draw.update', handleDrawEvent);
				map.off('draw.delete', handleDrawEvent);
				map.removeControl(d as unknown as maplibregl.IControl);
			} catch {
				// Map may already be destroyed
			}
			actions = undefined;
		};
	});
</script>
