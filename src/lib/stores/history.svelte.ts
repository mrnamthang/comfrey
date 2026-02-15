/**
 * Undo/redo history using design state snapshots.
 * Stores JSON-serialized Design objects (~15KB each), max 50 levels.
 */

import type { Design } from '$lib/types';

const MAX_HISTORY = 50;

class HistoryStore {
	undoStack = $state<string[]>([]);
	redoStack = $state<string[]>([]);

	canUndo = $derived(this.undoStack.length > 0);
	canRedo = $derived(this.redoStack.length > 0);

	/** Save current design state before a mutation. */
	push(design: Design): void {
		const snapshot = JSON.stringify(design);
		this.undoStack = [...this.undoStack.slice(-(MAX_HISTORY - 1)), snapshot];
		this.redoStack = [];
	}

	/** Undo: restore previous state, push current to redo stack. */
	undo(currentDesign: Design): Design | null {
		if (this.undoStack.length === 0) return null;
		const stack = [...this.undoStack];
		const snapshot = stack.pop()!;
		this.undoStack = stack;
		this.redoStack = [...this.redoStack, JSON.stringify(currentDesign)];
		return JSON.parse(snapshot);
	}

	/** Redo: restore next state, push current to undo stack. */
	redo(currentDesign: Design): Design | null {
		if (this.redoStack.length === 0) return null;
		const stack = [...this.redoStack];
		const snapshot = stack.pop()!;
		this.redoStack = stack;
		this.undoStack = [...this.undoStack, JSON.stringify(currentDesign)];
		return JSON.parse(snapshot);
	}

	/** Clear all history (e.g. when switching designs). */
	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
	}
}

export const history = new HistoryStore();
