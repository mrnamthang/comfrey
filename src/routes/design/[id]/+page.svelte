<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import type { Element } from '$lib/types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import MapView from '$lib/components/map/MapView.svelte';
	import ElementLayer from '$lib/components/map/ElementLayer.svelte';
	import ZoneLayer from '$lib/components/map/ZoneLayer.svelte';
	import PropertiesPanel from '$lib/components/editor/PropertiesPanel.svelte';
	import AdvisorCard from '$lib/components/editor/AdvisorCard.svelte';
	import DesignSwitcher from '$lib/components/editor/DesignSwitcher.svelte';
	import MeasureLine from '$lib/components/map/MeasureLine.svelte';
	import SectorOverlay from '$lib/components/map/SectorOverlay.svelte';
	import SunPathOverlay from '$lib/components/map/SunPathOverlay.svelte';
	import WaterFlowOverlay from '$lib/components/map/WaterFlowOverlay.svelte';
	import SunControls from '$lib/components/editor/SunControls.svelte';
	import ElevationProfile from '$lib/components/editor/ElevationProfile.svelte';
	import { project } from '$lib/stores/project.svelte';
	import { editor } from '$lib/stores/editor.svelte';
	import { advisor } from '$lib/stores/advisor.svelte';
	import { history } from '$lib/stores/history.svelte';
	import { getElementType } from '$lib/catalog/elements';
	import { getPlant } from '$lib/catalog/plants';
	import { createId } from '$lib/utils/id';
	import { pointInPolygon } from '$lib/utils/geo';
	import { generateActionPlan } from '$lib/services/action-plan';
	import { processEvent, type DesignEvent } from '$lib/services/advisor';
	import { saveProject, loadProject, exportProjectJSON } from '$lib/services/storage';
	import { exportDesignAsPNG } from '$lib/services/export';

	const projectId = $derived(page.params.id);
	let map: maplibregl.Map | null = $state(null);
	let dragMarker: maplibregl.Marker | null = null;

	let elements = $derived(project.activeDesign?.elements ?? []);
	let zones = $derived(project.activeDesign?.zones ?? []);
	let selectedElement = $derived(
		editor.selectedElementId
			? elements.find((el) => el.id === editor.selectedElementId) ?? null
			: null
	);
	let boundary = $derived(project.current?.land.boundary ?? null);

	let outsideBoundaryWarning = $state(false);
	let sunDate = $state(new Date());
	let waterFlowRef: WaterFlowOverlay | null = $state(null);

	// Derived action plan
	let actionPlan = $derived(
		generateActionPlan(elements, project.current?.analysis.data ?? null)
	);

	// Load project from IndexedDB on mount
	onMount(async () => {
		if (!project.current || project.current.id !== projectId) {
			const loaded = await loadProject(projectId);
			if (loaded) {
				project.current = loaded;
				project.activeDesignId = loaded.designs[0]?.id ?? null;
			} else {
				await goto('/');
				return;
			}
		}
	});

	// Auto-save on changes (debounced)
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		if (!project.current) return;
		// Touch any reactive property to subscribe
		const _updated = project.current.updatedAt;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			if (project.current) {
				saveProject($state.snapshot(project.current));
			}
		}, 1000);
	});

	function handleMapReady(m: maplibregl.Map) {
		map = m;
		if (project.current) {
			const [lng, lat] = project.current.land.location;
			m.flyTo({ center: [lng, lat], zoom: 17, duration: 0 });

			// Render boundary outline
			const bnd = project.current.land.boundary;
			if (bnd) {
				m.addSource('boundary', {
					type: 'geojson',
					data: { type: 'Feature', geometry: bnd, properties: {} }
				});
				m.addLayer({
					id: 'boundary-fill',
					type: 'fill',
					source: 'boundary',
					paint: { 'fill-color': '#15803d', 'fill-opacity': 0.05 }
				});
				m.addLayer({
					id: 'boundary-line',
					type: 'line',
					source: 'boundary',
					paint: { 'line-color': '#15803d', 'line-width': 2, 'line-dasharray': [2, 2] }
				});
			}
		}
	}

	function handleMapClick(lngLat: { lng: number; lat: number }) {
		outsideBoundaryWarning = false;

		if (editor.tool === 'place' && editor.placingType) {
			// Check if inside boundary
			if (boundary && !pointInPolygon([lngLat.lng, lngLat.lat], boundary)) {
				outsideBoundaryWarning = true;
			}

			let element: Element;

			if (editor.placingType.startsWith('plant:')) {
				const plantId = editor.placingType.slice(6);
				const plant = getPlant(plantId);
				if (!plant) return;

				element = {
					id: createId(),
					typeId: editor.placingType,
					geometry: { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] },
					properties: {
						rotation: 0,
						scale: 1,
						layer: 'planting',
						label: plant.name,
						meta: { plantId: plant.id, scientificName: plant.scientificName, spacing: plant.spacing }
					}
				};
			} else {
				const elementType = getElementType(editor.placingType);
				if (!elementType) return;

				element = {
					id: createId(),
					typeId: editor.placingType,
					geometry: { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] },
					properties: {
						rotation: 0,
						scale: 1,
						layer: elementType.category === 'structure' ? 'infrastructure'
							: elementType.category === 'plant' ? 'planting'
							: elementType.category === 'water' ? 'water'
							: elementType.category === 'path' ? 'paths'
							: 'infrastructure',
						meta: {}
					}
				};
			}

			project.addElement(element);

			// Fire advisor event
			fireAdvisorEvent({
				type: 'element_placed',
				element,
				analysis: project.current?.analysis.data!
			});
		} else if (editor.tool === 'measure') {
			editor.addMeasurePoint([lngLat.lng, lngLat.lat]);
		} else if (editor.tool === 'select') {
			// Deselect when clicking empty space
			editor.selectedElementId = null;
			removeDragMarker();
		}
	}

	function handleElementClick(id: string) {
		editor.tool = 'select';
		editor.selectedElementId = id;
		editor.placingType = null;
		setupDragMarker(id);
	}

	function handleDeselect() {
		editor.selectedElementId = null;
		removeDragMarker();
	}

	function handleDelete(id: string) {
		project.removeElement(id);
		editor.selectedElementId = null;
		removeDragMarker();
	}

	// Drag-to-move
	async function setupDragMarker(elementId: string) {
		removeDragMarker();
		if (!map) return;

		const element = elements.find((el) => el.id === elementId);
		if (!element || element.geometry.type !== 'Point') return;

		const pos = element.geometry.coordinates as [number, number];

		const el = document.createElement('div');
		el.style.width = '28px';
		el.style.height = '28px';
		el.style.borderRadius = '50%';
		el.style.backgroundColor = '#15803d';
		el.style.border = '3px solid #3b82f6';
		el.style.cursor = 'grab';
		el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

		const maplibregl = (await import('maplibre-gl')).default;
		dragMarker = new maplibregl.Marker({ element: el, draggable: true })
			.setLngLat(pos)
			.addTo(map);

		dragMarker.on('dragend', () => {
			if (!dragMarker) return;
			const lngLat = dragMarker.getLngLat();
			const newPos: [number, number] = [lngLat.lng, lngLat.lat];

			project.moveElement(elementId, newPos);

			// Check boundary
			if (boundary && !pointInPolygon(newPos, boundary)) {
				outsideBoundaryWarning = true;
			}

			// Fire advisor event
			const movedElement = elements.find((e) => e.id === elementId);
			if (movedElement && project.current?.analysis.data) {
				fireAdvisorEvent({
					type: 'element_moved',
					element: movedElement,
					previousPosition: pos,
					analysis: project.current.analysis.data
				});
			}
		});
	}

	function removeDragMarker() {
		if (dragMarker) {
			dragMarker.remove();
			dragMarker = null;
		}
	}

	function fireAdvisorEvent(event: DesignEvent) {
		const tips = processEvent(event, advisor.state, elements, zones);
		if (tips.length > 0) {
			advisor.enqueue(tips);
		}
	}

	async function handleExportPNG() {
		if (!map || !project.current) return;
		const canvas = map.getCanvas();
		await exportDesignAsPNG({
			mapCanvas: canvas,
			projectName: project.current.name,
			elements,
			zones,
			actionPlan
		});
	}

	function handleExportJSON() {
		if (!project.current) return;
		const json = exportProjectJSON(project.current);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${project.current.name.replace(/\s+/g, '-').toLowerCase()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function handleUndo() {
		if (!project.activeDesign) return;
		const restored = history.undo(JSON.parse(JSON.stringify(project.activeDesign)));
		if (restored) {
			project.restoreDesign(restored);
			editor.selectedElementId = null;
			removeDragMarker();
		}
	}

	function handleRedo() {
		if (!project.activeDesign) return;
		const restored = history.redo(JSON.parse(JSON.stringify(project.activeDesign)));
		if (restored) {
			project.restoreDesign(restored);
			editor.selectedElementId = null;
			removeDragMarker();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			editor.selectedElementId = null;
			editor.tool = 'select';
			editor.placingType = null;
			editor.clearMeasure();
			removeDragMarker();
		}
		if ((e.key === 'Delete' || e.key === 'Backspace') && editor.selectedElementId) {
			handleDelete(editor.selectedElementId);
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			handleUndo();
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
			e.preventDefault();
			handleRedo();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex h-screen w-screen">
	<!-- Sidebar -->
	<aside class="flex w-72 flex-col border-r border-stone-200 bg-white">
		<!-- Header -->
		<div class="border-b border-stone-200 px-4 py-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm font-semibold text-stone-900">
					{project.current?.name ?? 'Design Editor'}
				</h2>
				<a href="/" class="text-xs text-stone-400 hover:text-stone-600">Dashboard</a>
			</div>
			<!-- Toolbar -->
			<div class="mt-2 flex flex-wrap gap-1">
				<button
					onclick={handleUndo}
					disabled={!history.canUndo}
					title="Undo (Ctrl+Z)"
					class="rounded px-2 py-1 text-xs font-medium {history.canUndo
						? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
						: 'bg-stone-50 text-stone-300 cursor-not-allowed'}"
				>
					Undo
				</button>
				<button
					onclick={handleRedo}
					disabled={!history.canRedo}
					title="Redo (Ctrl+Shift+Z)"
					class="rounded px-2 py-1 text-xs font-medium {history.canRedo
						? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
						: 'bg-stone-50 text-stone-300 cursor-not-allowed'}"
				>
					Redo
				</button>
				<span class="w-px bg-stone-200"></span>
				<button
					onclick={() => { editor.tool = 'select'; editor.placingType = null; editor.clearMeasure(); }}
					class="rounded px-2 py-1 text-xs font-medium {editor.tool === 'select'
						? 'bg-stone-900 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Select
				</button>
				<button
					onclick={() => { editor.tool = 'measure'; editor.placingType = null; editor.clearMeasure(); }}
					class="rounded px-2 py-1 text-xs font-medium {editor.tool === 'measure'
						? 'bg-amber-600 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Measure
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'library'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'library'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Elements
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'analysis'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'analysis'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Analysis
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'action-plan'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'action-plan'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Plan
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'plants'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'plants'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Plants
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'guilds'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'guilds'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Guilds
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'advisor'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'advisor'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Advisor
				</button>
				<button
					onclick={() => { editor.sidebarPanel = 'ai-settings'; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.sidebarPanel === 'ai-settings'
						? 'bg-green-700 text-white'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					Review
				</button>
			</div>
			<!-- Layer toggles -->
			<div class="mt-2 flex flex-wrap gap-1">
				<button
					onclick={() => { editor.showLayers.sectors = !editor.showLayers.sectors; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.showLayers.sectors
						? 'bg-amber-100 text-amber-800'
						: 'bg-stone-50 text-stone-400 hover:bg-stone-100'}"
				>
					Sectors
				</button>
				<button
					onclick={() => { editor.showLayers.sunPath = !editor.showLayers.sunPath; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.showLayers.sunPath
						? 'bg-orange-100 text-orange-800'
						: 'bg-stone-50 text-stone-400 hover:bg-stone-100'}"
				>
					Sun Path
				</button>
				<button
					onclick={() => { editor.showLayers.waterFlow = !editor.showLayers.waterFlow; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.showLayers.waterFlow
						? 'bg-blue-100 text-blue-800'
						: 'bg-stone-50 text-stone-400 hover:bg-stone-100'}"
				>
					Water
				</button>
				<button
					onclick={() => { editor.showLayers.zones = !editor.showLayers.zones; }}
					class="rounded px-2 py-1 text-xs font-medium {editor.showLayers.zones
						? 'bg-green-100 text-green-800'
						: 'bg-stone-50 text-stone-400 hover:bg-stone-100'}"
				>
					Zones
				</button>
			</div>
		</div>

		<!-- Design switcher -->
		{#if (project.current?.designs.length ?? 0) > 1 || editor.sidebarPanel === 'library'}
			<div class="border-b border-stone-200 px-4 py-2">
				<DesignSwitcher />
			</div>
		{/if}

		<!-- Panel content -->
		<div class="flex-1 overflow-y-auto px-4 py-3">
			{#if selectedElement && editor.sidebarPanel !== 'analysis' && editor.sidebarPanel !== 'action-plan' && editor.sidebarPanel !== 'advisor'}
				<PropertiesPanel
					element={selectedElement}
					onDeselect={handleDeselect}
					onDelete={handleDelete}
				/>
			{:else if editor.sidebarPanel === 'library'}
				{#await import('$lib/components/editor/ElementLibrary.svelte') then { default: ElementLibrary }}
					<ElementLibrary />
				{/await}
			{:else if editor.sidebarPanel === 'analysis'}
				{#if project.current?.analysis.data}
					{#await import('$lib/components/editor/AnalysisSidebar.svelte') then { default: AnalysisSidebar }}
						<AnalysisSidebar analysis={project.current.analysis.data} />
					{/await}
				{/if}
				{#if editor.showLayers.sunPath}
					<div class="mt-3">
						<SunControls date={sunDate} onDateChange={(d) => { sunDate = d; }} />
					</div>
				{/if}
				{#if editor.showLayers.waterFlow && waterFlowRef?.getGrid()}
					<div class="mt-3">
						<ElevationProfile
							grid={waterFlowRef.getGrid()!}
							linePoints={editor.measurePoints.length >= 2 ? editor.measurePoints : (project.current?.land.location ? [[project.current.land.location[0] - 0.001, project.current.land.location[1]], [project.current.land.location[0] + 0.001, project.current.land.location[1]]] : [])}
						/>
					</div>
				{/if}
			{:else if editor.sidebarPanel === 'plants'}
				{#await import('$lib/components/editor/PlantBrowser.svelte') then { default: PlantBrowser }}
					<PlantBrowser />
				{/await}
			{:else if editor.sidebarPanel === 'guilds'}
				{#await import('$lib/components/editor/GuildPanel.svelte') then { default: GuildPanel }}
					<GuildPanel />
				{/await}
			{:else if editor.sidebarPanel === 'ai-settings'}
				{#await import('$lib/components/editor/AISettings.svelte') then { default: AISettings }}
					<AISettings />
				{/await}
			{:else if editor.sidebarPanel === 'action-plan'}
				{#await import('$lib/components/editor/ActionPlanPanel.svelte') then { default: ActionPlanPanel }}
					<ActionPlanPanel plan={actionPlan} />
				{/await}
			{:else if editor.sidebarPanel === 'advisor'}
				<div class="space-y-3">
					<h3 class="text-xs font-semibold uppercase tracking-wide text-stone-400">Advisor</h3>
					{#if advisor.activeTip}
						<div class="rounded-lg bg-green-50 p-3">
							<p class="text-sm font-medium text-green-900">{advisor.activeTip.headline}</p>
							<p class="mt-1 text-xs text-green-700">{advisor.activeTip.explanation}</p>
							<div class="mt-2 flex gap-2">
								<button onclick={() => advisor.next()} class="text-xs text-green-700 hover:underline">Got it</button>
								<button onclick={() => advisor.dismiss()} class="text-xs text-stone-500 hover:underline">Dismiss</button>
							</div>
						</div>
					{:else}
						<p class="text-sm text-stone-500">
							{advisor.state.seenTips.length > 0 ? "You've reviewed all tips." : 'Tips will appear as you design.'}
						</p>
					{/if}
					{#if advisor.state.dismissedTips.length > 0}
						<button onclick={() => advisor.reset()} class="text-xs text-stone-400 hover:text-stone-600">Reset tips</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Bottom actions -->
		<div class="border-t border-stone-200 px-4 py-3">
			<div class="flex gap-2">
				<button
					onclick={handleExportPNG}
					class="flex-1 rounded bg-stone-100 px-2 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
				>
					Export PNG
				</button>
				<button
					onclick={handleExportJSON}
					class="flex-1 rounded bg-stone-100 px-2 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
				>
					Export JSON
				</button>
			</div>
		</div>
	</aside>

	<!-- Map area -->
	<main class="relative flex-1">
		<MapView
			center={project.current?.land.location ?? [106.6297, 10.8231]}
			zoom={17}
			onMapReady={handleMapReady}
			onMapClick={handleMapClick}
		/>

		{#if map}
			<ZoneLayer {map} {zones} visible={editor.showLayers.zones} />
			<ElementLayer
				{map}
				{elements}
				selectedId={editor.selectedElementId}
				onElementClick={handleElementClick}
			/>
			{#if editor.tool === 'measure'}
				<MeasureLine {map} />
			{/if}
			{#if project.current?.analysis.data && project.current.land.location}
				<SectorOverlay
					{map}
					analysis={project.current.analysis.data}
					center={project.current.land.location}
					visible={editor.showLayers.sectors}
				/>
			{/if}
			{#if project.current?.land.location}
				<SunPathOverlay
					{map}
					center={project.current.land.location}
					date={sunDate}
					visible={editor.showLayers.sunPath}
				/>
				<WaterFlowOverlay
					{map}
					center={project.current.land.location}
					visible={editor.showLayers.waterFlow}
					bind:this={waterFlowRef}
				/>
			{/if}
		{/if}

		<!-- Advisor card overlay -->
		<AdvisorCard />

		<!-- Placement mode indicator -->
		{#if editor.tool === 'place' && editor.placingType}
			<div class="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-green-700/90 px-4 py-2 text-sm font-medium text-white">
				Click on the map to place {editor.placingType.startsWith('plant:') ? (getPlant(editor.placingType.slice(6))?.name ?? editor.placingType) : (getElementType(editor.placingType)?.name ?? editor.placingType)}
			</div>
		{:else if editor.tool === 'measure'}
			<div class="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-amber-600/90 px-4 py-2 text-sm font-medium text-white">
				Click to add measure points. Press Escape to exit.
			</div>
		{/if}

		<!-- Outside boundary warning -->
		{#if outsideBoundaryWarning}
			<div class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-white">
				Element placed outside property boundary
				<button onclick={() => (outsideBoundaryWarning = false)} class="ml-2 underline">Dismiss</button>
			</div>
		{/if}
	</main>
</div>
