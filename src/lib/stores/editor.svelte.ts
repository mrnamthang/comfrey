class EditorStore {
	tool = $state<'select' | 'place' | 'draw' | 'measure'>('select');
	selectedElementId = $state<string | null>(null);
	placingType = $state<string | null>(null);
	showLayers = $state({ zones: true, elements: true, sunPath: false, sectors: false, waterFlow: false });
	sidebarPanel = $state<
		'library' | 'properties' | 'analysis' | 'advisor' | 'action-plan' | 'plants' | 'guilds' | 'ai-settings'
	>('library');
	measurePoints = $state<[number, number][]>([]);
	learnPanel = $state<'closed' | 'minimized' | 'open' | 'maximized'>('closed');

	clearMeasure(): void {
		this.measurePoints = [];
	}

	addMeasurePoint(lngLat: [number, number]): void {
		this.measurePoints = [...this.measurePoints, lngLat];
	}

	toggleLearnPanel(): void {
		this.learnPanel = this.learnPanel === 'closed' ? 'open' : 'closed';
	}
}

export const editor = new EditorStore();
