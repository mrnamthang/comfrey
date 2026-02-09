<script lang="ts">
	import { advisor } from '$lib/stores/advisor.svelte';

	let tip = $derived(advisor.activeTip);
	let showLearnMore = $state(false);
	let visible = $state(false);

	// Slide in after 500ms delay
	$effect(() => {
		if (tip) {
			visible = false;
			showLearnMore = false;
			const timer = setTimeout(() => { visible = true; }, 500);
			return () => clearTimeout(timer);
		} else {
			visible = false;
		}
	});
</script>

{#if tip && visible}
	<div
		class="absolute bottom-20 right-4 z-20 w-80 animate-slide-in rounded-xl border border-stone-200 bg-white shadow-lg"
	>
		<div class="p-4">
			<div class="flex items-start justify-between">
				<h3 class="text-sm font-semibold text-stone-900">{tip.headline}</h3>
				<button
					onclick={() => advisor.dismiss()}
					class="ml-2 text-xs text-stone-400 hover:text-stone-600"
					aria-label="Dismiss"
				>&times;</button>
			</div>
			<p class="mt-2 text-xs leading-relaxed text-stone-600">
				{advisor.hasSeenTip(tip.id) ? tip.shortReminder : tip.explanation}
			</p>

			{#if showLearnMore && tip.learnMore}
				<div class="mt-3 rounded-lg bg-stone-50 p-3">
					<p class="text-xs leading-relaxed text-stone-600">{tip.learnMore}</p>
				</div>
			{/if}
		</div>

		<div class="flex items-center justify-between border-t border-stone-100 px-4 py-2.5">
			<div class="flex gap-2">
				{#if tip.learnMore && !showLearnMore}
					<button
						onclick={() => { showLearnMore = true; }}
						class="text-xs text-green-700 hover:text-green-800"
					>
						Learn more
					</button>
				{/if}
			</div>
			<div class="flex gap-2">
				<button
					onclick={() => advisor.dismiss()}
					class="rounded px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-100"
				>
					Dismiss
				</button>
				<button
					onclick={() => advisor.next()}
					class="rounded bg-green-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-800"
				>
					Got it
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-in {
		animation: slide-in 300ms ease-out;
	}
</style>
