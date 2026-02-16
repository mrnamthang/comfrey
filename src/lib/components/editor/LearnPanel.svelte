<script lang="ts">
	import { lessons, getLessonsByCategory } from '$lib/catalog/lessons';
	import type { LessonCategory } from '$lib/types';
	import { editor } from '$lib/stores/editor.svelte';
	import { learning } from '$lib/stores/learning.svelte';
	import { project } from '$lib/stores/project.svelte';
	import LessonView from './LessonView.svelte';

	let activeLessonId = $state<string | null>(null);

	let climate = $derived(project.current?.analysis.data?.climate.type);
	let suggested = $derived(
		learning.getSuggestedLessons(editor.sidebarPanel, editor.showLayers, climate)
	);

	const categories: { key: LessonCategory; label: string }[] = [
		{ key: 'principles', label: 'Permaculture Principles' },
		{ key: 'plants', label: 'Plant & Species Guides' },
		{ key: 'tutorials', label: 'Using Comfrey' }
	];

	const panelState = $derived(editor.learnPanel);
	const isVisible = $derived(panelState !== 'closed');

	const widthClass = $derived(
		panelState === 'maximized'
			? 'w-[80vw]'
			: panelState === 'open'
				? 'w-[420px]'
				: panelState === 'minimized'
					? 'w-12'
					: 'w-0'
	);
</script>

{#if isVisible}
	<div
		class="fixed top-0 right-0 z-50 flex h-full flex-col bg-white shadow-xl transition-all duration-300 ease-in-out {widthClass}"
	>
		{#if panelState === 'minimized'}
			<!-- Minimized strip -->
			<button
				onclick={() => { editor.learnPanel = 'open'; }}
				class="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400 hover:bg-stone-50 hover:text-stone-600"
				title="Expand Learning Hub"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06V4.94a.75.75 0 00-.546-.722A9.006 9.006 0 0015 4a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v10.12a.75.75 0 00.954.721A7.506 7.506 0 015 14.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
				</svg>
				<span class="text-xs font-medium [writing-mode:vertical-lr]">Learn</span>
			</button>
		{:else}
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-stone-200 px-4 py-3">
				<h2 class="text-sm font-semibold text-stone-900">Learning Hub</h2>
				<div class="flex items-center gap-1">
					<button
						onclick={() => { editor.learnPanel = 'minimized'; }}
						class="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
						title="Minimize"
					>
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clip-rule="evenodd" />
						</svg>
					</button>
					{#if panelState === 'open'}
						<button
							onclick={() => { editor.learnPanel = 'maximized'; }}
							class="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
							title="Maximize"
						>
							<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
							</svg>
						</button>
					{:else}
						<button
							onclick={() => { editor.learnPanel = 'open'; }}
							class="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
							title="Restore"
						>
							<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path d="M3.28 2.22a.75.75 0 00-1.06 1.06L5.44 6.5H2.75a.75.75 0 000 1.5h4.5A.75.75 0 008 7.25v-4.5a.75.75 0 00-1.5 0v2.69L3.28 2.22zM13.5 13.31l3.22 3.22a.75.75 0 101.06-1.06L14.56 12.25h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-2.69z" />
							</svg>
						</button>
					{/if}
					<button
						onclick={() => { editor.learnPanel = 'closed'; activeLessonId = null; }}
						class="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
						title="Close"
					>
						<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Content -->
			{#if activeLessonId}
				<LessonView lessonId={activeLessonId} onBack={() => { activeLessonId = null; }} />
			{:else}
				<div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
					<!-- Suggested for you -->
					{#if suggested.length > 0}
						<div>
							<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">Suggested for you</h3>
							<div class="space-y-1">
								{#each suggested.slice(0, 3) as lesson (lesson.id)}
									<button
										onclick={() => { activeLessonId = lesson.id; }}
										class="w-full rounded-lg px-3 py-2 text-left hover:bg-indigo-50 transition-colors"
									>
										<div class="flex items-center gap-2">
											{#if learning.isCompleted(lesson.id)}
												<svg class="h-4 w-4 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
												</svg>
											{:else}
												<div class="h-4 w-4 shrink-0 rounded-full border-2 border-stone-300"></div>
											{/if}
											<span class="text-sm font-medium text-stone-900">{lesson.title}</span>
										</div>
										<p class="mt-0.5 pl-6 text-xs text-stone-500">{lesson.readingTime} min</p>
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- All lessons by category -->
					{#each categories as cat (cat.key)}
						{@const progress = learning.categoryProgress(cat.key)}
						{@const catLessons = getLessonsByCategory(cat.key)}
						<div>
							<div class="mb-2 flex items-center justify-between">
								<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">{cat.label}</h3>
								<span class="text-xs text-stone-400">{progress.done}/{progress.total}</span>
							</div>
							<div class="space-y-1">
								{#each catLessons as lesson (lesson.id)}
									<button
										onclick={() => { activeLessonId = lesson.id; }}
										class="w-full rounded-lg px-3 py-2 text-left hover:bg-stone-50 transition-colors"
									>
										<div class="flex items-center gap-2">
											{#if learning.isCompleted(lesson.id)}
												<svg class="h-4 w-4 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
												</svg>
											{:else}
												<div class="h-4 w-4 shrink-0 rounded-full border-2 border-stone-300"></div>
											{/if}
											<div class="min-w-0 flex-1">
												<span class="text-sm font-medium text-stone-900">{lesson.title}</span>
												<p class="truncate text-xs text-stone-400">{lesson.summary}</p>
											</div>
											<span class="shrink-0 text-xs text-stone-300">{lesson.readingTime}m</span>
										</div>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{/if}
