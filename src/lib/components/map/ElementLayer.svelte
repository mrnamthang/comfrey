<script lang="ts">
	import type maplibregl from 'maplibre-gl';
	import type { Element } from '$lib/types';
	import { elementTypes, getElementType } from '$lib/catalog/elements';

	interface Props {
		map: maplibregl.Map;
		elements: Element[];
		selectedId?: string | null;
		onElementClick?: (id: string) => void;
	}

	let { map, elements, selectedId = null, onElementClick }: Props = $props();

	const SOURCE_ID = 'elements-source';
	const ICON_LAYER_ID = 'elements-icons';
	const SELECTED_LAYER_ID = 'elements-selected-ring';
	const LABEL_LAYER_ID = 'elements-labels';

	let layersCreated = false;

	function svgToImage(svgStr: string, size: number, color: string): Promise<ImageData> {
		return new Promise((resolve) => {
			const colored = svgStr.replace(/currentColor/g, color);
			const blob = new Blob([colored], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const img = new Image(size, size);
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0, size, size);
				URL.revokeObjectURL(url);
				resolve(ctx.getImageData(0, 0, size, size));
			};
			img.src = url;
		});
	}

	async function loadIcons() {
		const size = 32;
		const colors: Record<string, string> = {
			structure: '#1a1a1a',
			plant: '#15803d',
			water: '#1d4ed8',
			animal: '#b45309',
			path: '#78716c',
			utility: '#6b7280'
		};

		for (const et of elementTypes) {
			const imgId = `element-${et.id}`;
			if (map.hasImage(imgId)) continue;
			const color = colors[et.category] ?? '#15803d';
			const imageData = await svgToImage(et.icon, size, color);
			map.addImage(imgId, imageData);
		}
	}

	function buildGeoJSON(): GeoJSON.FeatureCollection {
		return {
			type: 'FeatureCollection',
			features: elements
				.filter((el) => el.geometry.type === 'Point')
				.map((el) => ({
					type: 'Feature' as const,
					id: el.id,
					properties: {
						id: el.id,
						typeId: el.typeId,
						icon: `element-${el.typeId}`,
						label: el.properties.label ?? getElementType(el.typeId)?.name ?? el.typeId,
						selected: el.id === selectedId ? 1 : 0
					},
					geometry: el.geometry
				}))
		};
	}

	function createLayers() {
		const geojson = buildGeoJSON();

		map.addSource(SOURCE_ID, { type: 'geojson', data: geojson as any });

		// Selected ring (behind icon)
		map.addLayer({
			id: SELECTED_LAYER_ID,
			type: 'circle',
			source: SOURCE_ID,
			filter: ['==', ['get', 'selected'], 1],
			paint: {
				'circle-radius': 22,
				'circle-color': 'transparent',
				'circle-stroke-width': 3,
				'circle-stroke-color': '#3b82f6'
			}
		});

		// Icons
		map.addLayer({
			id: ICON_LAYER_ID,
			type: 'symbol',
			source: SOURCE_ID,
			layout: {
				'icon-image': ['get', 'icon'],
				'icon-size': 1,
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
				'text-field': ['get', 'label'],
				'text-size': 11,
				'text-offset': [0, 1.6],
				'text-anchor': 'top',
				'text-optional': true
			},
			paint: {
				'text-color': '#1c1917',
				'text-halo-color': '#ffffff',
				'text-halo-width': 1.5
			}
		});

		// Click handlers
		map.on('click', ICON_LAYER_ID, handleLayerClick);
		map.on('click', SELECTED_LAYER_ID, handleLayerClick);
		map.on('mouseenter', ICON_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
		map.on('mouseleave', ICON_LAYER_ID, () => { map.getCanvas().style.cursor = ''; });

		layersCreated = true;
	}

	function handleLayerClick(e: maplibregl.MapLayerMouseEvent) {
		const features = e.features;
		if (features && features.length > 0) {
			const id = features[0].properties?.id;
			if (id && onElementClick) {
				onElementClick(id);
			}
		}
	}

	function updateData() {
		const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
		if (source) {
			source.setData(buildGeoJSON() as any);
		}
	}

	// One-time setup: load icons and create layers
	$effect(() => {
		loadIcons().then(() => {
			if (!layersCreated) {
				createLayers();
			}
		});

		return () => {
			try {
				map.off('click', ICON_LAYER_ID, handleLayerClick);
				map.off('click', SELECTED_LAYER_ID, handleLayerClick);
				if (map.getLayer(ICON_LAYER_ID)) map.removeLayer(ICON_LAYER_ID);
				if (map.getLayer(SELECTED_LAYER_ID)) map.removeLayer(SELECTED_LAYER_ID);
				if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
			} catch {
				// Map may already be destroyed
			}
			layersCreated = false;
		};
	});

	// Update data when elements or selection changes
	$effect(() => {
		// Read reactive dependencies
		void elements;
		void selectedId;
		if (layersCreated) {
			updateData();
		}
	});
</script>
