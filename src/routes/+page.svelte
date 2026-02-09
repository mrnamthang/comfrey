<script lang="ts">
	import { onMount } from 'svelte';
	import { listProjects, deleteProject, importProjectJSON } from '$lib/services/storage';

	let projects = $state<{ id: string; name: string; createdAt: string; updatedAt: string }[]>([]);
	let loading = $state(true);

	onMount(async () => {
		projects = await listProjects();
		loading = false;
	});

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
		await deleteProject(id);
		projects = await listProjects();
	}

	async function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			try {
				const text = await file.text();
				const project = importProjectJSON(text);
				const { saveProject } = await import('$lib/services/storage');
				await saveProject(project);
				projects = await listProjects();
			} catch {
				alert('Invalid project file.');
			}
		};
		input.click();
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<main class="min-h-screen bg-stone-50 p-8">
	<div class="mx-auto max-w-4xl">
		<h1 class="text-3xl font-bold text-stone-900">Comfrey</h1>
		<p class="mt-2 text-stone-600">Guided land design with permaculture principles</p>

		<div class="mt-8 flex gap-3">
			<a
				href="/new"
				class="inline-block rounded-lg bg-green-700 px-6 py-3 text-white hover:bg-green-800"
			>
				New Design
			</a>
			<button
				onclick={handleImport}
				class="rounded-lg border border-stone-300 bg-white px-6 py-3 text-stone-700 hover:bg-stone-50"
			>
				Import JSON
			</button>
		</div>

		<div class="mt-12">
			<h2 class="text-lg font-semibold text-stone-700">Your Projects</h2>
			{#if loading}
				<p class="mt-4 text-stone-500">Loading...</p>
			{:else if projects.length === 0}
				<p class="mt-4 text-stone-500">No saved projects yet. Create a new design to get started.</p>
			{:else}
				<div class="mt-4 space-y-3">
					{#each projects as proj}
						<div class="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-5 py-4">
							<div>
								<a href="/design/{proj.id}" class="text-base font-medium text-stone-900 hover:text-green-700">
									{proj.name}
								</a>
								<p class="mt-0.5 text-xs text-stone-400">
									Created {formatDate(proj.createdAt)} &middot; Updated {formatDate(proj.updatedAt)}
								</p>
							</div>
							<div class="flex gap-2">
								<a
									href="/design/{proj.id}"
									class="rounded bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
								>
									Open
								</a>
								<button
									onclick={() => handleDelete(proj.id, proj.name)}
									class="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
