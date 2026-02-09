<script lang="ts">
	import mapboxgl from 'mapbox-gl';

	interface Props {
		map: mapboxgl.Map;
		lngLat: { lng: number; lat: number };
	}

	let { map, lngLat }: Props = $props();
	let marker: mapboxgl.Marker | null = $state(null);

	$effect(() => {
		marker = new mapboxgl.Marker({ color: '#15803d' })
			.setLngLat([lngLat.lng, lngLat.lat])
			.addTo(map);

		return () => {
			marker?.remove();
			marker = null;
		};
	});

	// Update marker position when lngLat changes
	$effect(() => {
		if (marker) {
			marker.setLngLat([lngLat.lng, lngLat.lat]);
		}
	});
</script>
