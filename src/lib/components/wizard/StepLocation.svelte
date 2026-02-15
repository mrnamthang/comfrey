<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import MapView from '$lib/components/map/MapView.svelte';
	import AddressSearch from '$lib/components/map/AddressSearch.svelte';
	import LocationMarker from '$lib/components/map/LocationMarker.svelte';

	interface Props {
		onLocationSet: (location: { lng: number; lat: number; placeName: string }) => void;
		initialLocation?: { lng: number; lat: number; placeName: string } | null;
	}

	let { onLocationSet, initialLocation = null }: Props = $props();

	let map: maplibregl.Map | null = $state(null);
	let selectedLocation: { lng: number; lat: number; placeName: string } | null = $state(null);

	// Restore location when returning to this step
	$effect(() => {
		if (initialLocation) {
			selectedLocation = initialLocation;
		}
	});

	function handleMapReady(m: maplibregl.Map) {
		map = m;
		// If there's an initial location, fly to it
		if (initialLocation) {
			map.flyTo({ center: [initialLocation.lng, initialLocation.lat], zoom: 16, duration: 0 });
		}
	}

	function handleMapClick(lngLat: { lng: number; lat: number }) {
		selectedLocation = {
			lng: lngLat.lng,
			lat: lngLat.lat,
			placeName: `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`
		};
		onLocationSet(selectedLocation);
	}

	function handleSearchSelect(result: { placeName: string; center: [number, number] }) {
		const [lng, lat] = result.center;
		selectedLocation = { lng, lat, placeName: result.placeName };

		if (map) {
			map.flyTo({ center: [lng, lat], zoom: 16, duration: 2000 });
		}

		onLocationSet(selectedLocation);
	}
</script>

<div class="flex h-full flex-col">
	<!-- Search bar overlay -->
	<div class="relative z-10 p-4">
		<div class="mx-auto max-w-lg">
			<AddressSearch onSelect={handleSearchSelect} initialQuery={initialLocation?.placeName ?? ''} />
		</div>
	</div>

	<!-- Map -->
	<div class="relative flex-1">
		<MapView onMapReady={handleMapReady} onMapClick={handleMapClick} />

		{#if map && selectedLocation}
			<LocationMarker {map} lngLat={selectedLocation} />
		{/if}

		<!-- Instruction overlay -->
		{#if !selectedLocation}
			<div
				class="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white"
			>
				Search for an address or click on the map to set your location
			</div>
		{/if}
	</div>

	<!-- Selected location info -->
	{#if selectedLocation}
		<div class="border-t border-stone-200 bg-white px-4 py-3">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<div>
					<p class="text-sm font-medium text-stone-900">{selectedLocation.placeName}</p>
					<p class="text-xs text-stone-500">
						{selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
					</p>
				</div>
				<button
					onclick={() => {
						selectedLocation = null;
					}}
					class="text-sm text-stone-500 hover:text-stone-700"
				>
					Clear
				</button>
			</div>
		</div>
	{/if}
</div>
