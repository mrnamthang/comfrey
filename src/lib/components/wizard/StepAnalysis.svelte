<script lang="ts">
	import { analysis } from '$lib/stores/analysis.svelte';
	import AnalysisSidebar from '$lib/components/editor/AnalysisSidebar.svelte';

	interface Props {
		location: { lng: number; lat: number; placeName: string };
		onAnalysisComplete: () => void;
	}

	let { location, onAnalysisComplete }: Props = $props();

	let hasTriggered = $state(false);

	// Auto-trigger analysis when component mounts
	$effect(() => {
		if (!hasTriggered) {
			hasTriggered = true;
			runAnalysis();
		}
	});

	async function runAnalysis() {
		await analysis.analyze(location.lat, location.lng);
		if (analysis.state.status === 'success') {
			onAnalysisComplete();
		}
	}

	function handleRetry() {
		runAnalysis();
	}

	let elevationUnavailable = $derived(
		analysis.state.status === 'success' &&
			analysis.state.data !== null &&
			analysis.state.data.elevation.aspectLabel === 'Elevation data unavailable'
	);
</script>

<div class="mx-auto max-w-2xl px-4 py-8">
	{#if analysis.state.status === 'loading'}
		<div class="flex flex-col items-center justify-center py-16">
			<div class="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-green-700"></div>
			<p class="mt-4 text-sm font-medium text-stone-600">Analyzing your site...</p>
			<p class="mt-1 text-xs text-stone-400">Fetching climate, sun, and elevation data</p>
		</div>
	{:else if analysis.state.status === 'error'}
		<div class="flex flex-col items-center justify-center py-16">
			<div class="rounded-lg bg-red-50 px-6 py-4 text-center">
				<p class="text-sm font-medium text-red-700">{analysis.state.error}</p>
				<button
					onclick={handleRetry}
					class="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		</div>
	{:else if analysis.state.status === 'success' && analysis.state.data}
		<div>
			<div class="mb-6">
				<h2 class="text-xl font-semibold text-stone-900">Site Analysis</h2>
				<p class="mt-1 text-sm text-stone-500">
					Results for {location.placeName}
				</p>
			</div>
			<AnalysisSidebar analysis={analysis.state.data} {elevationUnavailable} />
		</div>
	{/if}
</div>
