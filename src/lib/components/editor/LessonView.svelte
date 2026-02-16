<script lang="ts">
	import { getLesson } from '$lib/catalog/lessons';
	import { learning } from '$lib/stores/learning.svelte';
	import { editor } from '$lib/stores/editor.svelte';

	interface Props {
		lessonId: string;
		onBack: () => void;
	}

	let { lessonId, onBack }: Props = $props();

	let lesson = $derived(getLesson(lessonId));
	let completed = $derived(learning.isCompleted(lessonId));
</script>

{#if lesson}
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex items-center gap-2 border-b border-stone-200 px-4 py-3">
			<button
				onclick={onBack}
				class="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
				title="Back to lessons"
			>
				<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
				</svg>
			</button>
			<div class="min-w-0 flex-1">
				<h3 class="truncate text-sm font-semibold text-stone-900">{lesson.title}</h3>
				<p class="text-xs text-stone-400">{lesson.readingTime} min read</p>
			</div>
		</div>

		<!-- Body -->
		<div class="lesson-content flex-1 overflow-y-auto px-4 py-4">
			{@html lesson.body}
		</div>

		<!-- Footer -->
		<div class="border-t border-stone-200 px-4 py-3 space-y-2">
			{#if lesson.tryItAction}
				<button
					onclick={() => {
						if (lesson?.tryItAction?.panel) {
							editor.sidebarPanel = lesson.tryItAction.panel as typeof editor.sidebarPanel;
						}
						if (lesson?.tryItAction?.layer) {
							(editor.showLayers as Record<string, boolean>)[lesson.tryItAction.layer] = true;
						}
					}}
					class="w-full rounded bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
				>
					{lesson.tryItAction.label}
				</button>
			{/if}
			<button
				onclick={() => learning.toggleLesson(lessonId)}
				class="w-full rounded px-3 py-1.5 text-xs font-medium {completed
					? 'bg-green-600 text-white hover:bg-green-700'
					: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
			>
				{completed ? 'Completed' : 'Mark as completed'}
			</button>
		</div>
	</div>
{/if}

<style>
	.lesson-content :global(h4) {
		font-size: 1rem;
		font-weight: 700;
		color: #1c1917;
		margin-bottom: 0.5rem;
	}
	.lesson-content :global(h5) {
		font-size: 0.875rem;
		font-weight: 600;
		color: #292524;
		margin-top: 1rem;
		margin-bottom: 0.375rem;
	}
	.lesson-content :global(p) {
		font-size: 0.8125rem;
		line-height: 1.6;
		color: #44403c;
		margin-bottom: 0.5rem;
	}
	.lesson-content :global(ul),
	.lesson-content :global(ol) {
		font-size: 0.8125rem;
		line-height: 1.6;
		color: #44403c;
		padding-left: 1.25rem;
		margin-bottom: 0.5rem;
	}
	.lesson-content :global(li) {
		margin-bottom: 0.25rem;
	}
	.lesson-content :global(strong) {
		color: #1c1917;
	}
	.lesson-content :global(.tip) {
		background: #f0fdf4;
		border-left: 3px solid #16a34a;
		padding: 0.75rem;
		margin: 0.75rem 0;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		color: #15803d;
	}
</style>
