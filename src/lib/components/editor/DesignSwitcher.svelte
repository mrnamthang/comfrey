<script lang="ts">
	import { project } from '$lib/stores/project.svelte';

	let renaming = $state<string | null>(null);
	let renameValue = $state('');

	function startRename(id: string, name: string) {
		renaming = id;
		renameValue = name;
	}

	function commitRename() {
		if (renaming && renameValue.trim()) {
			project.renameDesign(renaming, renameValue.trim());
		}
		renaming = null;
	}
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">Designs</h3>
		<button
			onclick={() => project.addDesign(`Design ${(project.current?.designs.length ?? 0) + 1}`)}
			class="text-xs text-green-700 hover:text-green-900"
		>
			+ New
		</button>
	</div>

	{#each project.current?.designs ?? [] as design (design.id)}
		<div
			class="group flex items-center gap-1 rounded px-2 py-1.5 text-sm {design.id === project.activeDesignId
				? 'bg-green-50 font-medium text-green-900'
				: 'text-stone-600 hover:bg-stone-50'}"
		>
			{#if renaming === design.id}
				<input
					type="text"
					bind:value={renameValue}
					onblur={commitRename}
					onkeydown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') renaming = null; }}
					class="flex-1 rounded border border-green-300 px-1 py-0.5 text-sm focus:outline-none"
					autofocus
				/>
			{:else}
				<button
					onclick={() => project.switchDesign(design.id)}
					class="flex-1 text-left truncate"
				>
					{design.name}
				</button>
				<button
					onclick={() => startRename(design.id, design.name)}
					class="invisible text-xs text-stone-400 hover:text-stone-600 group-hover:visible"
					title="Rename"
				>
					Ren
				</button>
				<button
					onclick={() => project.duplicateDesign(design.id)}
					class="invisible text-xs text-stone-400 hover:text-stone-600 group-hover:visible"
					title="Duplicate"
				>
					Dup
				</button>
				{#if (project.current?.designs.length ?? 0) > 1}
					<button
						onclick={() => project.removeDesign(design.id)}
						class="invisible text-xs text-red-400 hover:text-red-600 group-hover:visible"
						title="Delete"
					>
						Del
					</button>
				{/if}
			{/if}
		</div>
	{/each}
</div>
