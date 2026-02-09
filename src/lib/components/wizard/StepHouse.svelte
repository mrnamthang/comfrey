<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import MapView from '$lib/components/map/MapView.svelte';

	interface Props {
		location: { lng: number; lat: number; placeName: string };
		boundary: GeoJSON.Polygon;
		initialHousePosition?: [number, number] | null;
		onHousePlaced: (position: [number, number]) => void;
	}

	let { location, boundary, initialHousePosition = null, onHousePlaced }: Props = $props();

	let map: mapboxgl.Map | null = $state(null);
	let housePosition: [number, number] | null = $state(initialHousePosition ?? null);
	let marker: mapboxgl.Marker | null = null;

	function handleMapReady(m: mapboxgl.Map) {
		map = m;
		m.flyTo({ center: [location.lng, location.lat], zoom: 17, duration: 0 });

		// Draw boundary outline
		m.addSource('wizard-boundary', {
			type: 'geojson',
			data: {
				type: 'Feature',
				properties: {},
				geometry: boundary
			} as any
		});
		m.addLayer({
			id: 'wizard-boundary-fill',
			type: 'fill',
			source: 'wizard-boundary',
			paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.08 }
		});
		m.addLayer({
			id: 'wizard-boundary-line',
			type: 'line',
			source: 'wizard-boundary',
			paint: { 'line-color': '#3b82f6', 'line-width': 2 }
		});

		// Place existing marker if resuming
		if (housePosition) {
			placeMarker(housePosition);
		}
	}

	function handleMapClick(lngLat: { lng: number; lat: number }) {
		const pos: [number, number] = [lngLat.lng, lngLat.lat];
		housePosition = pos;
		placeMarker(pos);
		onHousePlaced(pos);
	}

	function placeMarker(pos: [number, number]) {
		if (!map) return;

		// Remove existing marker
		if (marker) {
			marker.remove();
			marker = null;
		}

		// Create house marker element
		const el = document.createElement('div');
		el.innerHTML = `<svg viewBox="0 0 32 32" width="32" height="32">
			<path d="M16 4L4 16h4v12h16V16h4L16 4z" fill="#1a1a1a" stroke="#ffffff" stroke-width="1.5"/>
		</svg>`;
		el.style.cursor = 'grab';

		marker = new mapboxgl.Marker({ element: el, draggable: true })
			.setLngLat(pos)
			.addTo(map);

		marker.on('dragend', () => {
			if (!marker) return;
			const lngLat = marker.getLngLat();
			housePosition = [lngLat.lng, lngLat.lat];
			onHousePlaced(housePosition);
		});
	}
</script>

<div class="flex h-full flex-col">
	<div class="border-b border-stone-200 bg-white px-6 py-4">
		<h2 class="text-lg font-semibold text-stone-900">Place Your House</h2>
		<p class="mt-1 text-sm text-stone-500">
			Click on the map to place your house. This becomes the center of your design — all permaculture zones radiate outward from here. You can drag it to adjust.
		</p>
	</div>
	<div class="relative flex-1">
		<MapView
			center={[location.lng, location.lat]}
			zoom={17}
			onMapReady={handleMapReady}
			onMapClick={handleMapClick}
		/>
		{#if !housePosition}
			<div class="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-stone-900/80 px-4 py-2 text-sm font-medium text-white">
				Click on the map to place your house
			</div>
		{:else}
			<div class="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-green-700/80 px-4 py-2 text-sm font-medium text-white">
				House placed! Drag to adjust position.
			</div>
		{/if}
	</div>
</div>
