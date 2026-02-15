<script lang="ts">
	import { goto } from '$app/navigation';
	import WizardShell from '$lib/components/wizard/WizardShell.svelte';
	import StepLocation from '$lib/components/wizard/StepLocation.svelte';
	import StepBoundary from '$lib/components/wizard/StepBoundary.svelte';
	import StepAnalysis from '$lib/components/wizard/StepAnalysis.svelte';
	import StepHouse from '$lib/components/wizard/StepHouse.svelte';
	import { project } from '$lib/stores/project.svelte';
	import { analysis } from '$lib/stores/analysis.svelte';
	import { generateZones } from '$lib/services/zones';
	import { saveProject } from '$lib/services/storage';

	let currentStep = $state(0);
	let location: { lng: number; lat: number; placeName: string } | null = $state(null);
	let boundary: GeoJSON.Polygon | null = $state(null);
	let boundaryArea: number = $state(0);
	let analysisComplete = $state(false);
	let housePosition: [number, number] | null = $state(null);

	function handleLocationSet(loc: { lng: number; lat: number; placeName: string }) {
		location = loc;
	}

	function handleBoundarySet(poly: GeoJSON.Polygon, area: number) {
		boundary = poly;
		boundaryArea = area;
	}

	function handleAnalysisComplete() {
		analysisComplete = true;
	}

	function handleHousePlaced(pos: [number, number]) {
		housePosition = pos;
	}

	function handleNext() {
		if (currentStep === 0 && location) {
			currentStep = 1;
		} else if (currentStep === 1 && boundary) {
			currentStep = 2;
		} else if (currentStep === 2 && analysisComplete) {
			currentStep = 3;
		}
	}

	function handleBack() {
		if (currentStep > 0) {
			currentStep -= 1;
		}
	}

	async function handleFinish() {
		if (!location || !boundary || !housePosition || !analysis.state.data) return;

		const analysisData = analysis.state.data;

		// Create the project
		const projectId = project.createProject(
			location.placeName || 'My Property',
			[location.lng, location.lat],
			boundary,
			boundaryArea,
			analysisData
		);

		// Place the house as first element
		const { createId } = await import('$lib/utils/id');
		project.addElement({
			id: createId(),
			typeId: 'house',
			geometry: { type: 'Point', coordinates: housePosition },
			properties: {
				rotation: 0,
				scale: 1,
				zone: 0,
				layer: 'infrastructure',
				label: 'House',
				meta: {}
			}
		});

		// Generate zones around house
		const zones = generateZones(housePosition, boundary, boundaryArea);
		project.updateZones(zones);

		// Save to IndexedDB — $state.snapshot() strips the Svelte proxy
		if (project.current) {
			await saveProject($state.snapshot(project.current));
		}

		// Navigate to editor
		await goto(`/design/${projectId}`);
	}
</script>

<WizardShell {currentStep} totalSteps={4}>
	{#if currentStep === 0}
		<div class="flex h-[calc(100vh-65px)] flex-col">
			<div class="flex-1">
				<StepLocation onLocationSet={handleLocationSet} initialLocation={location} />
			</div>
			{#if location}
				<div class="border-t border-stone-200 bg-white px-6 py-4">
					<div class="mx-auto flex max-w-4xl justify-end">
						<button
							onclick={handleNext}
							class="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800"
						>
							Next: Draw Boundary &rarr;
						</button>
					</div>
				</div>
			{/if}
		</div>
	{:else if currentStep === 1}
		{#if location}
			<div class="flex h-[calc(100vh-65px)] flex-col">
				<div class="flex-1">
					<StepBoundary
						{location}
						initialBoundary={boundary}
						onBoundarySet={handleBoundarySet}
					/>
				</div>
				<div class="border-t border-stone-200 bg-white px-6 py-4">
					<div class="mx-auto flex max-w-4xl items-center justify-between">
						<button
							onclick={handleBack}
							class="text-sm text-stone-500 hover:text-stone-700"
						>
							&larr; Back to Location
						</button>
						{#if boundary}
							<button
								onclick={handleNext}
								class="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800"
							>
								Next: Site Analysis &rarr;
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{:else if currentStep === 2}
		{#if location}
			<div class="flex h-[calc(100vh-65px)] flex-col">
				<div class="flex-1 overflow-y-auto">
					<StepAnalysis {location} onAnalysisComplete={handleAnalysisComplete} />
				</div>
				<div class="border-t border-stone-200 bg-white px-6 py-4">
					<div class="mx-auto flex max-w-4xl items-center justify-between">
						<button
							onclick={handleBack}
							class="text-sm text-stone-500 hover:text-stone-700"
						>
							&larr; Back to Boundary
						</button>
						{#if analysisComplete}
							<button
								onclick={handleNext}
								class="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800"
							>
								Next: Place House &rarr;
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{:else if currentStep === 3}
		{#if location && boundary}
			<div class="flex h-[calc(100vh-65px)] flex-col">
				<div class="flex-1">
					<StepHouse
						{location}
						{boundary}
						initialHousePosition={housePosition}
						onHousePlaced={handleHousePlaced}
					/>
				</div>
				<div class="border-t border-stone-200 bg-white px-6 py-4">
					<div class="mx-auto flex max-w-4xl items-center justify-between">
						<button
							onclick={handleBack}
							class="text-sm text-stone-500 hover:text-stone-700"
						>
							&larr; Back to Analysis
						</button>
						{#if housePosition}
							<button
								onclick={handleFinish}
								class="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800"
							>
								Start Designing &rarr;
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</WizardShell>
