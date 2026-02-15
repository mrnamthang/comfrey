<script lang="ts">
	import type { ClimateType } from '$lib/types';
	import { searchPlants, type Plant } from '$lib/catalog/plants';
	import { editor } from '$lib/stores/editor.svelte';
	import { project } from '$lib/stores/project.svelte';

	let query = $state('');
	let filterLayer = $state<Plant['layer'] | ''>('');

	let climate = $derived(project.current?.analysis.data?.climate.type as ClimateType | undefined);

	let results = $derived(() => {
		let found = searchPlants(query, climate);
		if (filterLayer) {
			found = found.filter((p) => p.layer === filterLayer);
		}
		return found;
	});

	function selectPlant(plant: Plant) {
		// Use the plant id as the placing type with a 'plant:' prefix
		editor.tool = 'place';
		editor.placingType = `plant:${plant.id}`;
	}

	const layerColors: Record<string, string> = {
		canopy: 'bg-green-100 text-green-800',
		understory: 'bg-emerald-100 text-emerald-800',
		shrub: 'bg-teal-100 text-teal-800',
		herbaceous: 'bg-lime-100 text-lime-800',
		groundcover: 'bg-yellow-100 text-yellow-800',
		root: 'bg-orange-100 text-orange-800',
		vine: 'bg-purple-100 text-purple-800'
	};
</script>

<div class="space-y-3">
	<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">Plant Database</h3>

	<!-- Search -->
	<input
		type="text"
		bind:value={query}
		placeholder="Search plants..."
		class="w-full rounded border border-stone-200 px-2 py-1.5 text-sm focus:border-green-600 focus:outline-none"
	/>

	<!-- Layer filter -->
	<div class="flex flex-wrap gap-1">
		<button
			onclick={() => { filterLayer = ''; }}
			class="rounded px-1.5 py-0.5 text-xs {filterLayer === '' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}"
		>All</button>
		{#each ['canopy', 'understory', 'shrub', 'herbaceous', 'groundcover', 'root', 'vine'] as layer}
			<button
				onclick={() => { filterLayer = filterLayer === layer ? '' : layer as Plant['layer']; }}
				class="rounded px-1.5 py-0.5 text-xs capitalize {filterLayer === layer ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}"
			>{layer}</button>
		{/each}
	</div>

	{#if climate}
		<p class="text-xs text-stone-400">Showing plants for {climate} climate</p>
	{/if}

	<!-- Results -->
	<div class="space-y-1 max-h-[60vh] overflow-y-auto">
		{#each results() as plant (plant.id)}
			<button
				onclick={() => selectPlant(plant)}
				class="w-full rounded px-2 py-2 text-left hover:bg-green-50 transition-colors {editor.placingType === `plant:${plant.id}` ? 'bg-green-100 ring-1 ring-green-400' : ''}"
			>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-stone-900">{plant.name}</span>
					<span class="rounded px-1.5 py-0.5 text-xs capitalize {layerColors[plant.layer] ?? 'bg-stone-100 text-stone-600'}">{plant.layer}</span>
				</div>
				<p class="text-xs italic text-stone-400">{plant.scientificName}</p>
				<div class="mt-1 flex flex-wrap gap-1">
					{#if plant.edible}
						<span class="rounded bg-green-50 px-1 py-0.5 text-xs text-green-700">Edible</span>
					{/if}
					{#if plant.nitrogenFixer}
						<span class="rounded bg-blue-50 px-1 py-0.5 text-xs text-blue-700">N-fixer</span>
					{/if}
					{#if plant.dynamicAccumulator}
						<span class="rounded bg-amber-50 px-1 py-0.5 text-xs text-amber-700">Accumulator</span>
					{/if}
					{#if plant.spacing}
						<span class="rounded bg-stone-50 px-1 py-0.5 text-xs text-stone-500">{plant.spacing}m</span>
					{/if}
				</div>
			</button>
		{/each}
		{#if results().length === 0}
			<p class="py-4 text-center text-sm text-stone-400">No plants found</p>
		{/if}
	</div>
</div>
