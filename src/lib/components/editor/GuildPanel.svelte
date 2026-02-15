<script lang="ts">
	import { project } from '$lib/stores/project.svelte';
	import { checkCompanions, suggestGuild } from '$lib/services/companions';
	import { getPlant } from '$lib/catalog/plants';

	let elements = $derived(project.activeDesign?.elements ?? []);
	let climate = $derived(project.current?.analysis.data?.climate.type);

	let companionCheck = $derived(checkCompanions(elements));

	// Find unique placed plant IDs for guild suggestions
	let plantIds = $derived(
		[...new Set(elements
			.filter((el) => el.typeId.startsWith('plant:'))
			.map((el) => el.typeId.slice(6))
		)]
	);

	let selectedGuildPlant = $state<string>('');
	let guild = $derived(selectedGuildPlant ? suggestGuild(selectedGuildPlant, climate ? [climate] : undefined) : null);

	const layerLabels: Record<string, string> = {
		canopy: 'Canopy',
		understory: 'Understory',
		shrub: 'Shrub',
		herbaceous: 'Herbs',
		groundcover: 'Groundcover',
		root: 'Root',
		vine: 'Vine'
	};
</script>

<div class="space-y-4">
	<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">Companion Planting</h3>

	<!-- Good combos -->
	{#if companionCheck.good.length > 0}
		<div>
			<h4 class="text-xs font-medium text-green-700">Good Companions</h4>
			<div class="mt-1 space-y-1">
				{#each companionCheck.good as combo}
					<div class="rounded bg-green-50 px-2 py-1.5 text-xs text-green-800">
						{combo.plantA.name} + {combo.plantB.name}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Bad combos -->
	{#if companionCheck.bad.length > 0}
		<div>
			<h4 class="text-xs font-medium text-red-700">Avoid Together</h4>
			<div class="mt-1 space-y-1">
				{#each companionCheck.bad as combo}
					<div class="rounded bg-red-50 px-2 py-1.5 text-xs text-red-800">
						{combo.plantA.name} + {combo.plantB.name} — {combo.reason}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if companionCheck.good.length === 0 && companionCheck.bad.length === 0}
		<p class="text-sm text-stone-400">
			{plantIds.length < 2 ? 'Place at least 2 plants to see companion analysis.' : 'No notable companion relationships found.'}
		</p>
	{/if}

	<!-- Guild builder -->
	{#if plantIds.length > 0}
		<div class="border-t border-stone-100 pt-3">
			<h4 class="text-xs font-medium text-stone-600">Guild Suggestions</h4>
			<p class="mt-0.5 text-xs text-stone-400">Select a plant to see guild layers</p>
			<select
				bind:value={selectedGuildPlant}
				class="mt-1 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
			>
				<option value="">Choose a plant...</option>
				{#each plantIds as pid}
					{@const plant = getPlant(pid)}
					{#if plant}
						<option value={pid}>{plant.name}</option>
					{/if}
				{/each}
			</select>

			{#if guild}
				<div class="mt-2 space-y-2">
					<div class="rounded bg-green-100 px-2 py-1.5 text-xs font-medium text-green-900">
						Center: {guild.centerPlant.name} ({guild.centerPlant.layer})
					</div>
					{#each guild.layers as { layer, suggestions }}
						{#if suggestions.length > 0}
							<div>
								<p class="text-xs font-medium text-stone-500">{layerLabels[layer] ?? layer}</p>
								<div class="mt-0.5 flex flex-wrap gap-1">
									{#each suggestions as plant}
										<span class="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-700">{plant.name}</span>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
