class EditorStore {
	tool = $state<'select' | 'place' | 'draw'>('select');
	selectedElementId = $state<string | null>(null);
	placingType = $state<string | null>(null);
	showLayers = $state({ zones: true, elements: true, sunPath: false });
	sidebarPanel = $state<
		'library' | 'properties' | 'analysis' | 'advisor' | 'action-plan'
	>('library');
}

export const editor = new EditorStore();
