<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import { computeSunArc, computeShadowDirection } from '$lib/services/sun-path';

	interface Props {
		map: maplibregl.Map;
		center: [number, number];
		date: Date;
		visible: boolean;
	}

	let { map, center, date, visible }: Props = $props();

	const ARC_SOURCE = 'sun-arc-source';
	const ARC_LINE_LAYER = 'sun-arc-line';
	const ARC_POINTS_LAYER = 'sun-arc-points';
	const SHADOW_SOURCE = 'sun-shadow-source';
	const SHADOW_LAYER = 'sun-shadow-line';
	let created = false;

	function buildArcGeoJSON() {
		const arc = computeSunArc(date, center);
		const features: GeoJSON.Feature[] = [];

		if (arc.length >= 2) {
			features.push({
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'LineString',
					coordinates: arc.map((p) => p.lngLat)
				}
			});
		}

		for (const pt of arc) {
			features.push({
				type: 'Feature',
				properties: { label: `${pt.hour}:00` },
				geometry: { type: 'Point', coordinates: pt.lngLat }
			});
		}

		return { type: 'FeatureCollection' as const, features };
	}

	function buildShadowGeoJSON() {
		const shadow = computeShadowDirection(date, center);
		if (!shadow) return { type: 'FeatureCollection' as const, features: [] };

		const len = 0.05 * Math.min(shadow.lengthFactor, 5); // km
		const azRad = (shadow.shadowAzimuth * Math.PI) / 180;
		const [lng, lat] = center;
		const endLng = lng + (len / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(azRad);
		const endLat = lat + (len / 110.574) * Math.cos(azRad);

		return {
			type: 'FeatureCollection' as const,
			features: [{
				type: 'Feature' as const,
				properties: { altitude: Math.round(shadow.altitude) },
				geometry: {
					type: 'LineString',
					coordinates: [center, [endLng, endLat]]
				}
			}]
		};
	}

	$effect(() => {
		void visible;
		void date;

		if (!visible) {
			cleanup();
			return;
		}

		const arcData = buildArcGeoJSON();
		const shadowData = buildShadowGeoJSON();

		if (!created) {
			map.addSource(ARC_SOURCE, { type: 'geojson', data: arcData as any });
			map.addLayer({
				id: ARC_LINE_LAYER,
				type: 'line',
				source: ARC_SOURCE,
				filter: ['==', '$type', 'LineString'],
				paint: { 'line-color': '#f59e0b', 'line-width': 2.5, 'line-opacity': 0.7 }
			});
			map.addLayer({
				id: ARC_POINTS_LAYER,
				type: 'symbol',
				source: ARC_SOURCE,
				filter: ['==', '$type', 'Point'],
				layout: {
					'text-field': ['get', 'label'],
					'text-size': 10,
					'text-allow-overlap': true
				},
				paint: {
					'text-color': '#b45309',
					'text-halo-color': '#fff',
					'text-halo-width': 1
				}
			});

			map.addSource(SHADOW_SOURCE, { type: 'geojson', data: shadowData as any });
			map.addLayer({
				id: SHADOW_LAYER,
				type: 'line',
				source: SHADOW_SOURCE,
				paint: { 'line-color': '#57534e', 'line-width': 4, 'line-opacity': 0.5 }
			});
			created = true;
		} else {
			const arcSrc = map.getSource(ARC_SOURCE) as maplibregl.GeoJSONSource | undefined;
			if (arcSrc) arcSrc.setData(arcData as any);
			const shadowSrc = map.getSource(SHADOW_SOURCE) as maplibregl.GeoJSONSource | undefined;
			if (shadowSrc) shadowSrc.setData(shadowData as any);
		}

		return () => cleanup();
	});

	function cleanup() {
		try {
			if (map.getLayer(ARC_POINTS_LAYER)) map.removeLayer(ARC_POINTS_LAYER);
			if (map.getLayer(ARC_LINE_LAYER)) map.removeLayer(ARC_LINE_LAYER);
			if (map.getSource(ARC_SOURCE)) map.removeSource(ARC_SOURCE);
			if (map.getLayer(SHADOW_LAYER)) map.removeLayer(SHADOW_LAYER);
			if (map.getSource(SHADOW_SOURCE)) map.removeSource(SHADOW_SOURCE);
		} catch { /* map destroyed */ }
		created = false;
	}
</script>
