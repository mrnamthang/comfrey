<script lang="ts">
	import maplibregl from 'maplibre-gl';

	interface Props {
		map: maplibregl.Map;
		lngLat: { lng: number; lat: number };
	}

	let { map, lngLat }: Props = $props();
	let marker: maplibregl.Marker | null = $state(null);

	$effect(() => {
		marker = new maplibregl.Marker({ color: '#15803d' })
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
