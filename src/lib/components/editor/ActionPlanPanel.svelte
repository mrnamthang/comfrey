<script lang="ts">
	import type { ActionPlan } from '$lib/types';

	interface Props {
		plan: ActionPlan;
	}

	let { plan }: Props = $props();

	const priorityColors: Record<string, string> = {
		essential: 'bg-red-100 text-red-700',
		recommended: 'bg-amber-100 text-amber-700',
		optional: 'bg-stone-100 text-stone-600'
	};
</script>

<div class="space-y-5">
	<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">Action Plan</h3>

	{#if plan.phases.length === 0}
		<p class="text-sm text-stone-500">Add elements to your design to generate an action plan.</p>
	{:else}
		{#each plan.phases as phase}
			<section>
				<h4 class="text-sm font-semibold text-stone-800">
					Year {phase.year}: {phase.title}
				</h4>
				<ul class="mt-2 space-y-2">
					{#each phase.items as item}
						<li class="rounded-lg bg-stone-50 px-3 py-2">
							<div class="flex items-start justify-between gap-2">
								<p class="text-xs text-stone-700">{item.description}</p>
								<span class="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium {priorityColors[item.priority]}">
									{item.priority}
								</span>
							</div>
							{#if item.zone != null}
								<p class="mt-1 text-[10px] text-stone-400">Zone {item.zone}</p>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</div>
