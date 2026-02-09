<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		currentStep: number;
		totalSteps: number;
		children: Snippet;
	}

	let { currentStep, totalSteps, children }: Props = $props();

	const steps = ['Location', 'Boundary', 'Analysis', 'House'];
</script>

<div class="flex min-h-screen flex-col bg-stone-50">
	<!-- Progress bar -->
	<nav class="border-b border-stone-200 bg-white px-6 py-4">
		<div class="mx-auto flex max-w-4xl items-center gap-4">
			<a href="/" class="text-sm text-stone-500 hover:text-stone-700">&larr; Dashboard</a>
			<div class="flex flex-1 items-center gap-2">
				{#each steps as step, i}
					<div class="flex items-center gap-2">
						<div
							class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium {i < currentStep
								? 'bg-green-700 text-white'
								: i === currentStep
									? 'bg-green-100 text-green-800 ring-2 ring-green-700'
									: 'bg-stone-100 text-stone-400'}"
						>
							{#if i < currentStep}
								&#10003;
							{:else}
								{i + 1}
							{/if}
						</div>
						<span
							class="hidden text-sm sm:inline {i === currentStep
								? 'font-medium text-stone-900'
								: 'text-stone-400'}"
						>
							{step}
						</span>
						{#if i < totalSteps - 1}
							<div class="mx-1 h-px w-6 bg-stone-200"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Step content -->
	<div class="flex-1">
		{@render children()}
	</div>
</div>
