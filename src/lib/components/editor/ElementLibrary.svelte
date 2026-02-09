<script lang="ts">
	import { elementTypes } from '$lib/catalog/elements';
	import { editor } from '$lib/stores/editor.svelte';
	import type { ElementType } from '$lib/types';

	const categoryOrder = ['structure', 'plant', 'water', 'animal', 'utility', 'path'] as const;

	const categoryLabels: Record<string, string> = {
		structure: 'Structures',
		plant: 'Plants',
		water: 'Water',
		animal: 'Animals',
		utility: 'Utility',
		path: 'Paths'
	};

	let grouped = $derived(
		categoryOrder
			.map((cat) => ({
				category: cat,
				label: categoryLabels[cat],
				elements: elementTypes.filter((el) => el.category === cat)
			}))
			.filter((g) => g.elements.length > 0)
	);

	function selectElement(element: ElementType) {
		editor.tool = 'place';
		editor.placingType = element.id;
	}

	function isSelected(elementId: string): boolean {
		return editor.tool === 'place' && editor.placingType === elementId;
	}
</script>

<div class="space-y-5">
	{#each grouped as group}
		<section>
			<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">
				{group.label}
			</h3>
			<div class="mt-2 grid grid-cols-2 gap-2">
				{#each group.elements as element}
					<button
						type="button"
						class="flex flex-col items-center gap-1.5 rounded-lg bg-stone-50 p-3 transition-colors hover:bg-stone-100
							{isSelected(element.id) ? 'ring-2 ring-green-500 bg-green-50 hover:bg-green-50' : ''}"
						onclick={() => selectElement(element)}
					>
						<span class="h-6 w-6 text-stone-700">
							{@html element.icon}
						</span>
						<span class="text-xs font-medium text-stone-700">{element.name}</span>
					</button>
				{/each}
			</div>
		</section>
	{/each}
</div>
