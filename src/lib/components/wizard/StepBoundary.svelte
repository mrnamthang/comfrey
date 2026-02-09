<script lang="ts">
	import type mapboxgl from 'mapbox-gl';
	import MapView from '$lib/components/map/MapView.svelte';
	import BoundaryDraw, { type DrawActions } from '$lib/components/map/BoundaryDraw.svelte';
	import { validateBoundary } from '$lib/utils/validation';
	import { calculateArea } from '$lib/utils/geo';
	import { formatArea } from '$lib/utils/units';

	interface Props {
		location: { lng: number; lat: number; placeName: string };
		initialBoundary?: GeoJSON.Polygon | null;
		onBoundarySet: (boundary: GeoJSON.Polygon, area: number) => void;
	}

	let { location, initialBoundary = null, onBoundarySet }: Props = $props();

	let map: mapboxgl.Map | null = $state(null);
	let boundary: GeoJSON.Polygon | null = $state(null);
	let drawActions: DrawActions | undefined = $state();
	let unitSystem: 'metric' | 'imperial' = $state('metric');
	let validationError: string | null = $state(null);
	let validationWarning: string | null = $state(null);

	let area = $derived(boundary ? calculateArea(boundary) : 0);

	// Restore boundary on mount
	$effect(() => {
		if (initialBoundary) {
			boundary = initialBoundary;
		}
	});

	function handleMapReady(m: mapboxgl.Map) {
		map = m;
		m.flyTo({ center: [location.lng, location.lat], zoom: 17, duration: 0 });
	}

	function handleBoundaryChange(polygon: GeoJSON.Polygon | null) {
		validationError = null;
		validationWarning = null;

		if (!polygon) {
			boundary = null;
			return;
		}

		const result = validateBoundary(polygon);
		if (!result.valid) {
			validationError = result.error ?? null;
			boundary = null;
			// Reset the drawing so user can try again
			drawActions?.resetBoundary();
			return;
		}

		validationWarning = result.warning ?? null;
		boundary = polygon;
		onBoundarySet(polygon, calculateArea(polygon));
	}

	function handleStartDraw() {
		validationError = null;
		validationWarning = null;
		boundary = null;
		drawActions?.startDrawing();
	}

	function handleReset() {
		validationError = null;
		validationWarning = null;
		boundary = null;
		drawActions?.resetBoundary();
	}
</script>

<div class="flex h-[calc(100vh-65px)] flex-col">
	<!-- Map with draw tool -->
	<div class="relative flex-1">
		<MapView
			center={[location.lng, location.lat]}
			zoom={17}
			onMapReady={handleMapReady}
		/>

		{#if map}
			<BoundaryDraw
				{map}
				{initialBoundary}
				onBoundaryChange={handleBoundaryChange}
				bind:actions={drawActions}
			/>
		{/if}

		<!-- Draw instruction overlay -->
		{#if !boundary && !validationError}
			<div
				class="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white"
			>
				Click "Draw Boundary" then click on the map to place vertices. Double-click to finish.
			</div>
		{/if}
	</div>

	<!-- Bottom panel -->
	<div class="border-t border-stone-200 bg-white px-4 py-3">
		<div class="mx-auto max-w-4xl">
			<!-- Validation error -->
			{#if validationError}
				<div class="mb-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
					{validationError}
				</div>
			{/if}

			<!-- Validation warning -->
			{#if validationWarning}
				<div class="mb-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
					{validationWarning}
				</div>
			{/if}

			{#if boundary}
				<!-- Area display -->
				<div class="mb-3 flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-stone-900">Property Area</p>
						<p class="text-lg font-semibold text-green-700">{formatArea(area, unitSystem)}</p>
					</div>
					<div class="flex items-center gap-2">
						<button
							onclick={() => (unitSystem = 'metric')}
							class="rounded px-2 py-1 text-xs font-medium {unitSystem === 'metric'
								? 'bg-stone-900 text-white'
								: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
						>
							Metric
						</button>
						<button
							onclick={() => (unitSystem = 'imperial')}
							class="rounded px-2 py-1 text-xs font-medium {unitSystem === 'imperial'
								? 'bg-stone-900 text-white'
								: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
						>
							Imperial
						</button>
					</div>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex items-center justify-between">
				<div>
					{#if !boundary}
						<button
							onclick={handleStartDraw}
							class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
						>
							Draw Boundary
						</button>
					{:else}
						<button
							onclick={handleReset}
							class="text-sm text-stone-500 hover:text-stone-700"
						>
							Reset Boundary
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
