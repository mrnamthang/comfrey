<script lang="ts">
	import { onMount } from 'svelte';
	import { project } from '$lib/stores/project.svelte';
	import { advisor } from '$lib/stores/advisor.svelte';
	import {
		getAISettings,
		updateAISettings,
		saveAISettings,
		loadAISettings,
		generateDesignReview,
		type DesignReview
	} from '$lib/services/ai-advisor';

	let settings = $state(getAISettings());
	let review = $state<DesignReview | null>(null);
	let reviewing = $state(false);

	onMount(() => {
		loadAISettings();
		settings = getAISettings();
	});

	function handleProviderChange(provider: typeof settings.provider) {
		settings.provider = provider;
		if (provider === 'openai') settings.model = 'gpt-4o-mini';
		else if (provider === 'anthropic') settings.model = 'claude-sonnet-4-5-20250929';
		else if (provider === 'ollama') settings.model = 'llama3';
		else settings.model = '';
		updateAISettings(settings);
		saveAISettings();
	}

	function handleSave() {
		updateAISettings(settings);
		saveAISettings();
	}

	async function handleReview() {
		reviewing = true;
		review = null;
		const elements = project.activeDesign?.elements ?? [];
		const zones = project.activeDesign?.zones ?? [];
		const analysis = project.current?.analysis.data ?? null;
		review = await generateDesignReview(elements, zones, analysis, advisor.state);
		reviewing = false;
	}

	function scoreColor(score: number): string {
		if (score >= 70) return 'text-green-700';
		if (score >= 40) return 'text-amber-700';
		return 'text-red-700';
	}
</script>

<div class="space-y-4">
	<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">AI Design Review</h3>

	<!-- Review button -->
	<button
		onclick={handleReview}
		disabled={reviewing}
		class="w-full rounded bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
	>
		{reviewing ? 'Reviewing...' : 'Review My Design'}
	</button>

	<!-- Review results -->
	{#if review}
		<div class="space-y-3">
			<div class="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
				<span class="text-sm font-medium text-stone-600">Design Score</span>
				<span class="text-2xl font-bold {scoreColor(review.score)}">{review.score}</span>
			</div>

			{#if review.strengths.length > 0}
				<div>
					<h4 class="text-xs font-medium text-green-700">Strengths</h4>
					<ul class="mt-1 space-y-1">
						{#each review.strengths as item}
							<li class="rounded bg-green-50 px-2 py-1.5 text-xs text-green-800">{item}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if review.warnings.length > 0}
				<div>
					<h4 class="text-xs font-medium text-red-700">Warnings</h4>
					<ul class="mt-1 space-y-1">
						{#each review.warnings as item}
							<li class="rounded bg-red-50 px-2 py-1.5 text-xs text-red-800">{item}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if review.suggestions.length > 0}
				<div>
					<h4 class="text-xs font-medium text-amber-700">Suggestions</h4>
					<ul class="mt-1 space-y-1">
						{#each review.suggestions as item}
							<li class="rounded bg-amber-50 px-2 py-1.5 text-xs text-amber-800">{item}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	<!-- AI provider settings -->
	<div class="border-t border-stone-100 pt-3">
		<h4 class="text-xs font-medium text-stone-500">AI Provider (Optional)</h4>
		<p class="mt-0.5 text-xs text-stone-400">Connect an LLM for richer feedback</p>

		<select
			value={settings.provider}
			onchange={(e) => handleProviderChange((e.target as HTMLSelectElement).value as typeof settings.provider)}
			class="mt-2 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
		>
			<option value="none">None (rule-based only)</option>
			<option value="openai">OpenAI</option>
			<option value="anthropic">Anthropic</option>
			<option value="ollama">Ollama (local)</option>
		</select>

		{#if settings.provider !== 'none'}
			{#if settings.provider !== 'ollama'}
				<div class="mt-2">
					<label for="ai-key" class="block text-xs text-stone-500">API Key</label>
					<input
						id="ai-key"
						type="password"
						bind:value={settings.apiKey}
						onblur={handleSave}
						placeholder="sk-..."
						class="mt-0.5 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
					/>
				</div>
			{/if}

			<div class="mt-2">
				<label for="ai-model" class="block text-xs text-stone-500">Model</label>
				<input
					id="ai-model"
					type="text"
					bind:value={settings.model}
					onblur={handleSave}
					class="mt-0.5 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
				/>
			</div>

			{#if settings.provider === 'ollama'}
				<div class="mt-2">
					<label for="ai-url" class="block text-xs text-stone-500">Base URL</label>
					<input
						id="ai-url"
						type="text"
						bind:value={settings.baseUrl}
						onblur={handleSave}
						placeholder="http://localhost:11434"
						class="mt-0.5 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
					/>
				</div>
			{/if}
		{/if}
	</div>
</div>
