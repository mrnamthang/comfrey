import type { Project, Element, Zone, Design, SiteAnalysis } from '$lib/types';
import { createId } from '$lib/utils/id';
import { history } from './history.svelte';

class ProjectStore {
	current = $state<Project | null>(null);
	activeDesignId = $state<string | null>(null);
	activeDesign = $derived(
		this.current?.designs.find((d) => d.id === this.activeDesignId) ?? null
	);

	/** Create a new project from wizard data and set it as current. */
	createProject(
		name: string,
		location: [number, number],
		boundary: GeoJSON.Polygon,
		area: number,
		analysis: SiteAnalysis
	): string {
		const designId = createId();
		const projectId = createId();
		const now = new Date().toISOString();

		const design: Design = {
			id: designId,
			name: 'Design 1',
			elements: [],
			zones: [],
			layers: [
				{ id: createId(), name: 'Infrastructure', type: 'infrastructure', visible: true },
				{ id: createId(), name: 'Planting', type: 'planting', visible: true },
				{ id: createId(), name: 'Water', type: 'water', visible: true },
				{ id: createId(), name: 'Paths', type: 'paths', visible: true }
			],
			camera: { center: location, zoom: 17, bearing: 0 },
			createdAt: now,
			updatedAt: now
		};

		this.current = {
			id: projectId,
			name,
			land: { boundary: boundary as unknown as Project['land']['boundary'], location, area },
			analysis: { status: 'success', data: analysis, error: null },
			designs: [design],
			advisorState: { seenTips: [], dismissedTips: [], appliedTips: [] },
			createdAt: now,
			updatedAt: now,
			version: 1
		};
		this.activeDesignId = designId;
		return projectId;
	}

	addElement(element: Element): void {
		if (!this.activeDesign) return;
		this.pushHistory();
		this.activeDesign.elements = [...this.activeDesign.elements, element];
		this.touch();
	}

	moveElement(id: string, position: GeoJSON.Position): void {
		if (!this.activeDesign) return;
		this.pushHistory();
		this.activeDesign.elements = this.activeDesign.elements.map((el) => {
			if (el.id !== id) return el;
			if (el.geometry.type === 'Point') {
				return {
					...el,
					geometry: { type: 'Point' as const, coordinates: position as [number, number] }
				};
			}
			return el;
		});
		this.touch();
	}

	removeElement(id: string): void {
		if (!this.activeDesign) return;
		this.pushHistory();
		this.activeDesign.elements = this.activeDesign.elements.filter((el) => el.id !== id);
		this.touch();
	}

	updateElementMeta(id: string, meta: Record<string, unknown>): void {
		if (!this.activeDesign) return;
		this.pushHistory();
		this.activeDesign.elements = this.activeDesign.elements.map((el) => {
			if (el.id !== id) return el;
			return { ...el, properties: { ...el.properties, meta } };
		});
		this.touch();
	}

	updateElementProperties(id: string, props: Partial<Element['properties']>): void {
		if (!this.activeDesign) return;
		this.pushHistory();
		this.activeDesign.elements = this.activeDesign.elements.map((el) => {
			if (el.id !== id) return el;
			return { ...el, properties: { ...el.properties, ...props } };
		});
		this.touch();
	}

	updateZones(zones: Zone[]): void {
		if (!this.activeDesign) return;
		this.pushHistory();
		this.activeDesign.zones = zones;
		this.touch();
	}

	/** Restore a design from an undo/redo snapshot. */
	restoreDesign(design: Design): void {
		if (!this.current) return;
		this.current.designs = this.current.designs.map((d) =>
			d.id === design.id ? design : d
		);
		this.touch();
	}

	// ---- Design CRUD ----

	addDesign(name: string): string {
		if (!this.current) return '';
		const now = new Date().toISOString();
		const designId = createId();
		const design: Design = {
			id: designId,
			name,
			elements: [],
			zones: [],
			layers: [
				{ id: createId(), name: 'Infrastructure', type: 'infrastructure', visible: true },
				{ id: createId(), name: 'Planting', type: 'planting', visible: true },
				{ id: createId(), name: 'Water', type: 'water', visible: true },
				{ id: createId(), name: 'Paths', type: 'paths', visible: true }
			],
			camera: { center: this.current.land.location, zoom: 17, bearing: 0 },
			createdAt: now,
			updatedAt: now
		};
		this.current.designs = [...this.current.designs, design];
		this.switchDesign(designId);
		this.touch();
		return designId;
	}

	duplicateDesign(sourceId: string): string {
		if (!this.current) return '';
		const source = this.current.designs.find((d) => d.id === sourceId);
		if (!source) return '';
		const now = new Date().toISOString();
		const designId = createId();
		const duplicate: Design = {
			...JSON.parse(JSON.stringify(source)),
			id: designId,
			name: `${source.name} (copy)`,
			createdAt: now,
			updatedAt: now
		};
		this.current.designs = [...this.current.designs, duplicate];
		this.switchDesign(designId);
		this.touch();
		return designId;
	}

	removeDesign(id: string): void {
		if (!this.current || this.current.designs.length <= 1) return;
		this.current.designs = this.current.designs.filter((d) => d.id !== id);
		if (this.activeDesignId === id) {
			this.switchDesign(this.current.designs[0].id);
		}
		this.touch();
	}

	renameDesign(id: string, name: string): void {
		if (!this.current) return;
		this.current.designs = this.current.designs.map((d) =>
			d.id === id ? { ...d, name } : d
		);
		this.touch();
	}

	switchDesign(id: string): void {
		this.activeDesignId = id;
		history.clear();
	}

	private pushHistory(): void {
		if (this.activeDesign) {
			history.push(JSON.parse(JSON.stringify(this.activeDesign)));
		}
	}

	private touch(): void {
		if (this.current) {
			this.current.updatedAt = new Date().toISOString();
		}
		if (this.activeDesign) {
			this.activeDesign.updatedAt = new Date().toISOString();
		}
	}
}

export const project = new ProjectStore();
